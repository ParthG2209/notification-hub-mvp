// CORS headers utility for Edge Functions

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';

export const corsHeaders = {
  'Access-Control-Allow-Origin': FRONTEND_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

export function handleCors(req) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

export function createResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}

export function createErrorResponse(message, status = 400, details = null) {
  const error = {
    error: message,
    status,
  };
  
  if (details) {
    error.details = details;
  }
  
  return new Response(
    JSON.stringify(error),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}