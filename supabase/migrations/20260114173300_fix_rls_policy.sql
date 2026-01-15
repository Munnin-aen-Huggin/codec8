-- Fix RLS policy for demo_usage and blocked_clients tables
-- Issue: Missing WITH CHECK clause prevents INSERT operations

-- Drop existing policies
DROP POLICY IF EXISTS "Service role only - demo_usage" ON public.demo_usage;
DROP POLICY IF EXISTS "Service role only - blocked_clients" ON public.blocked_clients;

-- Recreate with proper INSERT permissions (WITH CHECK)
CREATE POLICY "Service role only - demo_usage" ON public.demo_usage
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role only - blocked_clients" ON public.blocked_clients
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Also fix analytics_events table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    DROP POLICY IF EXISTS "Service role only - analytics_events" ON public.analytics_events;

    CREATE POLICY "Service role only - analytics_events" ON public.analytics_events
      FOR ALL TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Verify RLS is enabled
ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_clients ENABLE ROW LEVEL SECURITY;
