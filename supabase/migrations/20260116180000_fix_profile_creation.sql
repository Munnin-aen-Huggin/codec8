-- ============================================
-- FIX PROFILE CREATION
-- Add unique constraint and fix RPC function
-- ============================================

-- Add unique constraint on github_username if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_github_username_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_github_username_key UNIQUE (github_username);
    RAISE NOTICE 'Added unique constraint on github_username';
  END IF;
END $$;

-- Add unique constraint on email if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
    RAISE NOTICE 'Added unique constraint on email';
  END IF;
END $$;

-- Drop and recreate the profile creation function with better error handling
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT);

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
  -- First check if user already exists by github_username
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE github_username = p_github_username;

  IF v_user_id IS NOT NULL THEN
    -- Update existing user's token
    UPDATE public.profiles
    SET github_token = p_github_token,
        email = COALESCE(p_email, email)
    WHERE id = v_user_id;
    RETURN v_user_id;
  END IF;

  -- Check by email
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE email = p_email;

  IF v_user_id IS NOT NULL THEN
    -- Update existing user's token and github_username
    UPDATE public.profiles
    SET github_token = p_github_token,
        github_username = p_github_username
    WHERE id = v_user_id;
    RETURN v_user_id;
  END IF;

  -- Create new user
  INSERT INTO public.profiles (id, email, github_username, github_token, plan, created_at)
  VALUES (p_id, p_email, p_github_username, p_github_token, p_plan, NOW())
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
EXCEPTION
  WHEN unique_violation THEN
    -- Race condition: user was created between our check and insert
    -- Try to find and return the existing user
    SELECT id INTO v_user_id
    FROM public.profiles
    WHERE github_username = p_github_username OR email = p_email
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
      -- Update their token
      UPDATE public.profiles
      SET github_token = p_github_token
      WHERE id = v_user_id;
      RETURN v_user_id;
    END IF;

    -- If still not found, re-raise
    RAISE;
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in create_user_profile: %', SQLERRM;
    RAISE;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated, anon, service_role;

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Profile creation function updated';
END $$;
