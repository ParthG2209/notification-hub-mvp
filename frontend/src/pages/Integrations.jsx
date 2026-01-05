// frontend/src/pages/Integrations.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';
import { useIntegrations } from '../contexts/IntegrationContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import { supabase } from '../services/supabase/client';
import { initiateOAuth } from '../services/oauth/oauthHandler';
import { 
  Check, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  Grid,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Bell,
  Mail,
  MessageSquare,
  FolderOpen,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/burger-menu.css';

export default function Integrations() {
  const navigate = useNavigate();
  const { user, signOut, ensureFreshSession } = useAuth();
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeMenu();
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard-home',
      icon: LayoutDashboard,
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      label: 'Integrations',
      href: '/integrations',
      icon: Grid,
    },
  ];

  const isActive = (path) => {
    return window.location.pathname === path;
  };

  const MenuToggleIcon = ({ open }) => (
    <svg
      strokeWidth={2.5}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 32 32"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-8 h-8 text-white transition-transform duration-500 ${open ? '-rotate-45' : ''}`}
    >
      <path
        className={`transition-all duration-500 ${
          open
            ? '[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]'
            : '[stroke-dasharray:12_63]'
        }`}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
      />
      <path d="M7 16 27 16" />
    </svg>
  );

  // Get icon component for each integration
  const getIntegrationIcon = (integrationId) => {
    switch(integrationId) {
      case 'gmail':
        return <Mail className="h-6 w-6 text-white" />;
      case 'slack':
        return <MessageSquare className="h-6 w-6 text-white" />;
      case 'google-drive':
        return <FolderOpen className="h-6 w-6 text-white" />;
      case 'hubspot':
        return <Target className="h-6 w-6 text-white" />;
      default:
        return <Grid className="h-6 w-6 text-white" />;
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
    <div className="min-h-screen bg-black text-white relative">
      {/* Grid Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: '#000000',
          backgroundImage: `
            linear-gradient(to right, rgba(75, 85, 99, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Menu Toggle Button */}
      <div className="fixed top-6 left-6 z-[1100]">
        <button onClick={toggleMenu} className="p-0 bg-transparent border-none cursor-pointer">
          <MenuToggleIcon open={menuOpen} />
        </button>
      </div>

      {/* Burger Menu */}
      <Menu
        isOpen={menuOpen}
        onStateChange={handleStateChange}
        width="280px"
        customBurgerIcon={false}
        customCrossIcon={false}
      >
        <div className="px-4 pb-6 mb-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Notification Hub</h2>
        </div>

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`menu-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {user && (
          <div className="menu-user-profile">
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="user-dropdown">
                  <div
                    onClick={() => {
                      handleSignOut();
                      setShowUserMenu(false);
                    }}
                    className="user-dropdown-item logout"
                  >
                    <LogOut />
                    <span>Logout</span>
                  </div>
                </div>
              </>
            )}

            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-profile-button"
            >
              <div className="user-avatar">
                <UserIcon />
              </div>
              <div className="user-info">
                <p className="user-name">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </Menu>

      {/* Header - REMOVED Bell icon */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 ml-16">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2.5 rounded-xl border border-white/10">
                  <Grid className="h-5 w-5 text-blue-400" />
                </div>
                <h1 className="text-xl font-bold">Integrations</h1>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRefresh}
                className="text-white hover:bg-white/10"
                title="Refresh integrations"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-5 py-6 relative z-10 scale-90 origin-top">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold mb-1.5">Connect Your Apps</h2>
            <p className="text-gray-400 text-sm">
              Connect your favorite apps to receive notifications in one unified hub
            </p>
            <p className="text-xs text-gray-500 mt-1.5">
              Connected: {integrations.length} integration{integrations.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {availableIntegrations.map((integration, index) => {
                const connected = isConnected(integration.id);
                
                return (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    {connected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
                    )}
                    
                    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`${integration.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                            {getIntegrationIcon(integration.id)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{integration.name}</h3>
                            {connected && (
                              <span className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
                                <Check className="h-2.5 w-2.5" />
                                Connected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-300 mb-5 leading-relaxed">
                        {integration.description}
                      </p>
                      
                      {connected ? (
                        <div className="space-y-1.5">
                          {integration.id === 'gmail' && (
                            <Button
                              className="w-full text-sm py-1.5"
                              onClick={() => handleSync(integration.id)}
                              disabled={syncing[integration.id]}
                            >
                              {syncing[integration.id] ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  Syncing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                  Sync Emails
                                </>
                              )}
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            className="w-full text-white border-white/20 hover:bg-red-500/20 hover:border-red-500/30 text-sm py-1.5"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full text-sm py-1.5"
                          onClick={() => handleConnect(integration.id)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Connect with {integration.name}
                          <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
          >
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              How it works
            </h3>
            <ol className="space-y-2.5 text-gray-300 text-sm">
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs">1</span>
                <span>Connect your apps using secure OAuth authentication</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs">2</span>
                <span>Grant permission to access notifications (read-only access)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs">3</span>
                <span>Click "Sync" to fetch your latest emails and notifications</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-xs">4</span>
                <span>View all your notifications in one unified dashboard</span>
              </li>
            </ol>
            
            <div className="mt-5 pt-5 border-t border-white/10">
              <p className="text-xs text-gray-400">
                Your data is encrypted and secure. We never store your passwords and you can disconnect at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}