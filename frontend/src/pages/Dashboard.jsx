import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '../components/common/Button';
import { 
  Bell, 
  Settings, 
  LogOut, 
  Search,
  CheckCheck,
  Trash2,
  Sparkles,
  TrendingUp,
  Clock,
  Filter,
  MoreVertical,
  Check,
  Archive,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, loading, filter, setFilter, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredBySearch = notifications.filter(notif => 
    notif.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notif.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prev => 
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const getSourceColor = (source) => {
    const colors = {
      gmail: 'from-red-500/20 to-red-600/20 border-red-500/30',
      slack: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
      'google-drive': 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      hubspot: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
      default: 'from-gray-500/20 to-gray-600/20 border-gray-500/30'
    };
    return colors[source?.toLowerCase()] || colors.default;
  };

  const getSourceIcon = (source) => {
    const icons = {
      gmail: '📧',
      slack: '💬',
      'google-drive': '📁',
      hubspot: '🎯',
      default: '🔔'
    };
    return icons[source?.toLowerCase()] || icons.default;
  };

  return (
    <div className="min-h-screen bg-agency-gradient text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] pointer-events-none"></div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3 rounded-xl border border-white/10">
                  <Bell className="h-6 w-6 text-blue-400" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Notification Hub
                </h1>
                <p className="text-xs text-gray-400">Manage all your notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-white/10 border border-white/10" 
                  onClick={() => navigate('/integrations')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Integrations
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-white/10" 
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold mb-1">{notifications.length}</div>
                <div className="text-sm text-gray-400">Total Notifications</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      New
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold mb-1 text-purple-400">{unreadCount}</div>
                <div className="text-sm text-gray-400">Unread</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCheck className="h-5 w-5 text-green-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 text-green-400">
                  {notifications.length - unreadCount}
                </div>
                <div className="text-sm text-gray-400">Read</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1 text-orange-400">
                  {notifications.filter(n => {
                    const date = new Date(n.created_at);
                    const today = new Date();
                    return date.toDateString() === today.toDateString();
                  }).length}
                </div>
                <div className="text-sm text-gray-400">Today</div>
              </div>
            </motion.div>
          </div>

          {/* Controls Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                  {['all', 'unread', 'read'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === filterType
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:text-white hover:bg-white/10 border border-white/10" 
                      onClick={markAllAsRead}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark all read
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Notifications List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-20">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <div className="w-16 h-16 border-4 border-white/20 border-t-blue-500 rounded-full"></div>
                </motion.div>
                <p className="mt-4 text-gray-400">Loading notifications...</p>
              </div>
            ) : filteredBySearch.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
              >
                <div className="inline-block p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-6">
                  <Bell className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No notifications yet</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Connect your integrations to start receiving notifications from your favorite apps
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => navigate('/integrations')} 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-xl"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Connect Integrations
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredBySearch.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    {/* Glow effect for unread */}
                    {!notification.read && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
                    )}
                    
                    <div
                      className={`relative bg-white/5 border rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 cursor-pointer transition-all ${
                        !notification.read 
                          ? 'border-l-4 border-l-blue-500 border-white/20' 
                          : 'border-white/10'
                      }`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Source Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getSourceColor(notification.source)} border flex items-center justify-center text-2xl`}>
                          {getSourceIcon(notification.source)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase bg-white/10 text-gray-300 border border-white/10">
                                {notification.source || 'System'}
                              </span>
                              {!notification.read && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                  Unread
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          
                          <h4 className="font-semibold text-lg mb-2 text-white group-hover:text-blue-300 transition-colors">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-300 leading-relaxed mb-3">
                            {notification.body}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4 text-green-400" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}