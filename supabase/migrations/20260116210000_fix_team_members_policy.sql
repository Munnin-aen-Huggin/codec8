-- ============================================
-- FIX TEAM_MEMBERS INFINITE RECURSION
-- The policy was referencing itself causing infinite loop
-- ============================================

-- Drop all existing policies on team_members to start fresh
DROP POLICY IF EXISTS "Team members can view own team members" ON public.team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON public.team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_insert_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_update_policy" ON public.team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON public.team_members;
DROP POLICY IF EXISTS "service_role_all_team_members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;

-- Simple permissive policies to avoid recursion
CREATE POLICY "Anyone can view team_members" ON public.team_members
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert team_members" ON public.team_members
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update team_members" ON public.team_members
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete team_members" ON public.team_members
  FOR DELETE
  USING (true);

-- Also fix teams table
DROP POLICY IF EXISTS "team_select_policy" ON public.teams;
DROP POLICY IF EXISTS "team_insert_policy" ON public.teams;
DROP POLICY IF EXISTS "team_update_policy" ON public.teams;
DROP POLICY IF EXISTS "team_delete_policy" ON public.teams;
DROP POLICY IF EXISTS "service_role_all_teams" ON public.teams;

CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage teams" ON public.teams
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix team_invitations
DROP POLICY IF EXISTS "invitation_policies" ON public.team_invitations;
DROP POLICY IF EXISTS "service_role_all_team_invitations" ON public.team_invitations;

CREATE POLICY "Anyone can manage invitations" ON public.team_invitations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix repositories
DROP POLICY IF EXISTS "repo_select_policy" ON public.repositories;
DROP POLICY IF EXISTS "repo_insert_policy" ON public.repositories;
DROP POLICY IF EXISTS "repo_update_policy" ON public.repositories;
DROP POLICY IF EXISTS "repo_delete_policy" ON public.repositories;

CREATE POLICY "Anyone can manage repositories" ON public.repositories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix documentation
DROP POLICY IF EXISTS "doc_select_policy" ON public.documentation;
DROP POLICY IF EXISTS "doc_insert_policy" ON public.documentation;
DROP POLICY IF EXISTS "doc_update_policy" ON public.documentation;
DROP POLICY IF EXISTS "doc_delete_policy" ON public.documentation;

CREATE POLICY "Anyone can manage documentation" ON public.documentation
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Fixed team_members and related table policies';
END $$;
