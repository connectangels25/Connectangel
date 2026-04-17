
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organizer_name TEXT NOT NULL,
  organizer_logo_url TEXT,
  category TEXT NOT NULL DEFAULT 'Conference',
  tags TEXT[] DEFAULT '{}',
  short_summary TEXT,
  event_link TEXT,
  banner_url TEXT,
  start_date TEXT,
  start_time TEXT,
  end_date TEXT,
  end_time TEXT,
  event_mode TEXT NOT NULL DEFAULT 'In-Person',
  location_type TEXT,
  venue_address TEXT,
  venue_name TEXT,
  room_floor TEXT,
  arrival_instructions TEXT,
  deadline_date TEXT,
  deadline_time TEXT,
  show_timezone BOOLEAN DEFAULT true,
  tickets JSONB DEFAULT '[]',
  total_capacity TEXT,
  max_team_size TEXT,
  support_email TEXT,
  support_phone TEXT,
  agree_terms BOOLEAN DEFAULT false,
  full_description TEXT,
  agenda JSONB DEFAULT '[]',
  speakers JSONB DEFAULT '[]',
  faqs JSONB DEFAULT '[]',
  prizes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events (drafts + published)
CREATE POLICY "Users can view own events"
ON public.events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Everyone can view published events
CREATE POLICY "Anyone can view published events"
ON public.events FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Users can create events
CREATE POLICY "Users can create events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own events
CREATE POLICY "Users can update own events"
ON public.events FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete own events
CREATE POLICY "Users can delete own events"
ON public.events FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);

-- Anyone can view event images
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own images
CREATE POLICY "Users can update own event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own images
CREATE POLICY "Users can delete own event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);
