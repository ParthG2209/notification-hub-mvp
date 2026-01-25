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
    trashed?: boolean;
  };
  fileId?: string;
  removed?: boolean;
  changeType?: string;
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
      headers: Object.fromEntries(req.headers.entries()),
    });

    // Verify the webhook (basic verification)
    if (!channelId || !resourceState) {
      console.error('Invalid webhook request - missing headers');
      return createErrorResponse('Invalid webhook request', 400);
    }

    // Handle sync notification (initial setup confirmation)
    if (resourceState === 'sync') {
      console.log('Sync notification received - webhook verified by Google');
      return createResponse({ success: true, message: 'Sync acknowledged' });
    }

    // Extract user_id from channel_id (format: drive-{userId}-{timestamp})
    const userIdMatch = channelId.match(/drive-([a-f0-9-]+)-/);
    if (!userIdMatch) {
      console.error('Could not extract user ID from channel ID:', channelId);
      return createErrorResponse('Invalid channel ID format', 400);
    }

    const userId = userIdMatch[1];
    console.log('Processing webhook for user:', userId);

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

    console.log('Found integration:', {
      id: integration.id,
      hasToken: !!integration.access_token,
      hasPageToken: !!integration.metadata?.start_page_token,
    });

    // Decrypt access token
    const accessToken = decryptToken(integration.access_token);

    // Get the stored page token
    const pageToken = integration.metadata?.start_page_token || '1';

    console.log('Fetching changes from Google Drive...');

    // Fetch changed files from Google Drive API
    const changes = await fetchDriveChanges(accessToken, pageToken);

    console.log(`Found ${changes.length} changes`);

    // Create notifications for each change
    let notificationsCreated = 0;
    for (const change of changes) {
      const created = await createDriveNotification(userId, integration.id, change);
      if (created) notificationsCreated++;
    }

    console.log(`Created ${notificationsCreated} notifications for user ${userId}`);

    return createResponse({
      success: true,
      message: 'Webhook processed',
      changes: changes.length,
      notifications: notificationsCreated,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Stack:', (error as Error).stack);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});

// Fetch file changes from Google Drive
async function fetchDriveChanges(accessToken: string, startPageToken: string): Promise<DriveChange[]> {
  try {
    console.log('Fetching changes with pageToken:', startPageToken);
    
    const url = new URL('https://www.googleapis.com/drive/v3/changes');
    url.searchParams.append('pageToken', startPageToken);
    url.searchParams.append('pageSize', '100');
    url.searchParams.append('fields', 'changes(file(id,name,mimeType,modifiedTime,owners,trashed),fileId,removed,changeType),newStartPageToken');

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Drive API error:', error);
      throw new Error(`Drive API error: ${response.status} - ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    
    console.log('Drive API response:', {
      changesCount: data.changes?.length || 0,
      newStartPageToken: data.newStartPageToken,
    });

    // Filter out removed/trashed files
    const validChanges = (data.changes || []).filter((change: DriveChange) => 
      !change.removed && !change.file?.trashed && change.file
    );

    console.log(`Filtered to ${validChanges.length} valid changes (removed trashed/deleted)`);

    return validChanges;
  } catch (error) {
    console.error('Failed to fetch Drive changes:', error);
    console.error('Stack:', (error as Error).stack);
    return [];
  }
}

// Create notification for Drive change
async function createDriveNotification(userId: string, integrationId: string, change: DriveChange): Promise<boolean> {
  try {
    const file = change.file;
    
    if (!file) {
      console.log('No file in change, skipping');
      return false;
    }

    console.log('Processing file change:', {
      fileId: file.id,
      fileName: file.name,
      changeType: change.changeType,
    });

    // Check if notification already exists
    const { data: existing } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('source_id', file.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      console.log('Notification already exists for file:', file.id);
      return false;
    }

    // Determine change type
    const changeType = change.changeType || 'updated';
    const actionText = changeType === 'file' ? 'updated' : changeType;
    
    const title = `File ${actionText}: ${file.name}`;
    const body = `${file.name} was modified at ${new Date(file.modifiedTime).toLocaleString()}`;

    console.log('Creating notification:', {
      title,
      fileId: file.id,
    });

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
          change_type: changeType,
        },
      });

    if (error) {
      console.error('Failed to create notification:', error);
      return false;
    }

    console.log('✅ Notification created successfully for:', file.name);
    return true;
  } catch (error) {
    console.error('Failed to create notification:', error);
    console.error('Stack:', (error as Error).stack);
    return false;
  }
}