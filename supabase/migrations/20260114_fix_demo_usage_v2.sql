-- Migration: Fix demo_usage table schema (v2)
-- Run this in Supabase SQL Editor to fix the existing schema

-- Step 1: Add last_repo_url column if it doesn't exist (copy from repo_url if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'last_repo_url'
  ) THEN
    -- Add the column
    ALTER TABLE public.demo_usage ADD COLUMN last_repo_url TEXT;

    -- Copy data from repo_url if that column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'demo_usage'
      AND column_name = 'repo_url'
    ) THEN
      UPDATE public.demo_usage SET last_repo_url = repo_url;
    END IF;
  END IF;
END $$;

-- Step 2: Add unique constraint on (ip_hash, date) for upsert to work
-- First, deduplicate existing data by keeping only the most recent entry per ip_hash per date
DELETE FROM public.demo_usage a USING public.demo_usage b
WHERE a.id < b.id
  AND a.ip_hash = b.ip_hash
  AND a.date = b.date;

-- Now add the unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'demo_usage_ip_date_unique'
  ) THEN
    ALTER TABLE public.demo_usage
    ADD CONSTRAINT demo_usage_ip_date_unique UNIQUE (ip_hash, date);
  END IF;
END $$;

-- Step 3: Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN user_agent TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'fingerprint'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN fingerprint TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'is_suspicious'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN is_suspicious BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN last_used_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Step 4: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_demo_usage_date ON public.demo_usage(date);
CREATE INDEX IF NOT EXISTS idx_demo_usage_ip_hash ON public.demo_usage(ip_hash);

-- Step 5: Enable RLS and set policies
ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Service role only - demo_usage" ON public.demo_usage;

-- Create service role policy
CREATE POLICY "Service role only - demo_usage" ON public.demo_usage
  FOR ALL TO service_role USING (true);

-- Grant permissions
GRANT ALL ON public.demo_usage TO service_role;

-- Step 6: Verify the schema is correct
DO $$
DECLARE
  constraint_exists BOOLEAN;
  column_exists BOOLEAN;
BEGIN
  -- Check unique constraint exists
  SELECT EXISTS(
    SELECT 1 FROM pg_constraint WHERE conname = 'demo_usage_ip_date_unique'
  ) INTO constraint_exists;

  -- Check last_repo_url column exists
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'last_repo_url'
  ) INTO column_exists;

  IF NOT constraint_exists THEN
    RAISE NOTICE 'WARNING: demo_usage_ip_date_unique constraint was not created';
  ELSE
    RAISE NOTICE 'SUCCESS: demo_usage_ip_date_unique constraint exists';
  END IF;

  IF NOT column_exists THEN
    RAISE NOTICE 'WARNING: last_repo_url column was not created';
  ELSE
    RAISE NOTICE 'SUCCESS: last_repo_url column exists';
  END IF;
END $$;
