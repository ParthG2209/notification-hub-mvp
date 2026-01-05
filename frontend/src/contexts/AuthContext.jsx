import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase/client';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        console.log('Initial session loaded for user:', session.user.email);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Handle token refresh
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      
      // Handle signed out
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
      
      // Handle signed in
      if (event === 'SIGNED_IN') {
        console.log('User signed in');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up periodic session refresh to prevent JWT expiration
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if token is about to expire (within 5 minutes)
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;
        
        if (timeUntilExpiry < 300) { // Less than 5 minutes
          console.log('Token expiring soon, refreshing...');
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error('Failed to refresh session:', error);
          } else if (data.session) {
            console.log('Session refreshed proactively');
            setSession(data.session);
            setUser(data.session.user);
          }
        }
      }
    }, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  // Helper to ensure fresh session
  const ensureFreshSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    
    if (!session) {
      console.error('No active session found');
      return null;
    }
    
    // Check if token needs refresh
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 60) { // Less than 1 minute
      console.log('Token expired or expiring, refreshing...');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Failed to refresh session:', refreshError);
        return null;
      }
      
      console.log('Session refreshed');
      return data.session;
    }
    
    return session;
  };

  // OAuth Sign In - UPDATED for Slack
  const signInWithGoogle = async () => {
    // Clear any stored integration type to ensure this is treated as auth
    sessionStorage.removeItem('oauth_integration');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false
      }
    });
    if (error) throw error;
    return data;
  };

  // UPDATED: Slack Sign In - Use slack_oidc provider
  const signInWithSlack = async () => {
    // Clear any stored integration type to ensure this is treated as auth
    sessionStorage.removeItem('oauth_integration');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'slack_oidc', // Changed from 'slack' to 'slack_oidc'
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false
      }
    });
    if (error) throw error;
    return data;
  };

  // ADDED: HubSpot Sign In (replacing GitHub)
  const signInWithHubSpot = async () => {
    // Clear any stored integration type to ensure this is treated as auth
    sessionStorage.removeItem('oauth_integration');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'hubspot',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false
      }
    });
    if (error) throw error;
    return data;
  };

  // Email/Password Sign In
  const signInWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Email/Password Sign Up
  const signUpWithPassword = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  };

  // Magic Link Sign In (OTP)
  const signInWithEmail = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  // Password Reset
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
  };

  // Update Password
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  };

  // Sign Out
  const signOut = async () => {
    // Clear any stored OAuth state
    sessionStorage.removeItem('oauth_integration');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Refresh session manually
  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    
    return data;
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithSlack,
    signInWithHubSpot, // Added HubSpot
    signInWithPassword,
    signUpWithPassword,
    signInWithEmail,
    resetPassword,
    updatePassword,
    signOut,
    refreshSession,
    ensureFreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};