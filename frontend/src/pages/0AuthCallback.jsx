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
        // This happens when there's NO stored integration and we have a hash fragment
        if (!storedIntegration && (window.location.hash || !code)) {
          console.log('Handling Supabase Auth callback');
          
          // Wait a bit for Supabase to process the auth
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }
          
          if (session) {
            console.log('Session found, redirecting to dashboard');
            setStatus('success');
            toast.success('Signed in successfully!');
            setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
          } else {
            // Try one more time after a longer delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            
            if (retrySession) {
              console.log('Session found on retry, redirecting to dashboard');
              setStatus('success');
              toast.success('Signed in successfully!');
              setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
            } else {
              throw new Error('No session found after authentication');
            }
          }
          return;
        }

        // Case 2: Integration OAuth (Gmail, Slack, HubSpot, Google Drive)
        if (code && state && storedIntegration) {
          console.log('Handling Integration OAuth callback for:', storedIntegration);
          setStatus('processing');
          
          // Make sure user is authenticated - with retry logic
          let session = null;
          let retries = 3;
          
          while (retries > 0 && !session) {
            const { data, error: sessionError } = await supabase.auth.getSession();
            
            if (data?.session) {
              session = data.session;
              break;
            }
            
            if (sessionError) {
              console.warn('Session error, retrying...', sessionError);
            }
            
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (!session) {
            console.error('No valid session after retries');
            throw new Error('Authentication session expired. Please log in again and try connecting the integration.');
          }

          console.log('Valid session found, proceeding with OAuth callback');

          const result = await handleOAuthCallback(code, state, supabase);
          
          // Clear stored integration type
          sessionStorage.removeItem('oauth_integration');
          
          setStatus('success');
          toast.success(result.message || 'Integration connected successfully!');
          
          setTimeout(() => navigate('/integrations', { replace: true }), 1500);
        } else if (!storedIntegration && code) {
          // Edge case: we have a code but no stored integration
          // This might be a Supabase auth callback with code instead of hash
          console.log('Edge case: code without stored integration');
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setStatus('success');
            toast.success('Signed in successfully!');
            setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
          } else {
            throw new Error('Authentication incomplete');
          }
        } else {
          throw new Error('Invalid OAuth callback parameters');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        
        // Provide more specific error messages
        let errorMessage = error.message || 'Authentication failed';
        
        if (errorMessage.includes('JWT') || errorMessage.includes('session')) {
          errorMessage = 'Your session has expired. Please log in again and try connecting the integration.';
        }
        
        toast.error(errorMessage);
        
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