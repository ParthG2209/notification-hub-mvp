// Token Refresh Function (Cron Job)
// This function should be called periodically (e.g., every hour) to refresh expired tokens
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { encryptToken, decryptToken, maskToken } from '../_shared/encryption.ts';

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const HUBSPOT_CLIENT_ID = Deno.env.get('HUBSPOT_CLIENT_ID');
const HUBSPOT_CLIENT_SECRET = Deno.env.get('HUBSPOT_CLIENT_SECRET');

interface Integration {
  id: string;
  user_id: string;
  integration_type: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string;
}

interface TokenData {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('Starting token refresh job...');

    // Get expired tokens using database function
    const { data: expiredIntegrations, error } = await supabaseAdmin
      .rpc('get_expired_tokens');

    if (error) {
      console.error('Error fetching expired tokens:', error);
      return createErrorResponse('Failed to fetch expired tokens', 500);
    }

    if (!expiredIntegrations || expiredIntegrations.length === 0) {
      console.log('No expired tokens to refresh');
      return createResponse({ 
        success: true, 
        message: 'No tokens to refresh',
        refreshed: 0
      });
    }

    console.log(`Found ${expiredIntegrations.length} tokens to refresh`);

    const results = {
      refreshed: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Refresh each expired token
    for (const integration of expiredIntegrations as Integration[]) {
      try {
        await refreshToken(integration);
        results.refreshed++;
        console.log(`Refreshed token for ${integration.integration_type} integration ${maskToken(integration.id)}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          integration_id: integration.id,
          type: integration.integration_type,
          error: (error as Error).message,
        });
        console.error(`Failed to refresh token for ${integration.integration_type}:`, error);
      }
    }

    return createResponse({
      success: true,
      message: 'Token refresh completed',
      ...results,
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});

// Refresh token for an integration
async function refreshToken(integration: Integration): Promise<void> {
  const { id, integration_type, refresh_token } = integration;

  if (!refresh_token) {
    throw new Error('No refresh token available');
  }

  const decryptedRefreshToken = decryptToken(refresh_token);

  let newTokenData: TokenData;

  switch (integration_type) {
    case 'gmail':
    case 'google-drive':
      newTokenData = await refreshGoogleToken(decryptedRefreshToken);
      break;
    
    case 'hubspot':
      newTokenData = await refreshHubSpotToken(decryptedRefreshToken);
      break;
    
    case 'slack':
      // Slack tokens don't expire, so we don't need to refresh
      console.log('Slack tokens do not require refresh');
      return;
    
    default:
      throw new Error(`Unsupported integration type: ${integration_type}`);
  }

  // Calculate new expiration time
  const expiresAt = new Date(Date.now() + (newTokenData.expires_in * 1000));

  // Encrypt new tokens
  const encryptedAccessToken = encryptToken(newTokenData.access_token);
  const encryptedRefreshToken = newTokenData.refresh_token 
    ? encryptToken(newTokenData.refresh_token) 
    : refresh_token; // Use old refresh token if new one not provided

  // Update database
  const { error } = await supabaseAdmin
    .from('integrations')
    .update({
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: expiresAt.toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw new Error(`Database update failed: ${error.message}`);
  }
}

// Refresh Google OAuth token
async function refreshGoogleToken(refreshToken: string): Promise<TokenData> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Google token refresh failed: ${error.error_description || error.error}`);
  }

  return await response.json();
}

// Refresh HubSpot OAuth token
async function refreshHubSpotToken(refreshToken: string): Promise<TokenData> {
  const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: HUBSPOT_CLIENT_ID!,
      client_secret: HUBSPOT_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`HubSpot token refresh failed: ${error.message || 'Unknown error'}`);
  }

  return await response.json();
}