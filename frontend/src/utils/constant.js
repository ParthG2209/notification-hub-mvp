export const APP_NAME = 'Notification Hub';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  INTEGRATIONS: '/integrations',
  AUTH_CALLBACK: '/auth/callback',
};

export const INTEGRATION_TYPES = {
  GMAIL: 'gmail',
  SLACK: 'slack',
  GOOGLE_DRIVE: 'google-drive',
  HUBSPOT: 'hubspot',
};

export const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
};

export const API_ENDPOINTS = {
  NOTIFICATIONS: '/api/notifications',
  INTEGRATIONS: '/api/integrations',
  WEBHOOKS: '/api/webhooks',
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
};

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
};