-- Track emails of deleted users to prevent re-registration
CREATE TABLE IF NOT EXISTS public.deleted_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deleted_emails ENABLE ROW LEVEL SECURITY;

-- Users can check their own deleted status during login
CREATE POLICY "Users can check their own deleted status"
ON public.deleted_emails FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = email);

-- Add is_banned column to profiles for ban/unban tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
