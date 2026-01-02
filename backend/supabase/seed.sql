-- Seed data for development and testing
-- This file will run after migrations in local development

-- Note: In production, users will be created through Supabase Auth
-- This is just for local development and testing

-- Insert sample notifications for testing (replace UUID with actual user ID from auth.users)
-- First, you'll need to sign up a user through the frontend, then use their UUID here

-- Example seed data structure:
/*
INSERT INTO public.integrations (user_id, integration_type, access_token, refresh_token, token_expires_at, status)
VALUES 
    ('your-user-uuid-here', 'gmail', 'dummy_access_token', 'dummy_refresh_token', NOW() + INTERVAL '1 hour', 'active'),
    ('your-user-uuid-here', 'slack', 'dummy_access_token', 'dummy_refresh_token', NOW() + INTERVAL '1 hour', 'active');

INSERT INTO public.notifications (user_id, integration_id, title, body, source, source_id, read, metadata)
VALUES 
    (
        'your-user-uuid-here',
        (SELECT id FROM public.integrations WHERE integration_type = 'gmail' LIMIT 1),
        'Welcome to Notification Hub',
        'This is your first notification. Connect your integrations to start receiving real notifications!',
        'gmail',
        'welcome-1',
        false,
        '{"priority": "high"}'::jsonb
    ),
    (
        'your-user-uuid-here',
        (SELECT id FROM public.integrations WHERE integration_type = 'slack' LIMIT 1),
        'New message in #general',
        'John Doe: Hey everyone, check out this notification hub!',
        'slack',
        'slack-msg-1',
        false,
        '{"channel": "general", "user": "John Doe"}'::jsonb
    );
*/

-- The above is commented out because it requires actual user UUIDs
-- To use this in development:
-- 1. Sign up a user through your frontend
-- 2. Get the user UUID from Supabase Dashboard (Authentication > Users)
-- 3. Replace 'your-user-uuid-here' with the actual UUID
-- 4. Uncomment and run this seed file

-- For now, we'll just add a comment
SELECT 'Seed file ready - add actual user UUID to insert sample data' AS message;