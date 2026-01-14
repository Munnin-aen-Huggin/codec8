-- Fix RLS policies for anonymous access to leads and analytics_events
-- These tables need to allow inserts from the API without authentication

-- ============================================
-- 1. FIX analytics_events TABLE
-- ============================================

-- Allow anonymous inserts (for tracking)
DROP POLICY IF EXISTS "anon_insert_analytics_events" ON public.analytics_events;
CREATE POLICY "anon_insert_analytics_events" ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated inserts
DROP POLICY IF EXISTS "authenticated_insert_analytics_events" ON public.analytics_events;
CREATE POLICY "authenticated_insert_analytics_events" ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant insert to anon and authenticated
GRANT INSERT ON public.analytics_events TO anon;
GRANT INSERT ON public.analytics_events TO authenticated;

-- ============================================
-- 2. FIX leads TABLE
-- ============================================

-- Allow anonymous inserts (for email capture)
DROP POLICY IF EXISTS "anon_insert_leads" ON public.leads;
CREATE POLICY "anon_insert_leads" ON public.leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated inserts
DROP POLICY IF EXISTS "authenticated_insert_leads" ON public.leads;
CREATE POLICY "authenticated_insert_leads" ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anonymous updates (for upsert)
DROP POLICY IF EXISTS "anon_update_leads" ON public.leads;
CREATE POLICY "anon_update_leads" ON public.leads
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Grant insert and update to anon and authenticated
GRANT INSERT, UPDATE ON public.leads TO anon;
GRANT INSERT, UPDATE ON public.leads TO authenticated;

-- ============================================
-- 3. Verify policies
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated for anonymous access';
END $$;
