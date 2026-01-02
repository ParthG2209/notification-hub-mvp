// frontend/src/pages/OAuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase/client';
import { handleOAuthCallback } from '../services/oauth/oauthHandler';
import { useToast } from '../components/common/Toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if this is a Supabase Auth callback (Google/GitHub social login)
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Check if user is authenticated via Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        // If session exists but no OAuth code, this is Supabase social auth
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (session && !code) {
          // Supabase social auth successful
          setStatus('success');
          toast.success('Signed in successfully!');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
          return;
        }

        // Handle OAuth integration callback
        if (code && state) {
          setStatus('processing');
          const result = await handleOAuthCallback(code, state, supabase);
          
          setStatus('success');
          toast.success(result.message || 'Integration connected successfully!');
          
          // Redirect to integrations page after success
          setTimeout(() => navigate('/integrations', { replace: true }), 1500);
        } else if (session) {
          // Has session but no OAuth params, go to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Missing required parameters');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        toast.error(error.message || 'Authentication failed');
        
        // Redirect to login after error
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-agency-gradient text-white">
      <div className="text-center max-w-md px-6">
        {status === 'processing' && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <div className="inline-block p-6 bg-blue-500/20 rounded-full">
                <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Completing authentication...</h2>
            <p className="text-gray-400">Please wait while we set up your integration</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="inline-block p-6 bg-green-500/20 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 text-green-400">Success!</h2>
            <p className="text-gray-400">Redirecting you now...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="inline-block p-6 bg-red-500/20 rounded-full">
                <XCircle className="h-16 w-16 text-red-400" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Authentication Failed</h2>
            <p className="text-gray-400">Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
}