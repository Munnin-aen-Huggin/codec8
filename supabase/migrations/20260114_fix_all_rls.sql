-- Comprehensive RLS fix for all tables used by the app
-- Ensures service_role can perform all operations

-- ============================================
-- 1. FIX demo_usage TABLE
-- ============================================
ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Service role only - demo_usage" ON public.demo_usage;
DROP POLICY IF EXISTS "service_role_all_demo_usage" ON public.demo_usage;

-- Create policy that allows service_role full access
CREATE POLICY "service_role_all_demo_usage" ON public.demo_usage
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant all permissions to service_role
GRANT ALL ON public.demo_usage TO service_role;

-- ============================================
-- 2. FIX blocked_clients TABLE
-- ============================================
ALTER TABLE public.blocked_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role only - blocked_clients" ON public.blocked_clients;
DROP POLICY IF EXISTS "service_role_all_blocked_clients" ON public.blocked_clients;

CREATE POLICY "service_role_all_blocked_clients" ON public.blocked_clients
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.blocked_clients TO service_role;

-- ============================================
-- 3. FIX events TABLE (analytics)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Service role only - events" ON public.events;
    DROP POLICY IF EXISTS "service_role_all_events" ON public.events;

    CREATE POLICY "service_role_all_events" ON public.events
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);

    GRANT ALL ON public.events TO service_role;

    RAISE NOTICE 'events table RLS configured';
  ELSE
    RAISE NOTICE 'events table does not exist - skipping';
  END IF;
END $$;

-- ============================================
-- 4. Verify setup
-- ============================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename IN ('demo_usage', 'blocked_clients', 'events')
    AND policyname LIKE 'service_role%';

  RAISE NOTICE 'Service role policies created: %', policy_count;
END $$;
