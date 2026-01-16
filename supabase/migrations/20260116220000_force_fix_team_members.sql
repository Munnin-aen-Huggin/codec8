-- ============================================
-- FORCE FIX TEAM_MEMBERS INFINITE RECURSION
-- Disable RLS, drop ALL policies, re-enable with simple ones
-- ============================================

-- Disable RLS temporarily
ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies on team_members (using pg_policies to find them)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'team_members' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_members', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create single simple policy
CREATE POLICY "full_access_team_members" ON public.team_members
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Same for teams table
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'teams' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.teams', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "full_access_teams" ON public.teams
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Same for repositories
ALTER TABLE public.repositories DISABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'repositories' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.repositories', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "full_access_repositories" ON public.repositories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verification
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'team_members' AND schemaname = 'public';

    IF policy_count = 1 THEN
        RAISE NOTICE 'SUCCESS: team_members has exactly 1 policy (no recursion possible)';
    ELSE
        RAISE WARNING 'team_members has % policies', policy_count;
    END IF;
END $$;
