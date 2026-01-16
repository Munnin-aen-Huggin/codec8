-- ============================================
-- ADD SESSIONS TABLE FOR SERVER-SIDE VALIDATION
-- Critical security fix: sessions must be stored and validated server-side
-- ============================================

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,

  -- Ensure unique tokens
  CONSTRAINT sessions_token_hash_unique UNIQUE (token_hash)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON public.sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.sessions(expires_at);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can manage sessions (server-side only)
CREATE POLICY "service_role_all_sessions" ON public.sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can only view their own sessions (for session management UI)
CREATE POLICY "Users can view own sessions" ON public.sessions
  FOR SELECT
  USING (user_id = auth.uid());

-- Function to cleanup expired sessions (run via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.sessions
    WHERE expires_at < NOW()
    RETURNING 1
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

-- Function to validate a session token (returns user_id if valid)
CREATE OR REPLACE FUNCTION public.validate_session(p_token_hash TEXT)
RETURNS TABLE (
  user_id UUID,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.user_id,
    (s.expires_at > NOW()) AS is_valid
  FROM public.sessions s
  WHERE s.token_hash = p_token_hash
  LIMIT 1;
END;
$$;

-- Function to invalidate all sessions for a user (for security)
CREATE OR REPLACE FUNCTION public.invalidate_all_user_sessions(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.sessions
    WHERE user_id = p_user_id
    RETURNING 1
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;

-- Verification
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sessions' AND schemaname = 'public') THEN
    RAISE NOTICE 'SUCCESS: Sessions table created for server-side validation';
  ELSE
    RAISE EXCEPTION 'FAILED: Sessions table not created';
  END IF;
END $$;
