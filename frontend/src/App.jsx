import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Integrations from './pages/Integrations';
import OAuthCallback from './pages/0AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { IntegrationProvider } from './contexts/IntegrationContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Diagnostics from './pages/Diagnostics';

function App() {
  // Initialize theme on app load
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Default to system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <IntegrationProvider>
            <Router>
              <Routes>
                {/* Redirect root to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/auth/callback" element={<OAuthCallback />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
                
                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/integrations"
                  element={
                    <ProtectedRoute>
                      <Integrations />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </IntegrationProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;