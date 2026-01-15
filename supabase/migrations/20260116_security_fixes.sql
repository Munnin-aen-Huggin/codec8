-- ============================================
-- SECURITY FIX MIGRATION - 2026-01-16
-- Fixes critical RLS policy vulnerabilities
-- ============================================

-- ============================================
-- 1. FIX TEAM INVITATIONS - CRITICAL
-- The "Invitations can be accepted" policy allows
-- ANY user to update ANY invitation. This is dangerous.
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Invitations can be accepted" ON public.team_invitations;

-- Create a proper policy that only allows:
-- 1. The invited user (matching email) to accept their invitation
-- 2. Team admins to modify invitations
CREATE POLICY "Invited users can accept their own invitations"
ON public.team_invitations FOR UPDATE
USING (
  -- Must be a team admin OR the person being invited
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
  OR
  -- Allow accepting if invitation email matches user's email
  email IN (
    SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  -- Same conditions for what can be written
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
  OR
  email IN (
    SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()
  )
);

-- ============================================
-- 2. FIX USAGE LOGS - MEDIUM
-- "Service can insert usage logs" allows anyone to insert
-- ============================================

DROP POLICY IF EXISTS "Service can insert usage logs" ON public.usage_logs;

-- Only allow authenticated users to insert their own usage logs
CREATE POLICY "Authenticated users can insert own usage logs"
ON public.usage_logs FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR auth.role() = 'service_role'
);

-- Add service role full access policy
DROP POLICY IF EXISTS "service_role_all_usage_logs" ON public.usage_logs;
CREATE POLICY "service_role_all_usage_logs" ON public.usage_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. FIX SSO SESSIONS - CRITICAL
-- "Service can insert SSO sessions" allows anyone to create sessions
-- ============================================

DROP POLICY IF EXISTS "Service can insert SSO sessions" ON public.sso_sessions;

-- Only service role should be able to create SSO sessions
-- (SSO callback endpoint uses supabaseAdmin)
CREATE POLICY "Only service role can insert SSO sessions"
ON public.sso_sessions FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Add service role full access policy
DROP POLICY IF EXISTS "service_role_all_sso_sessions" ON public.sso_sessions;
CREATE POLICY "service_role_all_sso_sessions" ON public.sso_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. ADD SERVICE ROLE POLICIES TO ALL TABLES
-- Ensure supabaseAdmin can always operate
-- ============================================

-- profiles
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
CREATE POLICY "service_role_all_profiles" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- repositories
DROP POLICY IF EXISTS "service_role_all_repositories" ON public.repositories;
CREATE POLICY "service_role_all_repositories" ON public.repositories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- documentation
DROP POLICY IF EXISTS "service_role_all_documentation" ON public.documentation;
CREATE POLICY "service_role_all_documentation" ON public.documentation
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- teams
DROP POLICY IF EXISTS "service_role_all_teams" ON public.teams;
CREATE POLICY "service_role_all_teams" ON public.teams
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- team_members
DROP POLICY IF EXISTS "service_role_all_team_members" ON public.team_members;
CREATE POLICY "service_role_all_team_members" ON public.team_members
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- team_invitations
DROP POLICY IF EXISTS "service_role_all_team_invitations" ON public.team_invitations;
CREATE POLICY "service_role_all_team_invitations" ON public.team_invitations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- doc_templates
DROP POLICY IF EXISTS "service_role_all_doc_templates" ON public.doc_templates;
CREATE POLICY "service_role_all_doc_templates" ON public.doc_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- sso_configs
DROP POLICY IF EXISTS "service_role_all_sso_configs" ON public.sso_configs;
CREATE POLICY "service_role_all_sso_configs" ON public.sso_configs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- addon_purchases
DROP POLICY IF EXISTS "service_role_all_addon_purchases" ON public.addon_purchases;
CREATE POLICY "service_role_all_addon_purchases" ON public.addon_purchases
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- doc_staleness_alerts
DROP POLICY IF EXISTS "service_role_all_staleness_alerts" ON public.doc_staleness_alerts;
CREATE POLICY "service_role_all_staleness_alerts" ON public.doc_staleness_alerts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- doc_quality_scores
DROP POLICY IF EXISTS "service_role_all_quality_scores" ON public.doc_quality_scores;
CREATE POLICY "service_role_all_quality_scores" ON public.doc_quality_scores
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- audit_logs
DROP POLICY IF EXISTS "service_role_all_audit_logs" ON public.audit_logs;
CREATE POLICY "service_role_all_audit_logs" ON public.audit_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- licenses
DROP POLICY IF EXISTS "service_role_all_licenses" ON public.licenses;
CREATE POLICY "service_role_all_licenses" ON public.licenses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- purchased_repos
DROP POLICY IF EXISTS "service_role_all_purchased_repos" ON public.purchased_repos;
CREATE POLICY "service_role_all_purchased_repos" ON public.purchased_repos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. FIX MISSING team_members COLUMNS
-- Some columns may be missing from earlier migrations
-- ============================================

-- Add status column if not exists
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));

-- Add invited_by column if not exists
ALTER TABLE public.team_members
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.profiles(id);

-- ============================================
-- 6. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_default_team_id ON public.profiles(default_team_id);

-- ============================================
-- 7. FIX addon_purchases CONSTRAINT TO INCLUDE 'sso'
-- ============================================

-- Drop the old constraint and create new one with 'sso' type
ALTER TABLE public.addon_purchases DROP CONSTRAINT IF EXISTS addon_purchases_addon_type_check;
ALTER TABLE public.addon_purchases ADD CONSTRAINT addon_purchases_addon_type_check
  CHECK (addon_type IN ('unlimited_regen', 'extra_repos', 'extra_seats', 'audit_logs', 'sso'));

-- ============================================
-- 8. GRANT PERMISSIONS TO service_role
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================
-- 9. VERIFICATION
-- ============================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Count service_role policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE policyname LIKE 'service_role%';

  RAISE NOTICE 'Service role policies count: %', policy_count;

  -- Verify critical policies were dropped/replaced
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Invitations can be accepted'
  ) THEN
    RAISE NOTICE 'SUCCESS: Dangerous invitation policy removed';
  ELSE
    RAISE WARNING 'FAILED: Dangerous invitation policy still exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Service can insert usage logs'
  ) THEN
    RAISE NOTICE 'SUCCESS: Dangerous usage_logs policy removed';
  ELSE
    RAISE WARNING 'FAILED: Dangerous usage_logs policy still exists';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Service can insert SSO sessions'
  ) THEN
    RAISE NOTICE 'SUCCESS: Dangerous sso_sessions policy removed';
  ELSE
    RAISE WARNING 'FAILED: Dangerous sso_sessions policy still exists';
  END IF;
END $$;
