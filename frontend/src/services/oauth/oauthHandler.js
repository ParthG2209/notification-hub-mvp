// frontend/src/services/oauth/oauthHandler.js

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const REDIRECT_URI = import.meta.env.VITE_OAUTH_REDIRECT_URI;

// OAuth Configuration
const OAUTH_CONFIGS = {
  gmail: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // You'll need to expose this
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email',
    responseType: 'code',
  },
  'google-drive': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email',
    responseType: 'code',
  },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    clientId: 'YOUR_SLACK_CLIENT_ID',
    scope: 'channels:history,channels:read,chat:write,im:history,users:read',
    responseType: 'code',
  },
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    clientId: 'YOUR_HUBSPOT_CLIENT_ID',
    scope: 'crm.objects.contacts.read crm.objects.deals.read crm.objects.companies.read',
    responseType: 'code',
  },
};

/**
 * Generate OAuth authorization URL
 */
export const getOAuthUrl = (integrationType) => {
  const config = OAUTH_CONFIGS[integrationType];
  
  if (!config) {
    throw new Error(`Unknown integration type: ${integrationType}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: REDIRECT_URI,
    response_type: config.responseType,
    scope: config.scope,
    access_type: 'offline', // For Google to get refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    state: JSON.stringify({
      integration: integrationType,
      timestamp: Date.now(),
    }),
  });

  return `${config.authUrl}?${params.toString()}`;
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (code, state, supabase) => {
  try {
    const stateData = JSON.parse(state);
    const integrationType = stateData.integration;

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated');
    }

    // Call appropriate Edge Function to exchange code for tokens
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/oauth-${
      integrationType === 'google-drive' || integrationType === 'gmail' 
        ? 'google' 
        : integrationType
    }`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        integration_type: integrationType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'OAuth exchange failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
};

/**
 * Initiate OAuth flow
 */
export const initiateOAuth = (integrationType) => {
  const authUrl = getOAuthUrl(integrationType);
  
  // Store integration type in sessionStorage for callback
  sessionStorage.setItem('oauth_integration', integrationType);
  
  // Redirect to OAuth provider
  window.location.href = authUrl;
};