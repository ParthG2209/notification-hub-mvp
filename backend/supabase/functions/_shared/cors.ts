// CORS headers utility for Edge Functions

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';

// Allow multiple origins for flexibility
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:3000',
  'https://notification-hub-mvp.vercel.app',
  // Add your Vercel preview URLs if needed
];

console.log('CORS Configuration:', {
  frontendUrl: FRONTEND_URL,
  allowedOrigins: ALLOWED_ORIGINS,
  envVarExists: !!Deno.env.get('FRONTEND_URL')
});

// Determine which origin to allow based on request
function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin');
  console.log('Request origin:', origin);
  
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  
  // Fallback to FRONTEND_URL
  return FRONTEND_URL;
}

export function getCorsHeaders(req: Request) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(req),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Legacy export for backward compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': FRONTEND_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

export function handleCors(req: Request): Response | null {
  const headers = getCorsHeaders(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response('ok', { headers });
  }
  return null;
}

export function createResponse(data: any, status = 200, req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );
}

export function createErrorResponse(message: string, status = 400, details: any = null, req?: Request): Response {
  const headers = req ? getCorsHeaders(req) : corsHeaders;
  
  const error: any = {
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
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );
}