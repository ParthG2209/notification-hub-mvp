
import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Filter, 
  Search, 
  Mail, 
  MessageSquare, 
  FolderOpen, 
  Target,
  Check,
  Trash2,
  MoreVertical,
  X
} from 'lucide-react';
import { useToast } from '../components/common/Toast';

const Notifications = () => {
  const { 
    notifications, 
    loading, 
    filter, 
    setFilter, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [showMenu, setShowMenu] = useState(null);

  const getSourceIcon = (source) => {
    switch(source) {
      case 'gmail': return <Mail className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'google-drive': return <FolderOpen className="w-4 h-4" />;
      case 'hubspot': return <Target className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source) => {
    switch(source) {
      case 'gmail': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'slack': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'google-drive': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'hubspot': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success('Marked as read');
      setShowMenu(null);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
      setShowMenu(null);
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.body?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'all' || notif.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const sources = ['all', 'gmail', 'slack', 'google-drive', 'hubspot'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
            <p className="text-gray-400 mt-1">
              {notifications.length} total • {notifications.filter(n => !n.read).length} unread
            </p>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors text-sm flex items-center gap-2 border border-white/10"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Filter by Status */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filter === 'unread'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  filter === 'read'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                Read
              </button>
            </div>
          </div>

          {/* Source Filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {sources.map((source) => (
              <button
                key={source}
                onClick={() => setSelectedSource(source)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs flex items-center gap-1.5 ${
                  selectedSource === source
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                {source !== 'all' && getSourceIcon(source)}
                {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white/5 border backdrop-blur-sm rounded-xl p-5 hover:bg-white/10 transition-all relative ${
                  notification.read ? 'border-white/10' : 'border-blue-500/30'
                }`}
              >
                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="absolute top-5 left-0 w-1 h-12 bg-blue-500 rounded-r"></div>
                )}

                <div className="flex items-start gap-4 ml-3">
                  {/* Source Icon */}
                  <div className={`p-3 rounded-lg border ${getSourceColor(notification.source)}`}>
                    {getSourceIcon(notification.source)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                        {notification.title || 'Untitled Notification'}
                      </h3>
                      <div className="flex items-center gap-2">
                        {/* Source Badge */}
                        <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getSourceColor(notification.source)}`}>
                          {notification.source || 'system'}
                        </span>

                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowMenu(showMenu === notification.id ? null : notification.id)}
                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showMenu === notification.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                                  >
                                    <Check className="w-4 h-4" />
                                    Mark as Read
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {notification.body || 'No description available'}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(notification.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-12 text-center"
            >
              <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No notifications found</h3>
              <p className="text-gray-400">
                {searchQuery || selectedSource !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Connect your integrations to start receiving notifications'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;