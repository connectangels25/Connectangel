-- Add pro_started_at column to profiles for tracking pro plan start date
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_started_at TIMESTAMP WITH TIME ZONE;
