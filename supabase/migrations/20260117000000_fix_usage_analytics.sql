-- ============================================
-- FIX USAGE ANALYTICS
-- 1. Add permissive RLS policies for usage_logs
-- 2. Create increment_usage function
-- 3. Add status column to team_members if missing
-- ============================================

-- ===========================================
-- 1. FIX USAGE_LOGS RLS POLICIES
-- ===========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their usage logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Service can insert usage logs" ON public.usage_logs;
DROP POLICY IF EXISTS "usage_logs_select" ON public.usage_logs;
DROP POLICY IF EXISTS "usage_logs_insert" ON public.usage_logs;

-- Create permissive policies that work with service_role
CREATE POLICY "usage_logs_select" ON public.usage_logs
  FOR SELECT
  USING (true);

CREATE POLICY "usage_logs_insert" ON public.usage_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "usage_logs_update" ON public.usage_logs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "usage_logs_delete" ON public.usage_logs
  FOR DELETE
  USING (true);

-- ===========================================
-- 2. CREATE INCREMENT_USAGE FUNCTION
-- ===========================================

-- Drop if exists to avoid conflicts
DROP FUNCTION IF EXISTS public.increment_usage(UUID);

-- Create the increment_usage function
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE profiles
  SET repos_used_this_month = COALESCE(repos_used_this_month, 0) + 1
  WHERE id = p_user_id;
END;
$$;

-- ===========================================
-- 3. ADD STATUS COLUMN TO TEAM_MEMBERS
-- ===========================================

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'team_members'
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.team_members
    ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
  END IF;
END $$;

-- Update existing rows to have active status
UPDATE public.team_members SET status = 'active' WHERE status IS NULL;

-- ===========================================
-- 4. ADD REPOS_USED_THIS_MONTH IF MISSING
-- ===========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'repos_used_this_month'
  ) THEN
    ALTER TABLE public.profiles
    ADD COLUMN repos_used_this_month INTEGER DEFAULT 0;
  END IF;
END $$;

-- ===========================================
-- 5. VERIFICATION
-- ===========================================

DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'usage_logs' AND schemaname = 'public';

  RAISE NOTICE 'SUCCESS: usage_logs has % policies', policy_count;
  RAISE NOTICE 'increment_usage function created';
  RAISE NOTICE 'team_members.status column ensured';
  RAISE NOTICE 'profiles.repos_used_this_month column ensured';
END $$;
