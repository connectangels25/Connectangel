-- We are dropping the restrictive policy that only allows a user to see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a new policy that allows all authenticated users to view all profiles.
-- (Note: If you plan to have regular users on this platform, you may want to restrict this further 
-- to a specific 'admin' role column in the future).
CREATE POLICY "Enable read access for all authenticated users to profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Also allow viewing all events by default for the admin dashboard
DROP POLICY IF EXISTS "Users can view own events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;

CREATE POLICY "Enable read access for all authenticated users to events"
ON public.events FOR SELECT
TO authenticated
USING (true);
