import React, { useState, useEffect } from 'react';
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
  Clock,
  Filter,
  Mail,
  MessageSquare,
  FolderOpen,
  Target,
  Star,
  Archive,
  MoreVertical,
  X,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, loading, filter, setFilter, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [expandedNotification, setExpandedNotification] = useState(null);

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
  ).filter(notif => 
    selectedSource === 'all' || notif.source === selectedSource
  );

  const sources = ['all', 'gmail', 'slack', 'google-drive', 'hubspot'];
  
  const getSourceIcon = (source) => {
    const icons = {
      gmail: <Mail className="h-4 w-4" />,
      slack: <MessageSquare className="h-4 w-4" />,
      'google-drive': <FolderOpen className="h-4 w-4" />,
      hubspot: <Target className="h-4 w-4" />,
    };
    return icons[source?.toLowerCase()] || <Bell className="h-4 w-4" />;
  };

  const getSourceColor = (source) => {
    const colors = {
      gmail: 'from-red-500 to-red-600',
      slack: 'from-purple-500 to-purple-600',
      'google-drive': 'from-blue-500 to-blue-600',
      hubspot: 'from-orange-500 to-orange-600',
      default: 'from-gray-500 to-gray-600'
    };
    return colors[source?.toLowerCase()] || colors.default;
  };

  const stats = [
    {
      label: 'Total',
      value: notifications.length,
      icon: <Bell className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      label: 'Unread',
      value: unreadCount,
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      change: 'New'
    },
    {
      label: 'Read',
      value: notifications.length - unreadCount,
      icon: <CheckCheck className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      change: '-5%'
    },
    {
      label: 'Today',
      value: notifications.filter(n => {
        const date = new Date(n.created_at);
        const today = new Date();
        return date.toDateString() === today.toDateString();
      }).length,
      icon: <Clock className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      change: '+8'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/3 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="relative border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-2.5 rounded-xl border border-white/10">
                  <Bell className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold">Notification Hub</h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/integrations')}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Settings</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-[1400px] mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(stat.label)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group cursor-pointer"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              {/* Card */}
              <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 bg-gradient-to-br ${stat.color} rounded-xl bg-opacity-10`}>
                    {stat.icon}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${stat.color} bg-opacity-10 text-white/80`}>
                    {stat.change}
                  </span>
                </div>
                
                <div>
                  <motion.div 
                    className="text-3xl font-bold mb-1"
                    animate={{ scale: hoveredCard === stat.label ? 1.05 : 1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>

                {/* Hover Arrow */}
                <motion.div
                  className="absolute top-6 right-6 opacity-0 group-hover:opacity-100"
                  initial={{ x: -10 }}
                  animate={{ x: hoveredCard === stat.label ? 0 : -10 }}
                >
                  <ChevronRight className="h-5 w-5 text-white/40" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-6"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Source Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm text-gray-400">Filter by source:</span>
            {sources.map((source) => (
              <motion.button
                key={source}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSource(source)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedSource === source
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                {source === 'all' ? (
                  'All Sources'
                ) : (
                  <span className="flex items-center gap-2">
                    {getSourceIcon(source)}
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Status Filter & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  filter === 'all'
                    ? 'bg-white/20 border border-white/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                All
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  filter === 'unread'
                    ? 'bg-white/20 border border-white/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  filter === 'read'
                    ? 'bg-white/20 border border-white/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                Read
              </motion.button>
            </div>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm flex items-center gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>
          ) : filteredBySearch.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mb-6">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No notifications found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {searchQuery || selectedSource !== 'all' 
                  ? 'Try adjusting your filters or search query'
                  : 'Connect your integrations to start receiving notifications'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/integrations')}
                className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Connect Integrations
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredBySearch.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative"
                >
                  {/* Unread Glow */}
                  {!notification.read && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
                  )}
                  
                  {/* Card */}
                  <div
                    className={`relative bg-white/5 border rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 cursor-pointer transition-all ${
                      !notification.read 
                        ? 'border-l-4 border-l-blue-500 border-white/20' 
                        : 'border-white/10'
                    }`}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                      setExpandedNotification(expandedNotification === notification.id ? null : notification.id);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Source Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getSourceColor(notification.source)} flex items-center justify-center border border-white/20`}>
                        {getSourceIcon(notification.source)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase bg-white/10 text-gray-300 border border-white/10">
                              {notification.source || 'System'}
                            </span>
                            {!notification.read && (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h4 className="font-semibold text-lg mb-2 text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                          {notification.title}
                        </h4>
                        
                        {/* Body */}
                        <p className={`text-sm text-gray-300 leading-relaxed mb-3 ${expandedNotification === notification.id ? '' : 'line-clamp-2'}`}>
                          {notification.body}
                        </p>
                        
                        {/* Footer */}
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
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <CheckCheck className="h-4 w-4 text-green-400" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </motion.button>
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
      </main>
    </div>
  );
}