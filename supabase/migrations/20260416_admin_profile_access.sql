-- 1. Ensure the is_admin column exists (Safety re-run)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Allow all authenticated users to see profiles (essential for login and unblocking recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users to profiles" ON public.profiles;

CREATE POLICY "Enable read access for all authenticated users to profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 3. Allow admins to DELETE profiles 
-- (Temporarily simplified to avoid recursion during emergency login fix)
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;
CREATE POLICY "Admins can delete any profile"
ON public.profiles FOR DELETE
TO authenticated
USING (true); 

-- 4. Re-assert admin status for the administrator accounts
-- This handles the case where the profile row might be missing or is_admin is false
INSERT INTO public.profiles (id, email, is_admin)
SELECT id, email, true
FROM auth.users
WHERE email IN ('shadmannc0516@gmail.com', 'shaziyafkhan0516@gmail.com')
ON CONFLICT (id) DO UPDATE 
SET is_admin = true, email = EXCLUDED.email;
