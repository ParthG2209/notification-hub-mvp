// Slack OAuth Handler
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin, getUserFromRequest } from '../_shared/supabase.ts';
import { validateOAuthCode, validateRequestBody } from '../_shared/validators.ts';
import { encryptToken, maskToken } from '../_shared/encryption.ts';

const SLACK_CLIENT_ID = Deno.env.get('SLACK_CLIENT_ID');
const SLACK_CLIENT_SECRET = Deno.env.get('SLACK_CLIENT_SECRET');
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
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: SLACK_CLIENT_ID!,
        client_secret: SLACK_CLIENT_SECRET!,
        redirect_uri: `${FRONTEND_URL}/auth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData);
      return createErrorResponse('Failed to exchange authorization code', 400, tokenData.error);
    }

    const { access_token, team, authed_user, scope, bot_user_id } = tokenData;

    // Slack tokens don't typically expire, but we'll set a far future date
    const expiresAt = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 year

    // Encrypt token before storing
    const encryptedAccessToken = encryptToken(access_token);

    // Store integration in database
    const { data: integration, error: dbError } = await supabaseAdmin
      .from('integrations')
      .upsert({
        user_id: user.id,
        integration_type: 'slack',
        access_token: encryptedAccessToken,
        refresh_token: null, // Slack doesn't use refresh tokens
        token_expires_at: expiresAt.toISOString(),
        status: 'active',
        metadata: {
          team_id: team?.id,
          team_name: team?.name,
          authed_user_id: authed_user?.id,
          bot_user_id,
          scopes: scope?.split(',') || [],
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

    console.log(`Slack connected for user ${maskToken(user.id)}, team: ${team?.name}`);

    return createResponse({
      success: true,
      message: 'Slack connected successfully',
      integration: {
        id: integration.id,
        type: integration.integration_type,
        status: integration.status,
        team: team?.name,
        created_at: integration.created_at,
      },
    });

  } catch (error) {
    console.error('OAuth error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});