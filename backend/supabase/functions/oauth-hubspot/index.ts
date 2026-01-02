// HubSpot OAuth Handler
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabase.ts';
import { validateOAuthCode, validateRequestBody } from '../_shared/validators.ts';
import { encryptToken, maskToken } from '../_shared/encryption.ts';

const HUBSPOT_CLIENT_ID = Deno.env.get('HUBSPOT_CLIENT_ID');
const HUBSPOT_CLIENT_SECRET = Deno.env.get('HUBSPOT_CLIENT_SECRET');
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';

Deno.serve(async (req: Request) => {
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
    const bodyValidation = validateRequestBody(body, ['code']);
    if (!bodyValidation.valid) {
      return createErrorResponse(bodyValidation.error!, 400);
    }

    const { code } = body;

    // Validate authorization code
    const codeValidation = validateOAuthCode(code);
    if (!codeValidation.valid) {
      return createErrorResponse(codeValidation.error!, 400);
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: HUBSPOT_CLIENT_ID!,
        client_secret: HUBSPOT_CLIENT_SECRET!,
        redirect_uri: `${FRONTEND_URL}/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('HubSpot token exchange failed:', error);
      return createErrorResponse('Failed to exchange authorization code', 400, error);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + (expires_in * 1000));

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(access_token);
    const encryptedRefreshToken = refresh_token ? encryptToken(refresh_token) : null;

    // Get HubSpot account info
    let accountInfo: any = {};
    try {
      const accountResponse = await fetch('https://api.hubapi.com/account-info/v3/api-usage/daily', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      if (accountResponse.ok) {
        accountInfo = await accountResponse.json();
      }
    } catch (error) {
      console.error('Failed to get HubSpot account info:', error);
    }

    // Store integration in database
    const { data: integration, error: dbError } = await supabaseAdmin
      .from('integrations')
      .upsert({
        user_id: user.id,
        integration_type: 'hubspot',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: expiresAt.toISOString(),
        status: 'active',
        metadata: {
          token_type: tokenData.token_type,
          hub_id: tokenData.hub_id,
          hub_domain: tokenData.hub_domain,
          app_id: tokenData.app_id,
          account_info: accountInfo,
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

    console.log(`HubSpot connected for user ${maskToken(user.id)}, hub: ${tokenData.hub_domain}`);

    return createResponse({
      success: true,
      message: 'HubSpot connected successfully',
      integration: {
        id: integration.id,
        type: integration.integration_type,
        status: integration.status,
        hub_domain: tokenData.hub_domain,
        created_at: integration.created_at,
      },
    });

  } catch (error) {
    console.error('OAuth error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});