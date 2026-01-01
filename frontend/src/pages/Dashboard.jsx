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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Notification Hub</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/integrations')}>
                <Settings className="h-4 w-4 mr-2" />
                Integrations
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
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
            <div className="bg-card border rounded-lg p-6">
              <div className="text-2xl font-bold">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total Notifications</div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-2xl font-bold text-blue-500">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-2xl font-bold text-green-500">
                {notifications.length - unreadCount}
              </div>
              <div className="text-sm text-muted-foreground">Read</div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
              <Button
                variant={filter === 'read' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                Read
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
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
              <div className="text-center py-12 bg-card border rounded-lg">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your integrations to start receiving notifications
                </p>
                <Button onClick={() => navigate('/integrations')}>
                  Connect Integrations
                </Button>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-card border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors ${
                    !notification.read ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          {notification.source || 'System'}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <h4 className="font-semibold mb-1">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                      <p className="text-xs text-muted-foreground mt-2">
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