// HubSpot Webhook Handler
import { handleCors, createResponse, createErrorResponse } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';

interface HubSpotEvent {
  subscriptionType: string;
  objectId: number;
  portalId: number;
  eventId: number;
  occurredAt?: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const payload = await req.json();

    console.log('HubSpot webhook received:', payload);

    // HubSpot sends an array of events
    if (!Array.isArray(payload)) {
      return createErrorResponse('Invalid payload format', 400);
    }

    // Process each event
    for (const event of payload as HubSpotEvent[]) {
      await handleHubSpotEvent(event);
    }

    return createResponse({ success: true, events: payload.length });

  } catch (error) {
    console.error('Webhook error:', error);
    return createErrorResponse('Internal server error', 500, (error as Error).message);
  }
});

// Handle HubSpot event
async function handleHubSpotEvent(event: HubSpotEvent): Promise<void> {
  const { subscriptionType, objectId, portalId, eventId } = event;

  console.log('Processing HubSpot event:', subscriptionType, objectId);

  // Find integration by portal_id (hub_id)
  const { data: integrations, error } = await supabaseAdmin
    .from('integrations')
    .select('*')
    .eq('integration_type', 'hubspot')
    .eq('status', 'active');

  if (error || !integrations || integrations.length === 0) {
    console.error('No active HubSpot integrations found');
    return;
  }

  // Find matching integration by hub_id
  const integration = integrations.find(int => 
    int.metadata?.hub_id === portalId
  );

  if (!integration) {
    console.error('No matching integration for portal:', portalId);
    return;
  }

  // Create notification based on subscription type
  let title = 'HubSpot Activity';
  let body = '';

  switch (subscriptionType) {
    case 'contact.creation':
      title = 'New Contact Created';
      body = `A new contact was added to your CRM (ID: ${objectId})`;
      break;
    
    case 'contact.propertyChange':
      title = 'Contact Updated';
      body = `A contact was updated in your CRM (ID: ${objectId})`;
      break;
    
    case 'deal.creation':
      title = 'New Deal Created';
      body = `A new deal was created (ID: ${objectId})`;
      break;
    
    case 'deal.propertyChange':
      title = 'Deal Updated';
      body = `A deal was updated (ID: ${objectId})`;
      break;
    
    case 'company.creation':
      title = 'New Company Created';
      body = `A new company was added (ID: ${objectId})`;
      break;

    default:
      title = 'HubSpot Update';
      body = `${subscriptionType} (ID: ${objectId})`;
  }

  // Store notification
  const { error: notifError } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: integration.user_id,
      integration_id: integration.id,
      title,
      body,
      source: 'hubspot',
      source_id: eventId?.toString() || objectId?.toString(),
      read: false,
      metadata: {
        subscription_type: subscriptionType,
        object_id: objectId,
        portal_id: portalId,
        event_id: eventId,
        occurred_at: event.occurredAt,
      },
    });

  if (notifError) {
    console.error('Failed to create notification:', notifError);
  }
}