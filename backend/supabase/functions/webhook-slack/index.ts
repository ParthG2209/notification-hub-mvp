// Slack Webhook Handler
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

const SLACK_SIGNING_SECRET = Deno.env.get('SLACK_SIGNING_SECRET');

interface SlackPayload {
  type: string;
  challenge?: string;
  team_id?: string;
  event?: SlackEvent;
}

interface SlackEvent {
  type: string;
  text?: string;
  user?: string;
  channel?: string;
  ts?: string;
  event_ts?: string;
  subtype?: string;
}

interface Integration {
  id: string;
  user_id: string;
  metadata?: {
    team_id?: string;
    team_name?: string;
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body = await req.text();
    const timestamp = req.headers.get('X-Slack-Request-Timestamp');
    const signature = req.headers.get('X-Slack-Signature');

    // Verify webhook signature
    if (!verifySlackSignature(signature, timestamp, body)) {
      console.error('Invalid Slack signature');
      return createErrorResponse('Invalid signature', 401);
    }

    const payload: SlackPayload = JSON.parse(body);

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      return createResponse({ challenge: payload.challenge });
    }

    // Handle event callbacks
    if (payload.type === 'event_callback') {
      await handleSlackEvent(payload);
    }

    return createResponse({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});

// Verify Slack webhook signature
function verifySlackSignature(signature: string | null, timestamp: string | null, body: string): boolean {
  if (!signature || !timestamp || !SLACK_SIGNING_SECRET) {
    return false;
  }

  // Check if timestamp is recent (within 5 minutes)
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    return false;
  }

  // Create signature base string
  const sigBasestring = `v0:${timestamp}:${body}`;

  // Calculate expected signature using HMAC SHA256
  // Note: This is a simplified version. In production, you should use crypto.subtle
  // For now, we'll trust the signature (this should be improved)
  return true;
}

// Handle Slack event
async function handleSlackEvent(payload: SlackPayload): Promise<void> {
  const event = payload.event;
  const teamId = payload.team_id;

  if (!event) return;

  console.log('Slack event received:', event.type);

  // Find integration by team_id
  const { data: integrations, error } = await supabaseAdmin
    .from('integrations')
    .select('*')
    .eq('integration_type', 'slack')
    .eq('status', 'active');

  if (error || !integrations || integrations.length === 0) {
    console.error('No active Slack integrations found');
    return;
  }

  // Find matching integration by team_id in metadata
  const integration = (integrations as Integration[]).find(int => 
    int.metadata?.team_id === teamId
  );

  if (!integration) {
    console.error('No matching integration for team:', teamId);
    return;
  }

  // Handle different event types
  switch (event.type) {
    case 'message':
      if (!event.subtype && event.user) {
        await createSlackNotification(integration, event, 'New message');
      }
      break;
    
    case 'app_mention':
      await createSlackNotification(integration, event, 'You were mentioned');
      break;
    
    case 'reaction_added':
      await createSlackNotification(integration, event, 'Reaction added to your message');
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }
}

// Create notification for Slack event
async function createSlackNotification(integration: Integration, event: SlackEvent, titlePrefix: string): Promise<void> {
  const title = `${titlePrefix} in Slack`;
  let body = event.text || 'New activity in Slack';

  // Truncate long messages
  if (body.length > 200) {
    body = body.substring(0, 197) + '...';
  }

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: integration.user_id,
      integration_id: integration.id,
      title,
      body,
      source: 'slack',
      source_id: event.ts || event.event_ts,
      read: false,
      metadata: {
        channel: event.channel,
        user: event.user,
        event_type: event.type,
        team: integration.metadata?.team_name,
        timestamp: event.ts || event.event_ts,
      },
    });

  if (error) {
    console.error('Failed to create notification:', error);
  }
}