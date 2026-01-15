-- Add onboarded column to profiles table
-- This tracks whether a user has completed the onboarding wizard
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;
