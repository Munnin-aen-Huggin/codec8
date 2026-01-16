-- ============================================
-- ADD SESSION CREATION FUNCTION WITH SECURITY DEFINER
-- This ensures session creation works regardless of RLS issues
-- ============================================

-- Function to create a session (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id UUID,
  p_token_hash TEXT,
  p_expires_at TIMESTAMPTZ,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO public.sessions (user_id, token_hash, expires_at, ip_address, user_agent)
  VALUES (p_user_id, p_token_hash, p_expires_at, p_ip_address, p_user_agent)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Function to validate and get session (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_session_by_token(p_token_hash TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  token_hash TEXT,
  expires_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.user_id, s.token_hash, s.expires_at, s.last_active_at
  FROM public.sessions s
  WHERE s.token_hash = p_token_hash
  LIMIT 1;
END;
$$;

-- Function to update session last_active_at
CREATE OR REPLACE FUNCTION public.touch_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.sessions
  SET last_active_at = NOW()
  WHERE id = p_session_id;
  RETURN FOUND;
END;
$$;

-- Function to delete a session by token hash
CREATE OR REPLACE FUNCTION public.delete_session(p_token_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.sessions
  WHERE token_hash = p_token_hash;
  RETURN FOUND;
END;
$$;

-- Function to delete expired session
CREATE OR REPLACE FUNCTION public.delete_expired_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.sessions
  WHERE id = p_session_id;
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_user_session TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_session_by_token TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.touch_session TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.delete_session TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.delete_expired_session TO authenticated, anon, service_role;

-- Verification
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_session') THEN
    RAISE NOTICE 'SUCCESS: Session functions created with SECURITY DEFINER';
  ELSE
    RAISE EXCEPTION 'FAILED: Session functions not created';
  END IF;
END $$;
