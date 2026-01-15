-- Add-on columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS addon_unlimited_regen BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS addon_unlimited_regen_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS addon_extra_repos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS addon_extra_repos_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stale_alert_threshold_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS stale_alerts_enabled BOOLEAN DEFAULT true;

-- Add-on columns to teams table
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS addon_extra_seats INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS addon_extra_seats_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS addon_extra_repos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS addon_extra_repos_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS addon_audit_logs BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS addon_audit_logs_expires TIMESTAMPTZ;

-- Add-on purchases tracking table
CREATE TABLE IF NOT EXISTS public.addon_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  addon_type TEXT NOT NULL CHECK (addon_type IN ('unlimited_regen', 'extra_repos', 'extra_seats', 'audit_logs')),
  quantity INTEGER DEFAULT 1,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Index for addon purchases
CREATE INDEX IF NOT EXISTS idx_addon_purchases_user_id ON public.addon_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_team_id ON public.addon_purchases(team_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_status ON public.addon_purchases(status);

-- Doc staleness alerts table
CREATE TABLE IF NOT EXISTS public.doc_staleness_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('stale', 'code_changed', 'never_generated')),
  days_stale INTEGER,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for staleness alerts
CREATE INDEX IF NOT EXISTS idx_staleness_alerts_user_id ON public.doc_staleness_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_staleness_alerts_repo_id ON public.doc_staleness_alerts(repo_id);
CREATE INDEX IF NOT EXISTS idx_staleness_alerts_dismissed ON public.doc_staleness_alerts(dismissed);

-- Doc quality scores table
CREATE TABLE IF NOT EXISTS public.doc_quality_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES public.documentation(id) ON DELETE CASCADE,
  repo_id UUID REFERENCES public.repositories(id) ON DELETE CASCADE,
  completeness_score DECIMAL(3,2) CHECK (completeness_score >= 0 AND completeness_score <= 1),
  accuracy_score DECIMAL(3,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  clarity_score DECIMAL(3,2) CHECK (clarity_score >= 0 AND clarity_score <= 1),
  overall_score DECIMAL(3,2) CHECK (overall_score >= 0 AND overall_score <= 1),
  suggestions JSONB DEFAULT '[]',
  scored_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quality scores
CREATE INDEX IF NOT EXISTS idx_quality_scores_doc_id ON public.doc_quality_scores(doc_id);
CREATE INDEX IF NOT EXISTS idx_quality_scores_repo_id ON public.doc_quality_scores(repo_id);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_team_id ON public.audit_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS policies for addon_purchases
ALTER TABLE public.addon_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addon purchases"
  ON public.addon_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage addon purchases"
  ON public.addon_purchases FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for staleness alerts
ALTER TABLE public.doc_staleness_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own staleness alerts"
  ON public.doc_staleness_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own staleness alerts"
  ON public.doc_staleness_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage staleness alerts"
  ON public.doc_staleness_alerts FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for quality scores
ALTER TABLE public.doc_quality_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view quality scores for their repos"
  ON public.doc_quality_scores FOR SELECT
  USING (
    repo_id IN (
      SELECT id FROM public.repositories WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage quality scores"
  ON public.doc_quality_scores FOR ALL
  USING (auth.role() = 'service_role');

-- RLS policies for audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service role can manage audit logs"
  ON public.audit_logs FOR ALL
  USING (auth.role() = 'service_role');
