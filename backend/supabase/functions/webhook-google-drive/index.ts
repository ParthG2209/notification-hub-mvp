// Google Drive Webhook Handler
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { decryptToken } from '../_shared/encryption.ts';

interface DriveChange {
  file?: {
    id: string;
    name: string;
    mimeType: string;
    modifiedTime: string;
    owners: any[];
  };
  type?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Google sends notifications via headers
    const channelId = req.headers.get('X-Goog-Channel-ID');
    const resourceState = req.headers.get('X-Goog-Resource-State');
    const resourceId = req.headers.get('X-Goog-Resource-ID');

    console.log('Drive webhook received:', {
      channelId,
      resourceState,
      resourceId,
    });

    // Verify the webhook (basic verification)
    if (!channelId || !resourceState) {
      return createErrorResponse('Invalid webhook request', 400);
    }

    // Handle sync notification (initial setup confirmation)
    if (resourceState === 'sync') {
      console.log('Sync notification received');
      return createResponse({ success: true, message: 'Sync acknowledged' });
    }

    // Extract user_id from channel_id (format: drive-{userId}-{timestamp})
    const userIdMatch = channelId.match(/drive-([a-f0-9-]+)-/);
    if (!userIdMatch) {
      console.error('Could not extract user ID from channel ID:', channelId);
      return createErrorResponse('Invalid channel ID format', 400);
    }

    const userId = userIdMatch[1];

    // Get the integration for this user
    const { data: integration, error: integrationError } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', 'google-drive')
      .eq('status', 'active')
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return createErrorResponse('Integration not found', 404);
    }

    // Decrypt access token
    const accessToken = decryptToken(integration.access_token);

    // Fetch changed files from Google Drive API
    const changes = await fetchDriveChanges(accessToken, resourceId || '1');

    // Create notifications for each change
    for (const change of changes) {
      await createDriveNotification(userId, integration.id, change);
    }

    console.log(`Processed ${changes.length} Drive changes for user ${userId}`);

    return createResponse({
      success: true,
      message: 'Webhook processed',
      changes: changes.length,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});

// Fetch file changes from Google Drive
async function fetchDriveChanges(accessToken: string, startPageToken: string): Promise<DriveChange[]> {
  try {
    const url = new URL('https://www.googleapis.com/drive/v3/changes');
    url.searchParams.append('pageToken', startPageToken);
    url.searchParams.append('pageSize', '100');
    url.searchParams.append('fields', 'changes(file(id,name,mimeType,modifiedTime,owners)),newStartPageToken');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status}`);
    }

    const data = await response.json();
    return data.changes || [];
  } catch (error) {
    console.error('Failed to fetch Drive changes:', error);
    return [];
  }
}

// Create notification for Drive change
async function createDriveNotification(userId: string, integrationId: string, change: DriveChange): Promise<void> {
  const file = change.file;
  
  if (!file) {
    return;
  }

  const title = `File ${change.type || 'updated'}: ${file.name}`;
  const body = `${file.name} was modified at ${new Date(file.modifiedTime).toLocaleString()}`;

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      integration_id: integrationId,
      title,
      body,
      source: 'google-drive',
      source_id: file.id,
      read: false,
      metadata: {
        file_id: file.id,
        file_name: file.name,
        mime_type: file.mimeType,
        modified_time: file.modifiedTime,
        owners: file.owners,
        change_type: change.type,
      },
    });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}