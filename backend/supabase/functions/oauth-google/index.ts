// Google OAuth Handler (Gmail + Google Drive)
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabase.ts';
import { validateOAuthCode, validateRequestBody } from '../_shared/validators.ts';
import { encryptToken, maskToken } from '../_shared/encryption.ts';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';

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
    console.log('Request headers:', {
      authorization: req.headers.get('Authorization') ? 'present' : 'missing',
      contentType: req.headers.get('Content-Type'),
      apikey: req.headers.get('apikey') ? 'present' : 'missing'
    });

    // Get user from request
    const { user, error: authError } = await getUserFromRequest(req);
    
    if (authError) {
      console.error('Auth error:', authError);
      return createErrorResponse(`Unauthorized: ${authError}`, 401, null, req);
    }
    
    if (!user) {
      console.error('No user found in request');
      return createErrorResponse('Unauthorized: No user found', 401, null, req);
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

    // Register webhook for Google Drive (if applicable)
    if (integration_type === 'google-drive') {
      try {
        await registerDriveWebhook(access_token, user.id);
        console.log('Drive webhook registered');
      } catch (webhookError) {
        console.error('Failed to register Drive webhook:', webhookError);
        // Don't fail the entire request if webhook registration fails
      }
    }

    console.log(`Google ${integration_type} connected successfully for user ${maskToken(user.id)}`);

    return createResponse({
      success: true,
      message: `${integration_type} connected successfully`,
      integration: {
        id: integration.id,
        type: integration.integration_type,
        status: integration.status,
        created_at: integration.created_at,
      },
    }, 200, req);

  } catch (error) {
    console.error('OAuth error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message, req);
  }
});

// Register webhook for Google Drive notifications
async function registerDriveWebhook(accessToken: string, userId: string): Promise<any> {
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