// backend/supabase/functions/webhook-gmail/index.ts

// Gmail Push Notification Webhook Handler
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { decryptToken } from '../_shared/encryption.ts';

interface GmailPushNotification {
  message: {
    data: string; // Base64 encoded JSON
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const payload: GmailPushNotification = await req.json();
    
    console.log('Gmail webhook received:', payload);

    // Decode the push notification data
    const decodedData = JSON.parse(atob(payload.message.data));
    const { emailAddress, historyId } = decodedData;

    console.log('Gmail notification for:', emailAddress);

    // Find the user's Gmail integration
    const { data: integrations, error } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('integration_type', 'gmail')
      .eq('status', 'active');

    if (error || !integrations || integrations.length === 0) {
      console.error('No active Gmail integrations found');
      return createResponse({ success: true, message: 'No integrations found' });
    }

    // Find matching integration by email in metadata
    const integration = integrations.find(int => 
      int.metadata?.email === emailAddress
    );

    if (!integration) {
      console.error('No matching integration for email:', emailAddress);
      return createResponse({ success: true, message: 'No matching integration' });
    }

    // Decrypt access token
    const accessToken = decryptToken(integration.access_token);

    // Fetch new messages
    await fetchAndCreateNotifications(accessToken, integration, historyId);

    return createResponse({ success: true, message: 'Notifications processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});

async function fetchAndCreateNotifications(
  accessToken: string,
  integration: any,
  historyId?: string
): Promise<void> {
  try {
    // Fetch recent messages (last 10)
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&labelIds=INBOX`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status}`);
    }

    const data = await response.json();
    const messages = data.messages || [];

    console.log(`Fetched ${messages.length} messages`);

    // Fetch details for each message
    for (const message of messages) {
      await processMessage(accessToken, integration, message.id);
    }
  } catch (error) {
    console.error('Failed to fetch Gmail messages:', error);
  }
}

async function processMessage(
  accessToken: string,
  integration: any,
  messageId: string
): Promise<void> {
  try {
    // Check if notification already exists
    const { data: existing } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('source_id', messageId)
      .eq('user_id', integration.user_id)
      .single();

    if (existing) {
      console.log('Notification already exists for message:', messageId);
      return;
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
      throw new Error(`Failed to fetch message ${messageId}`);
    }

    const messageData = await response.json();

    // Extract email details
    const headers = messageData.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
    const date = headers.find((h: any) => h.name === 'Date')?.value;

    // Get snippet (preview text)
    const snippet = messageData.snippet || '';

    // Create notification
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: integration.user_id,
        integration_id: integration.id,
        title: `New email: ${subject}`,
        body: `From: ${from}\n${snippet}`,
        source: 'gmail',
        source_id: messageId,
        read: false,
        metadata: {
          message_id: messageId,
          subject,
          from,
          date,
          thread_id: messageData.threadId,
          labels: messageData.labelIds,
        },
      });

    if (error) {
      console.error('Failed to create notification:', error);
    } else {
      console.log('Created notification for message:', messageId);
    }
  } catch (error) {
    console.error('Failed to process message:', error);
  }
}