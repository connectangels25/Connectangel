-- Update the public select policy for events to include 'approved' status
-- This allows guest (non-logged-in) users to see events on the homepage

DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;

CREATE POLICY "Anyone can view approved and published events"
ON public.events FOR SELECT
TO anon, authenticated
USING (status = 'published' OR status = 'approved');
