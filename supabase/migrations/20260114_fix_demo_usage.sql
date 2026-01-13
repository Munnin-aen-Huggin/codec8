-- Migration: Fix demo_usage table schema
-- Issue: Missing last_repo_url column causing PGRST204 error
-- Run this in Supabase SQL Editor

-- First, check if tables exist and create them if not

-- Create demo_usage table if not exists
CREATE TABLE IF NOT EXISTS public.demo_usage (
  ip_hash TEXT NOT NULL,
  date DATE NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_repo_url TEXT,
  user_agent TEXT,
  fingerprint TEXT,
  is_suspicious BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ip_hash, date)
);

-- Create blocked_clients table if not exists
CREATE TABLE IF NOT EXISTS public.blocked_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  fingerprint TEXT,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Add missing columns to demo_usage if they don't exist
DO $$
BEGIN
  -- Add last_repo_url column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'last_repo_url'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN last_repo_url TEXT;
  END IF;

  -- Add user_agent column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN user_agent TEXT;
  END IF;

  -- Add fingerprint column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'fingerprint'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN fingerprint TEXT;
  END IF;

  -- Add is_suspicious column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'is_suspicious'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN is_suspicious BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add last_used_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'demo_usage'
    AND column_name = 'last_used_at'
  ) THEN
    ALTER TABLE public.demo_usage ADD COLUMN last_used_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_demo_usage_date ON public.demo_usage(date);
CREATE INDEX IF NOT EXISTS idx_blocked_clients_ip ON public.blocked_clients(ip_hash);
CREATE INDEX IF NOT EXISTS idx_blocked_clients_fp ON public.blocked_clients(fingerprint) WHERE fingerprint IS NOT NULL;

-- Enable RLS
ALTER TABLE public.demo_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies - only service role can access these tables
CREATE POLICY IF NOT EXISTS "Service role only - demo_usage" ON public.demo_usage
  FOR ALL TO service_role USING (true);

CREATE POLICY IF NOT EXISTS "Service role only - blocked_clients" ON public.blocked_clients
  FOR ALL TO service_role USING (true);

-- Grant permissions to service role
GRANT ALL ON public.demo_usage TO service_role;
GRANT ALL ON public.blocked_clients TO service_role;

COMMENT ON TABLE public.demo_usage IS 'Tracks demo endpoint usage per IP per day';
COMMENT ON TABLE public.blocked_clients IS 'Stores blocked IPs and fingerprints';
