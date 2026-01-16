-- ============================================
-- FIX PROFILE SELECT FOR AUTH FLOW
-- The auth callback needs to check if a profile exists
-- ============================================

-- Allow SELECT on profiles during auth (by github_username or email lookup)
-- This is needed for the "user already exists" check during signup
DROP POLICY IF EXISTS "Anyone can check if profile exists" ON public.profiles;
CREATE POLICY "Anyone can check if profile exists" ON public.profiles
  FOR SELECT
  USING (true);

-- Same for sessions - need to validate sessions
DROP POLICY IF EXISTS "Anyone can read sessions" ON public.sessions;
CREATE POLICY "Anyone can read sessions" ON public.sessions
  FOR SELECT
  USING (true);

-- Allow UPDATE on profiles (for token refresh)
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
CREATE POLICY "Anyone can update profiles" ON public.profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow UPDATE on sessions
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.sessions;
CREATE POLICY "Anyone can update sessions" ON public.sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow DELETE on sessions (for logout)
DROP POLICY IF EXISTS "Anyone can delete sessions" ON public.sessions;
CREATE POLICY "Anyone can delete sessions" ON public.sessions
  FOR DELETE
  USING (true);

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Full permissive policies added for profiles and sessions';
END $$;
