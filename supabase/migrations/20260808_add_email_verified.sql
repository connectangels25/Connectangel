-- Add email_verified column for hybrid email verification flow
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- Existing users are grandfathered as verified
UPDATE public.profiles SET email_verified = true;

-- Update signup trigger: Google users (already verified by Google) start verified,
-- email/password users start unverified and must click the verification link.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email') = 'google'
  );
  RETURN NEW;
END;
$$;
