// frontend/src/pages/Integrations.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntegrations } from '../contexts/IntegrationContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import { supabase } from '../services/supabase/client';
import { initiateOAuth } from '../services/oauth/oauthHandler';
import { Bell, ArrowLeft, Check, Plus, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Integrations() {
  const navigate = useNavigate();
  const { signOut, ensureFreshSession } = useAuth();
  const toast = useToast();
  const { 
    availableIntegrations, 
    integrations,
    loading, 
    disconnectIntegration, 
    isConnected,
    refetch
  } = useIntegrations();

  const [syncing, setSyncing] = useState({});

  // Debug: Log integrations whenever they change
  useEffect(() => {
    console.log('Current integrations:', integrations);
  }, [integrations]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleConnect = async (integrationId) => {
    try {
      console.log(`Starting connection for ${integrationId}...`);
      
      const session = await ensureFreshSession();
      
      if (!session) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      console.log('Fresh session confirmed, initiating OAuth...');
      toast.info(`Connecting to ${integrationId}...`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      initiateOAuth(integrationId);
    } catch (error) {
      console.error('OAuth initiation error:', error);
      toast.error(error.message || 'Failed to initiate OAuth flow. Please try again.');
    }
  };

  const handleDisconnect = async (integrationId) => {
    try {
      await disconnectIntegration(integrationId);
      toast.success(`${integrationId} disconnected successfully`);
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect integration');
    }
  };

  const handleRefresh = async () => {
    try {
      toast.info('Refreshing integrations...');
      await refetch();
      toast.success('Integrations refreshed!');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh integrations');
    }
  };

  const handleSync = async (integrationId) => {
    try {
      setSyncing(prev => ({ ...prev, [integrationId]: true }));
      toast.info(`Syncing ${integrationId}...`);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in again');
        return;
      }

      // Call the appropriate sync function
      let functionName = '';
      if (integrationId === 'gmail') {
        functionName = 'sync-gmail';
      } else {
        toast.info('Sync not yet available for this integration');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      const result = await response.json();
      
      toast.success(`Synced ${result.new || 0} new notifications from ${integrationId}!`);
      
      // Navigate to dashboard to see the notifications
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Sync error:', error);
      toast.error(error.message || 'Failed to sync');
    } finally {
      setSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-agency-gradient text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3 rounded-xl border border-white/10">
                  <Bell className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold">Integrations</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRefresh}
                className="text-white hover:bg-white/10"
                title="Refresh integrations"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-white hover:bg-white/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-bold mb-2">Connect Your Apps</h2>
            <p className="text-gray-400">
              Connect your favorite apps to receive notifications in one unified hub
            </p>
            {/* Debug info */}
            <p className="text-xs text-gray-500 mt-2">
              Connected: {integrations.length} integration{integrations.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableIntegrations.map((integration, index) => {
                const connected = isConnected(integration.id);
                
                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    {/* Glow effect */}
                    {connected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
                    )}
                    
                    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`${integration.color} w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                            {integration.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl">{integration.name}</h3>
                            {connected && (
                              <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                                <Check className="h-3 w-3" />
                                Connected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                        {integration.description}
                      </p>
                      
                      {connected ? (
                        <div className="space-y-2">
                          {/* Sync Button for Gmail */}
                          {integration.id === 'gmail' && (
                            <Button
                              className="w-full"
                              onClick={() => handleSync(integration.id)}
                              disabled={syncing[integration.id]}
                            >
                              {syncing[integration.id] ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Syncing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Sync Emails
                                </>
                              )}
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            className="w-full text-white border-white/20 hover:bg-red-500/20 hover:border-red-500/30"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(integration.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Connect with {integration.name}
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
          >
            <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              How it works
            </h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm">1</span>
                <span>Connect your apps using secure OAuth authentication</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm">2</span>
                <span>Grant permission to access notifications (read-only access)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm">3</span>
                <span>Click "Sync" to fetch your latest emails and notifications</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm">4</span>
                <span>View all your notifications in one unified dashboard</span>
              </li>
            </ol>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-gray-400">
                🔒 Your data is encrypted and secure. We never store your passwords and you can disconnect at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}