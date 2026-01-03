import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase/client';
import { Button } from '../components/common/Button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Diagnostics() {
  const { user, session } = useAuth();
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnosticResults = {
      frontend: {},
      session: {},
      edgeFunction: {}
    };

    // Check frontend env vars
    diagnosticResults.frontend = {
      supabaseUrl: {
        exists: !!import.meta.env.VITE_SUPABASE_URL,
        value: import.meta.env.VITE_SUPABASE_URL,
        status: import.meta.env.VITE_SUPABASE_URL ? 'ok' : 'error'
      },
      supabaseAnonKey: {
        exists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        value: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        status: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'ok' : 'error'
      },
      googleClientId: {
        exists: !!import.meta.env.VITE_GOOGLE_CLIENT_ID,
        value: import.meta.env.VITE_GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
        status: import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'ok' : 'error'
      },
      redirectUri: {
        value: import.meta.env.VITE_OAUTH_REDIRECT_URI || `${window.location.origin}/auth/callback`,
        status: 'ok'
      }
    };

    // Check session
    try {
      const { data: sessionData, error } = await supabase.auth.getSession();
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = sessionData?.session?.expires_at;
      const timeUntilExpiry = expiresAt ? expiresAt - now : 0;

      diagnosticResults.session = {
        exists: !!sessionData?.session,
        hasAccessToken: !!sessionData?.session?.access_token,
        tokenLength: sessionData?.session?.access_token?.length || 0,
        expiresAt: expiresAt,
        now: now,
        timeUntilExpiry: timeUntilExpiry,
        expired: timeUntilExpiry <= 0,
        user: sessionData?.session?.user?.email,
        error: error?.message || null,
        status: sessionData?.session && timeUntilExpiry > 0 ? 'ok' : 'error'
      };
    } catch (error) {
      diagnosticResults.session = {
        error: error.message,
        status: 'error'
      };
    }

    // Test edge function connectivity
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (session?.access_token) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-google`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              code: 'test_code_for_diagnostics',
              integration_type: 'gmail',
              redirect_uri: `${window.location.origin}/auth/callback`
            })
          }
        );

        const responseText = await response.text();
        
        diagnosticResults.edgeFunction = {
          status: response.status === 401 ? 'warning' : response.status === 400 ? 'ok' : 'error',
          statusCode: response.status,
          statusText: response.statusText,
          response: responseText.substring(0, 200),
          note: response.status === 400 ? 'Expected 400 (bad code) - this is OK, means auth worked!' : 
                response.status === 401 ? 'Authentication failed - this is the issue!' : 
                'Unexpected response'
        };
      } else {
        diagnosticResults.edgeFunction = {
          status: 'error',
          error: 'No access token available'
        };
      }
    } catch (error) {
      diagnosticResults.edgeFunction = {
        status: 'error',
        error: error.message
      };
    }

    setResults(diagnosticResults);
    setTesting(false);
  };

  const StatusIcon = ({ status }) => {
    if (status === 'ok') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'warning') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-agency-gradient text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Diagnostics</h1>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="mb-4">
            <p className="text-gray-400 mb-2">Current User: {user?.email || 'Not logged in'}</p>
            <p className="text-gray-400">User ID: {user?.id || 'N/A'}</p>
          </div>

          <Button onClick={runDiagnostics} disabled={testing}>
            {testing ? 'Running Diagnostics...' : 'Run Diagnostics'}
          </Button>
        </div>

        {results && (
          <div className="space-y-6">
            {/* Frontend Config */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Frontend Configuration</h2>
              <div className="space-y-3">
                {Object.entries(results.frontend).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between border-b border-white/10 pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{key}</p>
                      <p className="text-sm text-gray-400 break-all">{value.value || 'N/A'}</p>
                    </div>
                    <StatusIcon status={value.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Session Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Session Information
                <StatusIcon status={results.session.status} />
              </h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Session exists:</span> {results.session.exists ? 'Yes' : 'No'}</p>
                <p><span className="text-gray-400">Has access token:</span> {results.session.hasAccessToken ? 'Yes' : 'No'}</p>
                <p><span className="text-gray-400">Token length:</span> {results.session.tokenLength} characters</p>
                <p><span className="text-gray-400">Time until expiry:</span> {results.session.timeUntilExpiry} seconds</p>
                <p><span className="text-gray-400">Expired:</span> {results.session.expired ? 'YES ⚠️' : 'No'}</p>
                <p><span className="text-gray-400">User:</span> {results.session.user || 'N/A'}</p>
                {results.session.error && (
                  <p className="text-red-400"><span className="text-gray-400">Error:</span> {results.session.error}</p>
                )}
              </div>
            </div>

            {/* Edge Function Test */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Edge Function Test
                <StatusIcon status={results.edgeFunction.status} />
              </h2>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Status Code:</span> {results.edgeFunction.statusCode}</p>
                <p><span className="text-gray-400">Status Text:</span> {results.edgeFunction.statusText}</p>
                {results.edgeFunction.note && (
                  <p className="text-yellow-400 mt-2">ℹ️ {results.edgeFunction.note}</p>
                )}
                {results.edgeFunction.response && (
                  <div className="mt-3">
                    <p className="text-gray-400 mb-1">Response:</p>
                    <pre className="bg-black/30 p-3 rounded text-xs overflow-auto">
                      {results.edgeFunction.response}
                    </pre>
                  </div>
                )}
                {results.edgeFunction.error && (
                  <p className="text-red-400"><span className="text-gray-400">Error:</span> {results.edgeFunction.error}</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Recommendations</h2>
              <ul className="space-y-2 text-sm">
                {results.session.expired && (
                  <li className="text-yellow-400">⚠️ Your session has expired. Log out and log back in.</li>
                )}
                {!results.session.hasAccessToken && (
                  <li className="text-red-400">❌ No access token found. Please log in.</li>
                )}
                {results.session.tokenLength < 20 && results.session.hasAccessToken && (
                  <li className="text-red-400">❌ Access token is too short. This indicates an authentication issue.</li>
                )}
                {results.edgeFunction.statusCode === 401 && (
                  <li className="text-red-400">
                    ❌ Edge function returns 401. Check:
                    <ul className="ml-4 mt-1">
                      <li>- FRONTEND_URL is set in Supabase Edge Function secrets</li>
                      <li>- Edge Functions have been redeployed after setting secrets</li>
                      <li>- Your Supabase JWT is valid and not expired</li>
                    </ul>
                  </li>
                )}
                {results.edgeFunction.statusCode === 400 && (
                  <li className="text-green-400">✅ Authentication is working! The 400 error is expected (bad test code).</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}