-- ============================================
-- FIX MISSING SERVICE ROLE POLICIES
-- The v2 migration accidentally removed service_role policies
-- needed for server-side operations
-- ============================================

-- Profiles - CRITICAL: needed for user creation during OAuth
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
CREATE POLICY "service_role_all_profiles" ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Repositories - needed for server-side repo operations
DROP POLICY IF EXISTS "service_role_all_repositories" ON public.repositories;
CREATE POLICY "service_role_all_repositories" ON public.repositories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Documentation - needed for doc generation
DROP POLICY IF EXISTS "service_role_all_documentation" ON public.documentation;
CREATE POLICY "service_role_all_documentation" ON public.documentation
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Licenses - needed for license management
DROP POLICY IF EXISTS "service_role_all_licenses" ON public.licenses;
CREATE POLICY "service_role_all_licenses" ON public.licenses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verification
DO $$
DECLARE
  missing_policies TEXT := '';
BEGIN
  -- Check each critical policy exists
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_profiles') THEN
    missing_policies := missing_policies || 'profiles, ';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_repositories') THEN
    missing_policies := missing_policies || 'repositories, ';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_documentation') THEN
    missing_policies := missing_policies || 'documentation, ';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'service_role_all_licenses') THEN
    missing_policies := missing_policies || 'licenses, ';
  END IF;

  IF missing_policies = '' THEN
    RAISE NOTICE 'SUCCESS: All service_role policies restored';
  ELSE
    RAISE WARNING 'MISSING: service_role policies for: %', missing_policies;
  END IF;
END $$;
