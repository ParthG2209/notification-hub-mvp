// Google OAuth Handler (Gmail + Google Drive)
import { corsHeaders, handleCors, createResponse, createErrorResponse } from '../_shared/cors.js';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabase.js';
import { validateOAuthCode, validateIntegrationType, validateRequestBody } from '../_shared/validators.js';
import { encryptToken, maskToken } from '../_shared/encryption.js';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get user from request
    const { user, error: authError } = await getUserFromRequest(req);
    
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Parse request body
    const body = await req.json();
    
    // Validate request body
    const bodyValidation = validateRequestBody(body, ['code', 'integration_type']);
    if (!bodyValidation.valid) {
      return createErrorResponse(bodyValidation.error, 400);
    }

    const { code, integration_type } = body;

    // Validate authorization code
    const codeValidation = validateOAuthCode(code);
    if (!codeValidation.valid) {
      return createErrorResponse(codeValidation.error, 400);
    }

    // Validate integration type (gmail or google-drive)
    if (!['gmail', 'google-drive'].includes(integration_type)) {
      return createErrorResponse('Invalid integration type for Google OAuth', 400);
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${FRONTEND_URL}/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Google token exchange failed:', error);
      return createErrorResponse('Failed to exchange authorization code', 400, error);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + (expires_in * 1000));

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(access_token);
    const encryptedRefreshToken = refresh_token ? encryptToken(refresh_token) : null;

    // Store integration in database
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
      return createErrorResponse('Failed to store integration', 500, dbError.message);
    }

    // Register webhook for Google Drive (if applicable)
    if (integration_type === 'google-drive') {
      try {
        await registerDriveWebhook(access_token, user.id);
      } catch (webhookError) {
        console.error('Failed to register Drive webhook:', webhookError);
        // Don't fail the entire request if webhook registration fails
      }
    }

    console.log(`Google ${integration_type} connected for user ${maskToken(user.id)}`);

    return createResponse({
      success: true,
      message: `${integration_type} connected successfully`,
      integration: {
        id: integration.id,
        type: integration.integration_type,
        status: integration.status,
        created_at: integration.created_at,
      },
    });

  } catch (error) {
    console.error('OAuth error:', error);
    return createErrorResponse('Internal server error', 500, error.message);
  }
});

// Register webhook for Google Drive notifications
async function registerDriveWebhook(accessToken, userId) {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const webhookUrl = `${SUPABASE_URL}/functions/v1/webhook-google-drive`;

  const response = await fetch('https://www.googleapis.com/drive/v3/files/root/watch', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: `drive-${userId}-${Date.now()}`,
      type: 'web_hook',
      address: webhookUrl,
      expiration: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to register Drive webhook: ${JSON.stringify(error)}`);
  }

  return await response.json();
}