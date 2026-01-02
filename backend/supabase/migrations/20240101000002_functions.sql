-- Database Functions

-- Function to get expired tokens (for token refresh cron job)
CREATE OR REPLACE FUNCTION get_expired_tokens()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    integration_type TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.user_id,
        i.integration_type,
        i.access_token,
        i.refresh_token,
        i.token_expires_at
    FROM public.integrations i
    WHERE i.status = 'active'
        AND i.refresh_token IS NOT NULL
        AND i.token_expires_at < NOW() + INTERVAL '5 minutes'
    ORDER BY i.token_expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean old notifications (optional, for maintenance)
CREATE OR REPLACE FUNCTION clean_old_notifications(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
        AND read = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification stats for a user
CREATE OR REPLACE FUNCTION get_notification_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'unread', COUNT(*) FILTER (WHERE read = FALSE),
        'read', COUNT(*) FILTER (WHERE read = TRUE),
        'today', COUNT(*) FILTER (WHERE created_at::DATE = CURRENT_DATE),
        'by_source', (
            SELECT json_object_agg(source, count)
            FROM (
                SELECT source, COUNT(*) as count
                FROM public.notifications
                WHERE user_id = p_user_id
                GROUP BY source
            ) source_counts
        )
    ) INTO stats
    FROM public.notifications
    WHERE user_id = p_user_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;