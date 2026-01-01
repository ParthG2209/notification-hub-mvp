import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntegrations } from '../contexts/IntegrationContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Bell, ArrowLeft, Check, Plus } from 'lucide-react';

export default function Integrations() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { 
    availableIntegrations, 
    loading, 
    connectIntegration, 
    disconnectIntegration, 
    isConnected 
  } = useIntegrations();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Bell className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Integrations</h1>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Connect Your Apps</h2>
            <p className="text-muted-foreground">
              Connect your favorite apps to receive notifications in one place
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableIntegrations.map((integration) => {
                const connected = isConnected(integration.id);
                
                return (
                  <div
                    key={integration.id}
                    className="bg-card border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${integration.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                          {integration.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{integration.name}</h3>
                          {connected && (
                            <span className="text-xs text-green-500 flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Connected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {integration.description}
                    </p>
                    
                    {connected ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => disconnectIntegration(integration.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => connectIntegration(integration.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 bg-muted/50 border rounded-lg p-6">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Connect your apps using OAuth authentication</li>
              <li>2. We'll securely receive notifications from your connected apps</li>
              <li>3. View all your notifications in one unified dashboard</li>
              <li>4. Manage and organize your notifications easily</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}