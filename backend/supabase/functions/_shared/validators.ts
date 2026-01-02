// Request validation utilities

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateOAuthCode(code: string): ValidationResult {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Invalid authorization code' };
  }
  
  if (code.length < 10) {
    return { valid: false, error: 'Authorization code too short' };
  }
  
  return { valid: true };
}

export function validateIntegrationType(type: string): ValidationResult {
  const validTypes = ['gmail', 'slack', 'google-drive', 'hubspot'];
  
  if (!type || !validTypes.includes(type)) {
    return { 
      valid: false, 
      error: `Invalid integration type. Must be one of: ${validTypes.join(', ')}` 
    };
  }
  
  return { valid: true };
}

export function validateRequestBody(body: any, requiredFields: string[]): ValidationResult {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }
  
  const missing = requiredFields.filter(field => !(field in body));
  
  if (missing.length > 0) {
    return { 
      valid: false, 
      error: `Missing required fields: ${missing.join(', ')}` 
    };
  }
  
  return { valid: true };
}

export function validateWebhookSignature(signature: string | null, body: string, secret: string): ValidationResult {
  if (!signature) {
    return { valid: false, error: 'Missing webhook signature' };
  }
  
  if (!secret) {
    return { valid: false, error: 'Missing signing secret' };
  }
  
  // Signature validation will be specific to each service
  // This is a placeholder that should be implemented per-service
  return { valid: true };
}

export function validateUserId(userId: string): ValidationResult {
  // UUID v4 validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!userId || !uuidRegex.test(userId)) {
    return { valid: false, error: 'Invalid user ID format' };
  }
  
  return { valid: true };
}

export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function sanitizeInput(input: any): any {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 10000); // Limit length
}

export function validateEmailFormat(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
}