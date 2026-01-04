import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Video, Award, CheckCircle, Activity, 
  ArrowUpRight, Clock, Calendar, MoreVertical, Bell
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, loading } = useNotifications();
  
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadNotifications: 0,
    todayNotifications: 0
  });
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Chart Data
  const [activeUsersData, setActiveUsersData] = useState([
    { category: 'Gmail', value: 0, color: '#ef4444' },
    { category: 'Slack', value: 0, color: '#8b5cf6' },
    { category: 'Drive', value: 0, color: '#3b82f6' },
    { category: 'HubSpot', value: 0, color: '#f97316' }
  ]);

  useEffect(() => {
    if (notifications.length > 0) {
      const unread = notifications.filter(n => !n.read).length;
      const today = notifications.filter(n => {
        const date = new Date(n.created_at);
        const now = new Date();
        return date.toDateString() === now.toDateString();
      }).length;

      setStats({
        totalNotifications: notifications.length,
        unreadNotifications: unread,
        todayNotifications: today
      });

      // Update chart data by source
      const gmailCount = notifications.filter(n => n.source === 'gmail').length;
      const slackCount = notifications.filter(n => n.source === 'slack').length;
      const driveCount = notifications.filter(n => n.source === 'google-drive').length;
      const hubspotCount = notifications.filter(n => n.source === 'hubspot').length;

      setActiveUsersData([
        { category: 'Gmail', value: gmailCount, color: '#ef4444' },
        { category: 'Slack', value: slackCount, color: '#8b5cf6' },
        { category: 'Drive', value: driveCount, color: '#3b82f6' },
        { category: 'HubSpot', value: hubspotCount, color: '#f97316' }
      ]);

      // Get recent notifications
      const sorted = [...notifications].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentNotifications(sorted.slice(0, 5));
    }
  }, [notifications]);

  const getStatusColor = (status) => {
    if (!status) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  };

  const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
    <GlassCard className="relative overflow-hidden group hover:bg-white/10 transition-colors">
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className={`p-1.5 rounded-lg bg-white/5 ${colorClass}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-400">{title}</span>
        </div>
        <div className="flex items-end gap-2.5">
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          <div className={`flex items-center text-xs font-medium mb-0.5 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : null}
            <span>{trendValue}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-8 scale-90 origin-top">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-0.5 text-sm">
            Welcome back, <span className="text-white font-medium">{user?.email?.split('@')[0] || 'User'}</span>. Here's what's happening today.
          </p>
        </div>
        <button 
          onClick={() => navigate('/integrations')}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-xs flex items-center gap-1.5 w-fit"
        >
          <Bell className="w-3.5 h-3.5" />
          Manage Integrations
        </button>
      </div>

      {/* Key Metrics Row - Removed Engagement Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          title="Total Notifications"
          value={stats.totalNotifications}
          icon={Bell}
          trend="up"
          trendValue="+12%"
          colorClass="text-blue-500"
        />
        <StatCard
          title="Unread"
          value={stats.unreadNotifications}
          icon={Activity}
          trend="up"
          trendValue="+5%"
          colorClass="text-purple-500"
        />
        <StatCard
          title="Today"
          value={stats.todayNotifications}
          icon={CheckCircle}
          trend="up"
          trendValue="+2"
          colorClass="text-emerald-500"
        />
      </div>

      {/* Charts Row - Removed Engagement Gauge */}
      <div className="grid grid-cols-1 gap-5">
        {/* Main Bar Chart - Full Width */}
        <GlassCard className="flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-white">Platform Activity</h3>
              <p className="text-xs text-gray-400">Overview of notifications by source</p>
            </div>
            <div className="flex gap-1.5">
              {activeUsersData.map((item, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.category}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 min-h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeUsersData} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  stroke="#9ca3af" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={8}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-8}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {activeUsersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Recent Notifications List */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Recent Notifications</h3>
          <button 
            onClick={() => navigate('/notifications')}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-400">
            <thead className="bg-white/5 text-gray-300 font-medium">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentNotifications.length > 0 ? (
                recentNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-medium text-white">
                      {notification.title || 'Untitled Notification'}
                      <div className="text-xs text-gray-500 font-normal mt-0.5 line-clamp-1">
                        {notification.body || 'No description'}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                        {notification.source || 'system'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(notification.read)}`}>
                        {notification.read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(notification.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button 
                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500 text-xs">
                    No recent notifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Dashboard;