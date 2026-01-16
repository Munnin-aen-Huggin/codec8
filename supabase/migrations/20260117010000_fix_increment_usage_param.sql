-- ============================================
-- FIX INCREMENT_USAGE PARAMETER NAME
-- The RPC call uses 'user_id' but function had 'p_user_id'
-- ============================================

-- Drop the old function
DROP FUNCTION IF EXISTS public.increment_usage(UUID);

-- Recreate with correct parameter name
CREATE OR REPLACE FUNCTION public.increment_usage(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE profiles
  SET repos_used_this_month = COALESCE(repos_used_this_month, 0) + 1
  WHERE id = user_id;
END;
$$;

-- Also fix the quota display - update the user's current count based on actual usage
-- This is a one-time fix to sync the quota with actual usage_logs
DO $$
DECLARE
  r RECORD;
  log_count INTEGER;
BEGIN
  -- For each user, count their usage_logs from this month and update repos_used_this_month
  FOR r IN SELECT DISTINCT user_id FROM usage_logs WHERE user_id IS NOT NULL LOOP
    SELECT COUNT(*) INTO log_count
    FROM usage_logs
    WHERE user_id = r.user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);

    UPDATE profiles
    SET repos_used_this_month = log_count
    WHERE id = r.user_id;

    RAISE NOTICE 'Updated user % with % repos used this month', r.user_id, log_count;
  END LOOP;
END $$;

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: increment_usage function recreated with correct parameter name';
END $$;
