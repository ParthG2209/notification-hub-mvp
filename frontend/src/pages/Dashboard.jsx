import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '../components/common/Button';
import { Bell, Settings, LogOut, Filter } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { notifications, loading, filter, setFilter, markAsRead, markAllAsRead } = useNotifications();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    // CHANGE APPLIED HERE: bg-agency-gradient and text-white
    <div className="min-h-screen bg-agency-gradient text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Notification Hub</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-black" onClick={() => navigate('/integrations')}>
                <Settings className="h-4 w-4 mr-2" />
                Integrations
              </Button>
              <Button variant="ghost" className="hover:text-white/80" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-2xl font-bold">{notifications.length}</div>
              <div className="text-sm text-gray-400">Total Notifications</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-400">{unreadCount}</div>
              <div className="text-sm text-gray-400">Unread</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-400">
                {notifications.length - unreadCount}
              </div>
              <div className="text-sm text-gray-400">Read</div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                className={filter !== 'all' ? 'text-black' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                className={filter !== 'unread' ? 'text-black' : ''}
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                className={filter !== 'read' ? 'text-black' : ''}
                onClick={() => setFilter('read')}
              >
                Read
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="hover:text-white/80" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                <p className="text-gray-400 mb-4">
                  Connect your integrations to start receiving notifications
                </p>
                <Button onClick={() => navigate('/integrations')} className="text-black bg-white hover:bg-gray-200">
                  Connect Integrations
                </Button>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 cursor-pointer transition-colors ${
                    !notification.read ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase text-gray-400">
                          {notification.source || 'System'}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1 text-white">{notification.title}</h4>
                      <p className="text-sm text-gray-300">{notification.body}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}