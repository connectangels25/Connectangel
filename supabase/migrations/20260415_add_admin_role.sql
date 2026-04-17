-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set admin flag for the two admin accounts (by email)
UPDATE public.profiles SET is_admin = true WHERE email = 'shadmannc0516@gmail.com';
UPDATE public.profiles SET is_admin = true WHERE email = 'shaziyafkhan0516@gmail.com';
