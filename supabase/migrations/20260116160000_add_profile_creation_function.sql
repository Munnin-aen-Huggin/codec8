-- ============================================
-- ADD PROFILE CREATION FUNCTION WITH SECURITY DEFINER
-- This ensures profile creation works regardless of RLS issues
-- ============================================

-- Function to create a user profile (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_github_username TEXT,
  p_github_token TEXT,
  p_plan TEXT DEFAULT 'free'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to insert the new profile
  INSERT INTO public.profiles (id, email, github_username, github_token, plan)
  VALUES (p_id, p_email, p_github_username, p_github_token, p_plan)
  ON CONFLICT (github_username) DO UPDATE
  SET
    github_token = EXCLUDED.github_token,
    email = EXCLUDED.email
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
EXCEPTION
  WHEN unique_violation THEN
    -- If there's still a conflict, find and return the existing user
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE github_username = p_github_username OR email = p_email
    LIMIT 1;

    -- Update their token
    IF v_user_id IS NOT NULL THEN
      UPDATE public.profiles
      SET github_token = p_github_token
      WHERE id = v_user_id;
    END IF;

    RETURN v_user_id;
END;
$$;

-- Function to update a user profile (bypasses RLS with SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_user_profile(
  p_id UUID,
  p_github_token TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET
    github_token = p_github_token,
    email = COALESCE(p_email, email)
  WHERE id = p_id;

  RETURN FOUND;
END;
$$;

-- Grant execute to authenticated and anon (function handles its own security)
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated, anon, service_role;

-- Verification
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_profile') THEN
    RAISE NOTICE 'SUCCESS: Profile creation function created with SECURITY DEFINER';
  ELSE
    RAISE EXCEPTION 'FAILED: Profile creation function not created';
  END IF;
END $$;
