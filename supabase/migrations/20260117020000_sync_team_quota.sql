-- ============================================
-- SYNC TEAM QUOTA FROM USAGE_LOGS
-- ============================================

-- Update each team's repos_used_this_month based on actual usage_logs
DO $$
DECLARE
  t RECORD;
  log_count INTEGER;
BEGIN
  -- For each team, count their usage_logs from this month
  FOR t IN SELECT DISTINCT team_id FROM usage_logs WHERE team_id IS NOT NULL LOOP
    SELECT COUNT(*) INTO log_count
    FROM usage_logs
    WHERE team_id = t.team_id
    AND created_at >= date_trunc('month', CURRENT_DATE);

    UPDATE teams
    SET repos_used_this_month = log_count
    WHERE id = t.team_id;

    RAISE NOTICE 'Updated team % with % repos used this month', t.team_id, log_count;
  END LOOP;
END $$;

-- Also create a function to increment team usage
DROP FUNCTION IF EXISTS public.increment_team_usage(UUID);

CREATE OR REPLACE FUNCTION public.increment_team_usage(team_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE teams
  SET repos_used_this_month = COALESCE(repos_used_this_month, 0) + 1
  WHERE id = team_id;
END;
$$;

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Team quotas synced and increment_team_usage function created';
END $$;
