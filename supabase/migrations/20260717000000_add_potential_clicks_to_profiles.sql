-- Add potential clicks tracking columns to public.profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS potential_clicks_today INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_potential_click_date DATE DEFAULT NULL;
