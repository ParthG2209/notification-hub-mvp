// backend/supabase/functions/oauth-google/index.ts

// Google OAuth Handler (Gmail + Google Drive)
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { validateOAuthCode, validateRequestBody } from '../_shared/validators.ts';
import { encryptToken, maskToken } from '../_shared/encryption.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Manual JWT verification function
async function verifyUserToken(req: Request): Promise<{ user: any | null; error: string | null }> {
  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return { user: null, error: 'No authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token || token.length < 20) {
      return { user: null, error: 'Invalid token format' };
    }

    // Create a client with the user's token to verify it
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the token by getting the user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Token verification error:', error);
      return { user: null, error: error.message };
    }

    if (!user) {
      return { user: null, error: 'User not found' };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Exception verifying token:', error);
    return { user: null, error: (error as Error).message };
  }
}

Deno.serve(async (req: Request) => {
  console.log('=== OAuth Google Function Called ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request origin:', req.headers.get('origin'));

  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    console.log('Returning CORS preflight response');
    return corsResponse;
  }

  try {
    console.log('Processing OAuth request...');

    // MANUAL TOKEN VERIFICATION
    const { user, error: authError } = await verifyUserToken(req);

    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      return createErrorResponse(
        `Unauthorized: ${authError || 'No user found'}`,
        401,
        { detail: 'JWT verification failed', authError },
        req
      );
    }

    console.log('User authenticated:', {
      userId: user.id,
      email: user.email
    });

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body parsed:', {
        hasCode: !!body.code,
        integrationType: body.integration_type,
        hasRedirectUri: !!body.redirect_uri
      });
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return createErrorResponse('Invalid JSON in request body', 400, null, req);
    }

    // Validate request body
    const bodyValidation = validateRequestBody(body, ['code', 'integration_type']);
    if (!bodyValidation.valid) {
      console.error('Body validation failed:', bodyValidation.error);
      return createErrorResponse(bodyValidation.error!, 400, null, req);
    }

    const { code, integration_type, redirect_uri } = body;

    // Validate authorization code
    const codeValidation = validateOAuthCode(code);
    if (!codeValidation.valid) {
      console.error('Code validation failed:', codeValidation.error);
      return createErrorResponse(codeValidation.error!, 400, null, req);
    }

    // Validate integration type (gmail or google-drive)
    if (!['gmail', 'google-drive'].includes(integration_type)) {
      return createErrorResponse('Invalid integration type for Google OAuth', 400, null, req);
    }

    // Use the redirect_uri from the request, fallback to FRONTEND_URL
    const actualRedirectUri = redirect_uri || `${FRONTEND_URL}/auth/callback`;

    console.log('OAuth exchange parameters:', {
      integrationType: integration_type,
      redirectUri: actualRedirectUri,
      userId: user.id
    });
    console.log('About to exchange code with Google:', {
      codeLength: code?.length,
      redirectUri: actualRedirectUri,
      integrationType: integration_type,
      clientIdPrefix: GOOGLE_CLIENT_ID?.substring(0, 20) + '...'
    });
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: actualRedirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Google token exchange failed:', {
        status: tokenResponse.status,
        error
      });
      return createErrorResponse('Failed to exchange authorization code', 400, error, req);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });

    const { access_token, refresh_token, expires_in } = tokenData;

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + (expires_in * 1000));

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(access_token);
    const encryptedRefreshToken = refresh_token ? encryptToken(refresh_token) : null;

    // Store integration in database
    console.log('Storing integration in database...');
    const { data: integration, error: dbError } = await supabaseAdmin
      .from('integrations')
      .upsert({
        user_id: user.id,
        integration_type,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt.toISOString(),
        status: 'active',
        metadata: {
          scopes: tokenData.scope?.split(' ') || [],
          token_type: tokenData.token_type,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,integration_type'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return createErrorResponse('Failed to store integration', 500, dbError.message, req);
    }

    console.log('Integration stored successfully:', {
      integrationId: integration.id,
      type: integration_type
    });

    // Register webhook and fetch initial emails for Gmail
    if (integration_type === 'gmail') {
      try {
        // Fetch user's email address
        const profileResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        });
        
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          
          // Update integration metadata with email
          await supabaseAdmin
            .from('integrations')
            .update({
              metadata: {
                ...integration.metadata,
                email: profile.emailAddress,
              },
            })
            .eq('id', integration.id);
          
          console.log('Gmail profile updated:', profile.emailAddress);
        }

        // Fetch initial emails
        console.log('Fetching initial Gmail messages...');
        await fetchInitialGmailMessages(access_token, integration.id, user.id);
        console.log('Initial Gmail messages fetched');

        // Note: Gmail push notifications require Google Cloud Pub/Sub setup
        // For now, users can use the manual sync button
      } catch (gmailError) {
        console.error('Failed to set up Gmail:', gmailError);
        // Don't fail the entire request if initial fetch fails
      }
    }

    // Register webhook for Google Drive (if applicable)
    // Register webhook for Google Drive (if applicable)
if (integration_type === 'google-drive') {
  try {
    // ✅ Pass integrationId as third parameter
    const webhookData = await registerDriveWebhook(access_token, user.id, integration.id);
    console.log('Drive webhook registered successfully:', webhookData);
  } catch (webhookError) {
    console.error('Failed to register Drive webhook:', webhookError);
    
    // ✅ Store the error in metadata so you can see it
    await supabaseAdmin
      .from('integrations')
      .update({
        metadata: {
          scopes: tokenData.scope?.split(' ') || [],
          token_type: tokenData.token_type,
          webhook_error: String(webhookError.message || webhookError),
          webhook_error_at: new Date().toISOString(),
        }
      })
      .eq('id', integration.id);
    
    // ⚠️ Don't throw - let user connect even if webhooks fail
    console.log('Integration connected but webhooks unavailable');
  }
}

// Register webhook for Google Drive notifications
async function registerDriveWebhook(accessToken: string, userId: string, integrationId: string): Promise<any> {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const webhookUrl = `${SUPABASE_URL}/functions/v1/webhook-google-drive`;

  console.log('Registering Drive webhook:', {
    userId,
    webhookUrl,
    integrationId
  });

  // ✅ First, get the current start page token (required for changes API)
  const tokenResponse = await fetch(
    'https://www.googleapis.com/drive/v3/changes/startPageToken',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json();
    console.error('Failed to get start page token:', error);
    throw new Error(`Failed to get start page token: ${JSON.stringify(error)}`);
  }

  const tokenData = await tokenResponse.json();
  const startPageToken = tokenData.startPageToken;

  console.log('Got start page token:', startPageToken);

  // ✅ Now register the webhook to watch changes
  const channelId = `drive-${userId}-${Date.now()}`;
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/changes/watch?pageToken=${startPageToken}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
        expiration: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to register Drive webhook:', error);
    throw new Error(`Failed to register Drive webhook: ${JSON.stringify(error)}`);
  }

  const webhookData = await response.json();
  
  console.log('Webhook registered successfully:', webhookData);

  // ✅ IMPORTANT: Store webhook metadata in the database
  const { error: updateError } = await supabaseAdmin
    .from('integrations')
    .update({
      metadata: {
        scopes: tokenData.scope?.split(' ') || [],
        token_type: 'Bearer',
        // Add webhook info
        webhook_channel_id: webhookData.id,
        webhook_resource_id: webhookData.resourceId,
        webhook_expiration: webhookData.expiration,
        webhook_registered_at: new Date().toISOString(),
        start_page_token: startPageToken,
      }
    })
    .eq('id', integrationId);

  if (updateError) {
    console.error('Failed to update integration metadata:', updateError);
    throw new Error(`Failed to store webhook metadata: ${updateError.message}`);
  }

  return webhookData;
}
// Fetch initial Gmail messages
async function fetchInitialGmailMessages(accessToken: string, integrationId: string, userId: string): Promise<void> {
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

    console.log(`Fetched ${messages.length} initial messages`);

    // Fetch details for each message and create notifications
    for (const message of messages) {
      await createGmailNotification(accessToken, integrationId, userId, message.id);
    }
  } catch (error) {
    console.error('Failed to fetch initial Gmail messages:', error);
    throw error;
  }
}

// Create notification from Gmail message
async function createGmailNotification(
  accessToken: string,
  integrationId: string,
  userId: string,
  messageId: string
): Promise<void> {
  try {
    // Check if notification already exists
    const { data: existing } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('source_id', messageId)
      .eq('user_id', userId)
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
      console.error(`Failed to fetch message ${messageId}:`, response.status);
      return;
    }

    const messageData = await response.json();

    // Extract email details
    const headers = messageData.payload.headers;
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
    const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
    const date = headers.find((h: any) => h.name === 'Date')?.value;

    // Parse email address from "Name <email@example.com>" format
    const fromEmail = from.match(/<(.+?)>/)?.[1] || from;
    const fromName = from.replace(/<.+?>/, '').trim() || fromEmail;

    // Get snippet (preview text)
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
    } else {
      console.log('Created notification for message:', messageId, 'Subject:', subject);
    }
  } catch (error) {
    console.error('Failed to process message:', error);
  }
}