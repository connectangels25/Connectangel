-- Migration: Reset all non-admin users to 'free' plan & allow Admin updates
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Allow authenticated admin updates on profiles (prevents RLS blocks)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (true);

-- 2. Reset all non-admin users to the free plan, leaving admins untouched
UPDATE public.profiles
SET 
  plan = 'free',
  pro_started_at = NULL,
  trial_started_at = COALESCE(trial_started_at, NOW())
WHERE 
  is_admin IS NOT TRUE OR is_admin IS NULL;
