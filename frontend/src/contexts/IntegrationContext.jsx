import React, { createContext, useState, useContext, useEffect } from 'react';
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

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (integrationId) => {
    // This will be handled by OAuth flow
    console.log('Connecting to', integrationId);
    // Redirect to OAuth URL based on integration
  };

  const disconnectIntegration = async (integrationId) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('user_id', user.id)
        .eq('integration_type', integrationId);

      if (error) throw error;
      await fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const isConnected = (integrationId) => {
    return integrations.some(
      int => int.integration_type === integrationId && int.status === 'active'
    );
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