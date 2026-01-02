import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase/client';
import { handleOAuthCallback } from '../services/oauth/oauthHandler';
import { useToast } from '../components/common/Toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        // Handle OAuth errors
        if (error) {
          throw new Error(errorDescription || error);
        }

        // Check what type of callback this is
        const storedIntegration = sessionStorage.getItem('oauth_integration');
        
        // Case 1: Supabase Social Auth (Google/GitHub login for app authentication)
        if (!storedIntegration) {
          // This is a Supabase Auth callback
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) throw sessionError;
          
          if (session) {
            setStatus('success');
            toast.success('Signed in successfully!');
            setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
          } else {
            throw new Error('No session found after authentication');
          }
          return;
        }

        // Case 2: Integration OAuth (Gmail, Slack, HubSpot, Google Drive)
        if (code && state) {
          setStatus('processing');
          
          // Make sure user is authenticated
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session) {
            throw new Error('You must be logged in to connect integrations');
          }

          const result = await handleOAuthCallback(code, state, supabase);
          
          // Clear stored integration type
          sessionStorage.removeItem('oauth_integration');
          
          setStatus('success');
          toast.success(result.message || 'Integration connected successfully!');
          
          setTimeout(() => navigate('/integrations', { replace: true }), 1500);
        } else {
          throw new Error('Missing required OAuth parameters');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        toast.error(error.message || 'Authentication failed');
        
        // Clear stored integration type on error
        sessionStorage.removeItem('oauth_integration');
        
        // Redirect based on context
        const storedIntegration = sessionStorage.getItem('oauth_integration');
        const redirectPath = storedIntegration ? '/integrations' : '/login';
        setTimeout(() => navigate(redirectPath, { replace: true }), 3000);
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
            <p className="text-gray-400">Please wait while we set up your connection</p>
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
            <p className="text-gray-400">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}