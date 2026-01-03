// Supabase client for Edge Functions
import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key
// This bypasses RLS and should be used carefully
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create Supabase client from request (uses user's JWT)
export function createSupabaseClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Get user from JWT token with better error handling
export async function getUserFromRequest(req: Request): Promise<{ user: any | null; error: string | null }> {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header found');
      return { user: null, error: 'No authorization header' };
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token.length < 20) {
      console.error('Invalid token format:', { length: token?.length });
      return { user: null, error: 'Invalid token format' };
    }
    
    console.log('Attempting to get user from token:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10) + '...'
    });
    
    // Try to get user with the token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) {
      console.error('Error getting user from token:', error);
      return { user: null, error: error.message };
    }
    
    if (!user) {
      console.error('No user found for token');
      return { user: null, error: 'User not found' };
    }
    
    console.log('User retrieved successfully:', {
      userId: user.id,
      email: user.email
    });
    
    return { user, error: null };
  } catch (error) {
    console.error('Exception in getUserFromRequest:', error);
    return { user: null, error: (error as Error).message };
  }
}