-- ============================================
-- PHASE 11: TEAM COLLABORATION SCHEMA
-- ============================================
-- Migration for team-based features including:
-- - Teams table
-- - Team members and roles
-- - Team invitations
-- - Documentation templates
-- - Usage analytics/logging

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- 1.1 TEAMS TABLE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  max_seats INTEGER DEFAULT 5,
  max_repos_per_month INTEGER DEFAULT 100,
  repos_used_this_month INTEGER DEFAULT 0,
  repos_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 1.3 TEAM INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- 1.4 DOC TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.doc_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('readme', 'api', 'architecture', 'setup')),
  name TEXT NOT NULL,
  prompt_template TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- 1.5 USAGE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  repo_id UUID REFERENCES public.repositories(id) ON DELETE SET NULL,
  doc_type TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  generation_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 MODIFY REPOSITORIES TABLE - Add team_id
ALTER TABLE public.repositories
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- 1.7 MODIFY PROFILES TABLE - Add default_team_id
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS default_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

-- Team lookups
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);

-- Member lookups
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- Invitation lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);

-- Template lookups
CREATE INDEX IF NOT EXISTS idx_doc_templates_team_id ON public.doc_templates(team_id);

-- Usage analytics
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_team_id ON public.usage_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);

-- Team repos (partial index for non-null team_id)
CREATE INDEX IF NOT EXISTS idx_repositories_team_id ON public.repositories(team_id)
WHERE team_id IS NOT NULL;

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doc_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. RLS POLICIES - TEAMS
-- ============================================

-- Users can view teams they are members of
CREATE POLICY "Users can view their teams"
ON public.teams FOR SELECT
USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
);

-- Team owners can update their teams
CREATE POLICY "Team owners can update their teams"
ON public.teams FOR UPDATE
USING (owner_id = auth.uid());

-- Users can create teams (must be the owner)
CREATE POLICY "Users can create teams"
ON public.teams FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Team owners can delete their teams
CREATE POLICY "Team owners can delete their teams"
ON public.teams FOR DELETE
USING (owner_id = auth.uid());

-- ============================================
-- 5. RLS POLICIES - TEAM MEMBERS
-- ============================================

-- Team members can view team membership
CREATE POLICY "Team members can view team membership"
ON public.team_members FOR SELECT
USING (
  team_id IN (SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid())
);

-- Team admins/owners can insert members
CREATE POLICY "Team admins can add members"
ON public.team_members FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Team admins/owners can update members
CREATE POLICY "Team admins can update members"
ON public.team_members FOR UPDATE
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Team admins/owners can delete members
CREATE POLICY "Team admins can remove members"
ON public.team_members FOR DELETE
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- ============================================
-- 6. RLS POLICIES - TEAM INVITATIONS
-- ============================================

-- Team admins can view invitations
CREATE POLICY "Team admins can view invitations"
ON public.team_invitations FOR SELECT
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Team admins can create invitations
CREATE POLICY "Team admins can create invitations"
ON public.team_invitations FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Team admins can delete invitations
CREATE POLICY "Team admins can delete invitations"
ON public.team_invitations FOR DELETE
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Allow updating accepted_at (for accepting invitations)
CREATE POLICY "Invitations can be accepted"
ON public.team_invitations FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================
-- 7. RLS POLICIES - DOC TEMPLATES
-- ============================================

-- Team members can view templates
CREATE POLICY "Team members can view templates"
ON public.doc_templates FOR SELECT
USING (
  team_id IN (SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid())
);

-- Team admins can create templates
CREATE POLICY "Team admins can create templates"
ON public.doc_templates FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Team admins can update templates
CREATE POLICY "Team admins can update templates"
ON public.doc_templates FOR UPDATE
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Team admins can delete templates
CREATE POLICY "Team admins can delete templates"
ON public.doc_templates FOR DELETE
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- ============================================
-- 8. RLS POLICIES - USAGE LOGS
-- ============================================

-- Users can view their own usage logs and team usage logs
CREATE POLICY "Users can view their usage logs"
ON public.usage_logs FOR SELECT
USING (
  user_id = auth.uid() OR
  team_id IN (SELECT tm.team_id FROM public.team_members tm WHERE tm.user_id = auth.uid())
);

-- Allow inserting usage logs (service role will handle this)
CREATE POLICY "Service can insert usage logs"
ON public.usage_logs FOR INSERT
WITH CHECK (true);

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to check if user is team member
CREATE OR REPLACE FUNCTION is_team_member(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is team admin
CREATE OR REPLACE FUNCTION is_team_admin(p_team_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
    AND user_id = p_user_id
    AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team usage statistics
CREATE OR REPLACE FUNCTION get_team_usage(p_team_id UUID)
RETURNS TABLE (
  total_docs INTEGER,
  docs_by_type JSONB,
  repos_used INTEGER,
  seats_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.usage_logs WHERE team_id = p_team_id),
    (SELECT COALESCE(jsonb_object_agg(doc_type, count), '{}'::jsonb) FROM (
      SELECT doc_type, COUNT(*)::INTEGER as count
      FROM public.usage_logs
      WHERE team_id = p_team_id
      GROUP BY doc_type
    ) t),
    (SELECT COALESCE(repos_used_this_month, 0) FROM public.teams WHERE id = p_team_id),
    (SELECT COUNT(*)::INTEGER FROM public.team_members WHERE team_id = p_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. TRIGGER - AUTO-CREATE OWNER MEMBERSHIP
-- ============================================

-- Function to auto-create team owner as member
CREATE OR REPLACE FUNCTION create_team_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS on_team_created ON public.teams;

-- Create trigger
CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION create_team_owner_membership();

-- ============================================
-- 11. VERIFICATION
-- ============================================
DO $$
BEGIN
  -- Verify tables exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('teams', 'team_members', 'team_invitations', 'doc_templates', 'usage_logs')
  ) THEN
    RAISE NOTICE 'Team collaboration tables created successfully';
  END IF;

  -- Verify trigger exists
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_team_created'
  ) THEN
    RAISE NOTICE 'Team owner membership trigger created successfully';
  END IF;
END $$;
