// backend/supabase/functions/sync-gmail/index.ts

// Manual Gmail Sync Function - Fetch recent emails on demand
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabase.ts';
import { decryptToken } from '../_shared/encryption.ts';

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get user from request
    const { user, error: authError } = await getUserFromRequest(req);
    
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401, null, req);
    }

    console.log('Syncing Gmail for user:', user.id);

    // Get user's Gmail integration
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('integration_type', 'gmail')
      .eq('status', 'active')
      .single();

    if (integrationError || !integration) {
      return createErrorResponse('Gmail integration not found', 404, null, req);
    }

    // Decrypt access token
    const accessToken = decryptToken(integration.access_token);

    // Fetch recent messages
    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!messagesResponse.ok) {
      const error = await messagesResponse.json();
      console.error('Gmail API error:', error);
      return createErrorResponse('Failed to fetch emails from Gmail', messagesResponse.status, error, req);
    }

    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];

    console.log(`Found ${messages.length} messages in inbox`);

    let newNotifications = 0;
    let existingNotifications = 0;

    // Process each message
    for (const message of messages) {
      const created = await createNotificationFromMessage(
        accessToken,
        integration.id,
        user.id,
        message.id
      );
      
      if (created) {
        newNotifications++;
      } else {
        existingNotifications++;
      }
    }

    console.log(`Sync complete: ${newNotifications} new, ${existingNotifications} existing`);

    return createResponse({
      success: true,
      message: 'Gmail synced successfully',
      total: messages.length,
      new: newNotifications,
      existing: existingNotifications,
    }, 200, req);

  } catch (error) {
    console.error('Sync error:', error);
    return createErrorResponse('Failed to sync Gmail', 500, (error as Error).message, req);
  }
});

async function createNotificationFromMessage(
  accessToken: string,
  integrationId: string,
  userId: string,
  messageId: string
): Promise<boolean> {
  try {
    // Check if notification already exists
    const { data: existing } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('source_id', messageId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return false; // Already exists
    }

    // Fetch message details
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch message ${messageId}`);
      return false;
    }

    const messageData = await response.json();

    // Extract headers
    const headers = messageData.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
    const date = headers.find((h: any) => h.name === 'Date')?.value;
    
    // Parse email address from "Name <email@example.com>" format
    const fromEmail = from.match(/<(.+?)>/)?.[1] || from;
    const fromName = from.replace(/<.+?>/, '').trim() || fromEmail;

    // Get snippet
    const snippet = messageData.snippet || '';

    // Create notification
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        integration_id: integrationId,
        title: subject,
        body: `From: ${fromName}\n\n${snippet}`,
        source: 'gmail',
        source_id: messageId,
        read: false,
        metadata: {
          message_id: messageId,
          subject,
          from: fromEmail,
          from_name: fromName,
          date,
          thread_id: messageData.threadId,
          labels: messageData.labelIds,
          internal_date: messageData.internalDate,
        },
        created_at: new Date(parseInt(messageData.internalDate)).toISOString(),
      });

    if (error) {
      console.error('Failed to create notification:', error);
      return false;
    }

    return true; // Successfully created
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}