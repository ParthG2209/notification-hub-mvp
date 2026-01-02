const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// Dynamically determine redirect URI based on current domain
const getRedirectUri = () => {
  // If explicitly set in env, use that
  if (import.meta.env.VITE_OAUTH_REDIRECT_URI) {
    return import.meta.env.VITE_OAUTH_REDIRECT_URI;
  }
  
  // Otherwise, use current origin + callback path
  return `${window.location.origin}/auth/callback`;
};

const REDIRECT_URI = getRedirectUri();

// OAuth Client IDs from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SLACK_CLIENT_ID = import.meta.env.VITE_SLACK_CLIENT_ID;
const HUBSPOT_CLIENT_ID = import.meta.env.VITE_HUBSPOT_CLIENT_ID;

// Validate that required env vars are present
if (!GOOGLE_CLIENT_ID) {
  console.error('VITE_GOOGLE_CLIENT_ID is not configured in .env.local');
}

// OAuth Configuration
const OAUTH_CONFIGS = {
  gmail: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email',
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent',
  },
  'google-drive': {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email',
    responseType: 'code',
    accessType: 'offline',
    prompt: 'consent',
  },
  slack: {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    clientId: SLACK_CLIENT_ID,
    scope: 'channels:history,channels:read,chat:write,im:history,users:read',
    responseType: 'code',
  },
  hubspot: {
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    clientId: HUBSPOT_CLIENT_ID,
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

  if (!config.clientId) {
    throw new Error(`Client ID not configured for ${integrationType}. Please add VITE_${integrationType.toUpperCase().replace('-', '_')}_CLIENT_ID to your .env.local file.`);
  }

  // Get current redirect URI dynamically
  const redirectUri = getRedirectUri();
  
  console.log(`OAuth Config for ${integrationType}:`, {
    redirectUri,
    clientId: config.clientId?.substring(0, 20) + '...',
  });

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: config.responseType,
    scope: config.scope,
    state: JSON.stringify({
      integration: integrationType,
      timestamp: Date.now(),
    }),
  });

  // Add Google-specific parameters
  if (integrationType === 'gmail' || integrationType === 'google-drive') {
    params.append('access_type', config.accessType);
    params.append('prompt', config.prompt);
  }

  const authUrl = `${config.authUrl}?${params.toString()}`;
  console.log('Generated OAuth URL:', authUrl);
  
  return authUrl;
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
      throw new Error('Not authenticated. Please log in first.');
    }

    // Determine which edge function to call
    let edgeFunctionName;
    if (integrationType === 'google-drive' || integrationType === 'gmail') {
      edgeFunctionName = 'oauth-google';
    } else if (integrationType === 'slack') {
      edgeFunctionName = 'oauth-slack';
    } else if (integrationType === 'hubspot') {
      edgeFunctionName = 'oauth-hubspot';
    } else {
      throw new Error(`Unsupported integration type: ${integrationType}`);
    }

    // Call Edge Function to exchange code for tokens
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/${edgeFunctionName}`;

    // Get current redirect URI to send to backend
    const redirectUri = getRedirectUri();
    
    console.log('Calling edge function:', {
      url: edgeFunctionUrl,
      integrationType,
      redirectUri,
    });

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        integration_type: integrationType,
        redirect_uri: redirectUri, // Send current redirect URI
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Edge function error:', error);
      throw new Error(error.error || error.message || 'OAuth exchange failed');
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
  try {
    const authUrl = getOAuthUrl(integrationType);
    
    // Store integration type in sessionStorage for callback
    sessionStorage.setItem('oauth_integration', integrationType);
    
    console.log(`Redirecting to OAuth provider for ${integrationType}...`);
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
    throw error;
  }
};