import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  LogOut,
  Plus,
  Settings,
  Zap,
  Activity,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { stats, fetchStats, recentNotifications, loading } = useNotifications();
  const navigate = useNavigate();

  // Polling for updates
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Custom Stat Card Component based on the reference design
  const StatCard = ({ title, value, subtitle, icon: Icon }) => (
    <div className="relative group overflow-hidden rounded-lg border border-white/10 bg-[#0c0c0f] p-6 transition-all hover:border-white/20 hover:bg-[#141416]">
      {/* Subtle Gradient Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-lg bg-gradient-to-br from-[#242424] to-[#101010] border border-white/10 shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {subtitle && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-white/5 text-white/50 border border-white/5">
              {subtitle}
            </span>
          )}
        </div>
        
        <div>
          <h3 className="text-3xl font-medium text-white tracking-tight mb-2">{value}</h3>
          <p className="text-sm font-light text-white/60">{title}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0c0c0f] relative overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0c0c0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-medium tracking-tight text-white">PixelHub</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8 text-sm font-light">
              <span className="text-white cursor-default">Dashboard</span>
              <button onClick={() => navigate('/notifications')} className="text-white/60 hover:text-white transition-colors">Notifications</button>
              <button onClick={() => navigate('/integrations')} className="text-white/60 hover:text-white transition-colors">Integrations</button>
            </div>
            
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60 hidden sm:block font-light">{user?.email}</span>
              <button 
                onClick={handleLogout}
                className="group p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-400/90 uppercase tracking-wider">System Operational</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-medium text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-lg text-white/50 font-light max-w-xl leading-relaxed">
              Real-time insights into your notification infrastructure. Monitor performance and manage integrations.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
             <button 
                onClick={() => navigate('/notifications')}
                className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 text-white/80"
             >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Manage</span>
             </button>
             <button 
                onClick={() => navigate('/notifications')}
                className="px-6 py-3 rounded-lg bg-white text-black hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
             >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Notification</span>
             </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Total Sent" 
            value={stats.total?.toLocaleString() || '0'} 
            icon={Bell}
            subtitle="Lifetime"
          />
          <StatCard 
            title="Success Rate" 
            value={`${stats.total > 0 ? ((stats.sent / stats.total) * 100).toFixed(1) : 0}%`}
            icon={CheckCircle}
            subtitle="Delivery Status"
          />
          <StatCard 
            title="Pending Queue" 
            value={stats.pending?.toLocaleString() || '0'} 
            icon={Clock}
            subtitle="Processing"
          />
          <StatCard 
            title="Failed" 
            value={stats.failed?.toLocaleString() || '0'} 
            icon={AlertTriangle}
            subtitle="Needs Attention"
          />
        </div>

        {/* Activity Feed Section */}
        <div className="rounded-xl border border-white/10 bg-[#0c0c0f] overflow-hidden">
          <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gradient-card">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-medium text-white">Recent Activity</h2>
            </div>
            <button 
              onClick={() => navigate('/notifications')}
              className="group flex items-center gap-1 text-sm text-primary hover:text-blue-400 transition-colors"
            >
              View Full History
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-xs font-medium text-white/40 uppercase tracking-wider">Type</th>
                  <th className="px-8 py-5 text-xs font-medium text-white/40 uppercase tracking-wider">Recipient</th>
                  <th className="px-8 py-5 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                   [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-8 py-6"><div className="h-2 bg-white/5 rounded w-24 animate-pulse"></div></td>
                      <td className="px-8 py-6"><div className="h-2 bg-white/5 rounded w-32 animate-pulse"></div></td>
                      <td className="px-8 py-6"><div className="h-2 bg-white/5 rounded w-16 animate-pulse"></div></td>
                      <td className="px-8 py-6"><div className="h-2 bg-white/5 rounded w-20 animate-pulse ml-auto"></div></td>
                    </tr>
                   ))
                ) : recentNotifications?.length > 0 ? (
                  recentNotifications.map((notif) => (
                    <tr key={notif.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             notif.type === 'email' ? 'bg-blue-500' : 
                             notif.type === 'slack' ? 'bg-purple-500' : 'bg-orange-500'
                          }`} />
                          <span className="text-sm text-white/90 capitalize">{notif.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-white/60 font-light">
                        {notif.recipient || 'N/A'}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${
                          notif.status === 'sent' 
                            ? 'bg-green-500/5 text-green-400 border-green-500/20' 
                            : notif.status === 'failed' 
                            ? 'bg-red-500/5 text-red-400 border-red-500/20'
                            : 'bg-yellow-500/5 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {notif.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-white/40 font-light text-right tabular-nums">
                        {new Date(notif.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Bell className="w-8 h-8 text-white/10 mb-2" />
                        <p className="text-white/40 font-light">No notifications found.</p>
                        <button onClick={() => navigate('/notifications')} className="text-sm text-primary hover:underline mt-2">
                          Send your first notification
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20 font-light">
          <p>© 2024 PixelHub Notification System. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white/40 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white/40 cursor-pointer transition-colors">Terms of Service</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
              v1.0.2 Stable
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;