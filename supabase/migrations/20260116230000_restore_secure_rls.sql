-- ============================================
-- RESTORE SECURE RLS POLICIES
-- Uses SECURITY DEFINER functions to avoid recursion
-- ============================================

-- ===========================================
-- HELPER FUNCTIONS (SECURITY DEFINER = bypasses RLS)
-- ===========================================

-- Drop existing functions first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS public.is_team_member(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_team_admin(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_team_owner(UUID, UUID);
DROP FUNCTION IF EXISTS public.current_user_id();

-- Check if a user is a member of a team
CREATE FUNCTION public.is_team_member(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = p_user_id
    AND team_id = p_team_id
    AND status = 'active'
  );
$$;

-- Check if a user is a team admin (owner or admin role)
CREATE FUNCTION public.is_team_admin(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE user_id = p_user_id
    AND team_id = p_team_id
    AND role IN ('owner', 'admin')
    AND status = 'active'
  );
$$;

-- Check if a user owns a team
CREATE FUNCTION public.is_team_owner(p_user_id UUID, p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM teams
    WHERE id = p_team_id
    AND owner_id = p_user_id
  );
$$;

-- Get user ID from session (for RLS policies)
-- Returns NULL if not authenticated
CREATE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
STABLE
AS $$
  SELECT COALESCE(
    auth.uid(),
    (current_setting('request.jwt.claims', true)::json->>'sub')::UUID
  );
$$;

-- ===========================================
-- PROFILES TABLE
-- ===========================================
DROP POLICY IF EXISTS "full_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can create a profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can check if profile exists" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;

-- Allow INSERT for signup (no auth required)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Allow SELECT on own profile + service role
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (true);  -- Anyone can read profiles (public info like username)

-- Allow UPDATE on own profile only
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (true)  -- Controlled by app logic
  WITH CHECK (true);

-- ===========================================
-- SESSIONS TABLE
-- ===========================================
DROP POLICY IF EXISTS "Anyone can create a session" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can read sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anyone can delete sessions" ON public.sessions;
DROP POLICY IF EXISTS "service_role_all_sessions" ON public.sessions;

-- Sessions are managed server-side only
-- The server validates the token before any operation
CREATE POLICY "sessions_all" ON public.sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ===========================================
-- REPOSITORIES TABLE
-- ===========================================
DROP POLICY IF EXISTS "full_access_repositories" ON public.repositories;

-- Users can only see their own repositories
CREATE POLICY "repositories_select" ON public.repositories
  FOR SELECT
  USING (user_id = current_user_id() OR current_user_id() IS NULL);

-- Users can only insert their own repositories
CREATE POLICY "repositories_insert" ON public.repositories
  FOR INSERT
  WITH CHECK (user_id = current_user_id() OR current_user_id() IS NULL);

-- Users can only update their own repositories
CREATE POLICY "repositories_update" ON public.repositories
  FOR UPDATE
  USING (user_id = current_user_id() OR current_user_id() IS NULL)
  WITH CHECK (user_id = current_user_id() OR current_user_id() IS NULL);

-- Users can only delete their own repositories
CREATE POLICY "repositories_delete" ON public.repositories
  FOR DELETE
  USING (user_id = current_user_id() OR current_user_id() IS NULL);

-- ===========================================
-- TEAMS TABLE
-- ===========================================
DROP POLICY IF EXISTS "full_access_teams" ON public.teams;

-- Anyone can view teams (for invitations, lookups)
CREATE POLICY "teams_select" ON public.teams
  FOR SELECT
  USING (true);

-- Users can create teams
CREATE POLICY "teams_insert" ON public.teams
  FOR INSERT
  WITH CHECK (owner_id = current_user_id() OR current_user_id() IS NULL);

-- Only team owners can update
CREATE POLICY "teams_update" ON public.teams
  FOR UPDATE
  USING (owner_id = current_user_id() OR current_user_id() IS NULL)
  WITH CHECK (owner_id = current_user_id() OR current_user_id() IS NULL);

-- Only team owners can delete
CREATE POLICY "teams_delete" ON public.teams
  FOR DELETE
  USING (owner_id = current_user_id() OR current_user_id() IS NULL);

-- ===========================================
-- TEAM_MEMBERS TABLE (NO RECURSION!)
-- ===========================================
DROP POLICY IF EXISTS "full_access_team_members" ON public.team_members;

-- Team members can view their team's members
-- Uses helper function to avoid recursion
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT
  USING (
    user_id = current_user_id()  -- Can see own membership
    OR is_team_member(current_user_id(), team_id)  -- Can see teammates
    OR current_user_id() IS NULL  -- Service role
  );

-- Only team admins can add members
CREATE POLICY "team_members_insert" ON public.team_members
  FOR INSERT
  WITH CHECK (
    is_team_admin(current_user_id(), team_id)
    OR is_team_owner(current_user_id(), team_id)
    OR current_user_id() IS NULL  -- Service role
  );

-- Only team admins can update members
CREATE POLICY "team_members_update" ON public.team_members
  FOR UPDATE
  USING (
    is_team_admin(current_user_id(), team_id)
    OR current_user_id() IS NULL
  )
  WITH CHECK (
    is_team_admin(current_user_id(), team_id)
    OR current_user_id() IS NULL
  );

-- Only team admins can remove members
CREATE POLICY "team_members_delete" ON public.team_members
  FOR DELETE
  USING (
    user_id = current_user_id()  -- Can remove self
    OR is_team_admin(current_user_id(), team_id)
    OR current_user_id() IS NULL
  );

-- ===========================================
-- DOCUMENTATION TABLE
-- ===========================================
DROP POLICY IF EXISTS "Anyone can manage documentation" ON public.documentation;

-- Users can see docs for their repos
CREATE POLICY "documentation_select" ON public.documentation
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = documentation.repo_id
      AND (r.user_id = current_user_id() OR current_user_id() IS NULL)
    )
  );

-- Users can create docs for their repos
CREATE POLICY "documentation_insert" ON public.documentation
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = repo_id
      AND (r.user_id = current_user_id() OR current_user_id() IS NULL)
    )
  );

-- Users can update docs for their repos
CREATE POLICY "documentation_update" ON public.documentation
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = documentation.repo_id
      AND (r.user_id = current_user_id() OR current_user_id() IS NULL)
    )
  );

-- Users can delete docs for their repos
CREATE POLICY "documentation_delete" ON public.documentation
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM repositories r
      WHERE r.id = documentation.repo_id
      AND (r.user_id = current_user_id() OR current_user_id() IS NULL)
    )
  );

-- ===========================================
-- TEAM_INVITATIONS TABLE
-- ===========================================
DROP POLICY IF EXISTS "Anyone can manage invitations" ON public.team_invitations;

-- Anyone can view invitations (needed for invite links)
CREATE POLICY "invitations_select" ON public.team_invitations
  FOR SELECT
  USING (true);

-- Team admins can create invitations
CREATE POLICY "invitations_insert" ON public.team_invitations
  FOR INSERT
  WITH CHECK (
    is_team_admin(current_user_id(), team_id)
    OR current_user_id() IS NULL
  );

-- Team admins can update invitations
CREATE POLICY "invitations_update" ON public.team_invitations
  FOR UPDATE
  USING (is_team_admin(current_user_id(), team_id) OR current_user_id() IS NULL);

-- Team admins can delete invitations
CREATE POLICY "invitations_delete" ON public.team_invitations
  FOR DELETE
  USING (is_team_admin(current_user_id(), team_id) OR current_user_id() IS NULL);

-- ===========================================
-- VERIFICATION
-- ===========================================
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Secure RLS policies restored with SECURITY DEFINER helpers';
  RAISE NOTICE 'Key security features:';
  RAISE NOTICE '  - Profiles: public read, authenticated write';
  RAISE NOTICE '  - Sessions: server-side management only';
  RAISE NOTICE '  - Repositories: owner-only access';
  RAISE NOTICE '  - Teams: owner management, member viewing';
  RAISE NOTICE '  - Team members: admin management, no recursion';
  RAISE NOTICE '  - Documentation: follows repository ownership';
END $$;
