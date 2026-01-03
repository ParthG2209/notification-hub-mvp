// backend/supabase/functions/_shared/supabase.ts

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
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      global: {
        headers: authHeader ? {
          Authorization: authHeader,
        } : {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Get user from JWT token - SIMPLIFIED VERSION
// When JWT verification is enabled at the gateway level,
// the JWT is already validated before reaching your code
export async function getUserFromRequest(req: Request): Promise<{ user: any | null; error: string | null }> {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header found');
      return { user: null, error: 'No authorization header' };
    }
    
    console.log('Auth header present, creating client...');
    
    // Create a client with the user's token
    const supabaseClient = createSupabaseClient(req);
    
    // When JWT verification is enabled at the gateway, the token is already validated
    // We just need to get the user data
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      return { user: null, error: error.message };
    }
    
    if (!user) {
      console.error('No user found');
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