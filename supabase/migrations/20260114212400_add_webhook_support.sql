-- Add webhook support to repositories table for auto-sync feature
-- Phase 10: Auto-sync on git push

-- ============================================
-- 1. ADD WEBHOOK COLUMNS TO REPOSITORIES
-- ============================================

-- GitHub webhook ID (returned when creating webhook)
ALTER TABLE public.repositories
ADD COLUMN IF NOT EXISTS webhook_id TEXT;

-- Secret for HMAC signature verification
ALTER TABLE public.repositories
ADD COLUMN IF NOT EXISTS webhook_secret TEXT;

-- Whether auto-sync is enabled for this repo
ALTER TABLE public.repositories
ADD COLUMN IF NOT EXISTS auto_sync_enabled BOOLEAN DEFAULT false;

-- Last time docs were auto-synced
ALTER TABLE public.repositories
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- ============================================
-- 2. CREATE INDEX FOR WEBHOOK LOOKUPS
-- ============================================

-- Index on full_name for fast webhook processing
-- (webhooks identify repo by full_name like "owner/repo")
CREATE INDEX IF NOT EXISTS idx_repositories_full_name
ON public.repositories(full_name);

-- Index on webhook_id for cleanup operations
CREATE INDEX IF NOT EXISTS idx_repositories_webhook_id
ON public.repositories(webhook_id)
WHERE webhook_id IS NOT NULL;

-- ============================================
-- 3. VERIFY MIGRATION
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'repositories'
    AND column_name = 'webhook_secret'
  ) THEN
    RAISE NOTICE 'Webhook columns added successfully';
  END IF;
END $$;
