-- Grant free trial to all existing non-admin users who haven't started one yet
UPDATE public.profiles
SET trial_started_at = NOW(), plan = 'free'
WHERE trial_started_at IS NULL
  AND (is_admin IS NULL OR is_admin IS NOT TRUE);
