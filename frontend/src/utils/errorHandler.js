/**
 * Error handler utility for consistent error handling across the app
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle API errors
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error
    const message = error.response.data?.message || 'An error occurred';
    return {
      message,
      statusCode: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server. Please check your connection.',
      statusCode: 0,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    };
  }
};

/**
 * Handle Supabase errors
 */
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);

  const errorMessages = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User already registered': 'An account with this email already exists',
  };

  return {
    message: errorMessages[error.message] || error.message || 'An error occurred',
    code: error.code,
  };
};

/**
 * Log error to console (in development) or error tracking service (in production)
 */
export const logError = (error, context = {}) => {
  if (import.meta.env.DEV) {
    console.error('Error:', error);
    console.error('Context:', context);
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { extra: context });
  }
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error.message) {
    // Map technical errors to user-friendly messages
    const friendlyMessages = {
      'Network Error': 'Unable to connect. Please check your internet connection.',
      'timeout': 'Request timed out. Please try again.',
      'Failed to fetch': 'Unable to load data. Please try again.',
    };

    return friendlyMessages[error.message] || error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Validation error handler
 */
export const handleValidationError = (errors) => {
  if (Array.isArray(errors)) {
    return errors.map(err => err.message).join(', ');
  }
  
  if (typeof errors === 'object') {
    return Object.values(errors).flat().join(', ');
  }
  
  return 'Validation failed';
};