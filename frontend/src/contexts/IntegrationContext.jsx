// frontend/src/contexts/IntegrationContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase/client';
import { useAuth } from './AuthContext';

const IntegrationContext = createContext({});

export const useIntegrations = () => {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationProvider');
  }
  return context;
};

export const IntegrationProvider = ({ children }) => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const availableIntegrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Receive email notifications',
      icon: '📧',
      color: 'bg-red-500'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get Slack messages and mentions',
      icon: '💬',
      color: 'bg-purple-500'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Track file changes and shares',
      icon: '📁',
      color: 'bg-blue-500'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Monitor CRM activities',
      icon: '🎯',
      color: 'bg-orange-500'
    }
  ];

  const fetchIntegrations = useCallback(async () => {
    if (!user) {
      setIntegrations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching integrations for user:', user.id);
      
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching integrations:', error);
        throw error;
      }
      
      console.log('Integrations fetched:', data);
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchIntegrations();
      
      // Set up realtime subscription to listen for integration changes
      const channel = supabase
        .channel('integrations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'integrations',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Integration change detected:', payload);
            fetchIntegrations(); // Refetch when integrations change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchIntegrations]);

  const connectIntegration = async (integrationId) => {
    // This will be handled by OAuth flow
    console.log('Connecting to', integrationId);
    // Redirect to OAuth URL based on integration
  };

  const disconnectIntegration = async (integrationId) => {
    try {
      console.log('Disconnecting integration:', integrationId);
      
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('integration_type', integrationId);

      if (error) throw error;
      
      console.log('Integration disconnected successfully');
      await fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      throw error;
    }
  };

  const isConnected = (integrationId) => {
    const connected = integrations.some(
      int => int.integration_type === integrationId && int.status === 'active'
    );
    console.log(`Checking if ${integrationId} is connected:`, connected);
    return connected;
  };

  const value = {
    integrations,
    availableIntegrations,
    loading,
    connectIntegration,
    disconnectIntegration,
    isConnected,
    refetch: fetchIntegrations
  };

  return (
    <IntegrationContext.Provider value={value}>
      {children}
    </IntegrationContext.Provider>
  );
};