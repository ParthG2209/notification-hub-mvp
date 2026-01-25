// frontend/src/services/oauth/oauthHandler.js

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
  // ✅ Add drive.metadata.readonly scope for changes API
  scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.email',
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
  
  // Store the exact redirect_uri we're using for this OAuth flow
  sessionStorage.setItem('oauth_redirect_uri', redirectUri);
  
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
      redirect_uri: redirectUri, // Include in state for verification
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

    console.log('Starting OAuth callback for:', integrationType);
    console.log('State data:', stateData);

    // Get current user session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session retrieval error:', sessionError);
      throw new Error('Failed to retrieve authentication session. Please try again.');
    }

    if (!sessionData?.session) {
      throw new Error('No active session found. Please log in again.');
    }

    const session = sessionData.session;

    // Verify the access token is valid
    if (!session.access_token || session.access_token.length < 20) {
      console.error('Invalid token:', {
        hasToken: !!session.access_token,
        length: session.access_token?.length
      });
      throw new Error('Invalid authentication token. Please log out and log in again.');
    }

    // Verify token hasn't expired
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    
    if (expiresAt && expiresAt <= now) {
      console.error('Token expired:', { expiresAt, now });
      throw new Error('Authentication token has expired. Please log out and log in again.');
    }

    console.log('Session validated:', {
      hasAccessToken: true,
      tokenLength: session.access_token.length,
      expiresIn: expiresAt - now,
      userId: session.user?.id
    });

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

    // CRITICAL: Use the EXACT same redirect_uri that was used in the OAuth initiation
    // Try to get it from state first, then from sessionStorage, then generate it
    const redirectUri = stateData.redirect_uri || 
                       sessionStorage.getItem('oauth_redirect_uri') || 
                       getRedirectUri();
    
    // Clean up
    sessionStorage.removeItem('oauth_redirect_uri');
    
    console.log('Calling edge function:', {
      url: edgeFunctionUrl,
      integrationType,
      redirectUri,
      accessTokenLength: session.access_token.length,
      userId: session.user?.id,
      codeLength: code?.length
    });

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        code,
        integration_type: integrationType,
        redirect_uri: redirectUri, // Send the exact same redirect_uri
      }),
    });

    const responseText = await response.text();
    console.log('Edge function response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }
      
      console.error('Edge function error:', errorData);
      
      // Provide better error messages
      if (response.status === 401) {
        throw new Error('Authentication failed. Your session may have expired. Please log out, log back in, and try connecting the integration again.');
      } else if (response.status === 400) {
        const errorMsg = errorData.details?.error_description || errorData.error || 'Invalid OAuth request';
        throw new Error(`OAuth failed: ${errorMsg}. Please try disconnecting and reconnecting the integration.`);
      } else if (response.status === 500) {
        throw new Error('Server error. Please try again in a moment.');
      } else {
        throw new Error(errorData.error || errorData.message || 'Failed to connect integration. Please try again.');
      }
    }

    const responseData = JSON.parse(responseText);
    console.log('OAuth callback successful:', responseData);
    return responseData;
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
    
    console.log(`Initiating OAuth flow for ${integrationType}...`);
    console.log('Redirect URI:', getRedirectUri());
    
    // Redirect to OAuth provider
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
    throw error;
  }
};