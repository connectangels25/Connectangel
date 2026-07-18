-- Backfill pro_started_at for existing pro users who don't have it set
UPDATE public.profiles
SET pro_started_at = NOW()
WHERE plan = 'pro' AND pro_started_at IS NULL;
