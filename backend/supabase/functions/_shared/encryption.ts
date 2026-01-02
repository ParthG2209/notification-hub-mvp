// Token encryption utilities
// Note: In production, consider using Supabase Vault for encryption
// https://supabase.com/docs/guides/database/vault

// For now, we'll store tokens as-is since Supabase handles encryption
// at the database level for sensitive columns

export function encryptToken(token: string): string {
  // In a production environment, you might want to add an extra layer
  // of encryption here before storing in the database
  // For now, we rely on Supabase's built-in encryption
  return token;
}

export function decryptToken(encryptedToken: string): string {
  // Corresponding decryption function
  // Currently just returns the token as-is
  return encryptedToken;
}

// Mask token for logging (show only first and last 4 characters)
export function maskToken(token: string): string {
  if (!token || token.length < 12) {
    return '****';
  }
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}

// Validate token format
export function isValidToken(token: string): boolean {
  return typeof token === 'string' && token.length > 0;
}

// Generate a random state parameter for OAuth (CSRF protection)
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Verify state parameter
export function verifyState(receivedState: string, expectedState: string): boolean {
  if (!receivedState || !expectedState) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (receivedState.length !== expectedState.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < receivedState.length; i++) {
    result |= receivedState.charCodeAt(i) ^ expectedState.charCodeAt(i);
  }
  
  return result === 0;
}