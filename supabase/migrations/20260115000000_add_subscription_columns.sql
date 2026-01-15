-- Add missing subscription columns to profiles table
-- These columns are required for the Stripe webhook to update subscription status

-- Stripe customer and subscription IDs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Subscription status and tier
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT;

-- Trial tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Usage tracking for subscription tiers
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS repos_used_this_month INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS repos_reset_at TIMESTAMPTZ;

-- Billing period tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

-- Cancellation tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Add missing license_key column to purchased_repos table
ALTER TABLE public.purchased_repos ADD COLUMN IF NOT EXISTS license_key TEXT;
