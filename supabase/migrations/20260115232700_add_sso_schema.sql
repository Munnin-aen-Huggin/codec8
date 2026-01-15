-- ============================================
-- PHASE 13: SSO/SAML ENTERPRISE AUTHENTICATION SCHEMA
-- ============================================
-- Migration for SSO/SAML authentication including:
-- - SSO configurations per team
-- - SSO sessions for IdP session tracking
-- - Profile SSO fields
-- - Enterprise tier tracking

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- 1.1 SSO CONFIGS TABLE
CREATE TABLE IF NOT EXISTS public.sso_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID UNIQUE NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('okta', 'azure_ad', 'google', 'custom')),
  entity_id TEXT NOT NULL,
  sso_url TEXT NOT NULL,
  certificate TEXT NOT NULL,
  attribute_mapping JSONB DEFAULT '{}',
  require_sso BOOLEAN DEFAULT false,
  jit_provisioning BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 SSO SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  idp_session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ALTER EXISTING TABLES
-- ============================================

-- 2.1 Add SSO columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sso_provider TEXT,
ADD COLUMN IF NOT EXISTS sso_id TEXT,
ADD COLUMN IF NOT EXISTS sso_team_id UUID REFERENCES public.teams(id);

-- 2.2 Add enterprise columns to teams
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS enterprise_tier BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sso_required BOOLEAN DEFAULT false;

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

-- SSO config lookups
CREATE INDEX IF NOT EXISTS idx_sso_configs_team_id ON public.sso_configs(team_id);

-- SSO session lookups
CREATE INDEX IF NOT EXISTS idx_sso_sessions_user_id ON public.sso_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_team_id ON public.sso_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_expires_at ON public.sso_sessions(expires_at);

-- Profile SSO lookups (partial index for non-null sso_id)
CREATE INDEX IF NOT EXISTS idx_profiles_sso_id ON public.profiles(sso_id)
WHERE sso_id IS NOT NULL;

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.sso_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sso_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES - SSO CONFIGS
-- ============================================

-- Team admins/owners can view SSO config
CREATE POLICY "Team admins can view SSO config"
ON public.sso_configs FOR SELECT
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
  )
);

-- Team owners can create SSO config
CREATE POLICY "Team owners can create SSO config"
ON public.sso_configs FOR INSERT
WITH CHECK (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role = 'owner'
  )
);

-- Team owners can update SSO config
CREATE POLICY "Team owners can update SSO config"
ON public.sso_configs FOR UPDATE
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role = 'owner'
  )
);

-- Team owners can delete SSO config
CREATE POLICY "Team owners can delete SSO config"
ON public.sso_configs FOR DELETE
USING (
  team_id IN (
    SELECT tm.team_id FROM public.team_members tm
    WHERE tm.user_id = auth.uid() AND tm.role = 'owner'
  )
);

-- ============================================
-- 6. RLS POLICIES - SSO SESSIONS
-- ============================================

-- Users can view their own SSO sessions
CREATE POLICY "Users can view their SSO sessions"
ON public.sso_sessions FOR SELECT
USING (user_id = auth.uid());

-- Service can insert SSO sessions
CREATE POLICY "Service can insert SSO sessions"
ON public.sso_sessions FOR INSERT
WITH CHECK (true);

-- Users can delete their own SSO sessions
CREATE POLICY "Users can delete their SSO sessions"
ON public.sso_sessions FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to get SSO config by team slug or email domain
CREATE OR REPLACE FUNCTION get_sso_config_by_identifier(p_identifier TEXT)
RETURNS TABLE (
  id UUID,
  team_id UUID,
  provider TEXT,
  entity_id TEXT,
  sso_url TEXT,
  require_sso BOOLEAN
) AS $$
BEGIN
  -- First try to match by team slug
  RETURN QUERY
  SELECT
    sc.id,
    sc.team_id,
    sc.provider,
    sc.entity_id,
    sc.sso_url,
    sc.require_sso
  FROM public.sso_configs sc
  JOIN public.teams t ON t.id = sc.team_id
  WHERE t.slug = p_identifier
  LIMIT 1;

  -- If no match, could extend to match by email domain in future
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired SSO sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sso_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.sso_sessions
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. VERIFICATION
-- ============================================
DO $$
BEGIN
  -- Verify tables exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('sso_configs', 'sso_sessions')
  ) THEN
    RAISE NOTICE 'SSO tables created successfully';
  END IF;

  -- Verify profile columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'sso_id'
  ) THEN
    RAISE NOTICE 'Profile SSO columns added successfully';
  END IF;

  -- Verify team columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'teams'
    AND column_name = 'enterprise_tier'
  ) THEN
    RAISE NOTICE 'Team enterprise columns added successfully';
  END IF;
END $$;

-- Add SCIM token for directory sync
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS scim_token TEXT;
ALTER TABLE sso_configs ADD COLUMN IF NOT EXISTS scim_enabled BOOLEAN DEFAULT false;

-- Index for SCIM token lookup
CREATE INDEX IF NOT EXISTS idx_sso_configs_scim_token ON sso_configs(scim_token) WHERE scim_token IS NOT NULL;
