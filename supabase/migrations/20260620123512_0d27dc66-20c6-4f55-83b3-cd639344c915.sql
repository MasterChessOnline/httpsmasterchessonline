
-- Discord linking columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS discord_user_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS discord_username TEXT,
  ADD COLUMN IF NOT EXISTS discord_avatar TEXT,
  ADD COLUMN IF NOT EXISTS discord_linked_at TIMESTAMPTZ;

-- Map opt-in
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_on_map BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS map_lat NUMERIC,
  ADD COLUMN IF NOT EXISTS map_lng NUMERIC,
  ADD COLUMN IF NOT EXISTS city TEXT;

-- Clubs map
ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS lat NUMERIC,
  ADD COLUMN IF NOT EXISTS lng NUMERIC,
  ADD COLUMN IF NOT EXISTS city TEXT;

-- SEO query opportunities table (admin-only)
CREATE TABLE IF NOT EXISTS public.seo_query_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC NOT NULL DEFAULT 0,
  avg_position NUMERIC,
  suggested_page TEXT,
  picked_up_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acted_on BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (query, picked_up_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_query_opportunities TO authenticated;
GRANT ALL ON public.seo_query_opportunities TO service_role;
ALTER TABLE public.seo_query_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage seo opportunities" ON public.seo_query_opportunities
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Public read view for the global community map (only opted-in users with coords)
CREATE OR REPLACE VIEW public.community_map_pins AS
SELECT id, username, avatar_url, rating, country, city, map_lat AS lat, map_lng AS lng
FROM public.profiles
WHERE show_on_map = TRUE AND map_lat IS NOT NULL AND map_lng IS NOT NULL;
GRANT SELECT ON public.community_map_pins TO anon, authenticated;
