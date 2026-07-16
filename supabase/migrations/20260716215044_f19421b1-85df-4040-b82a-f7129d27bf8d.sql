
CREATE EXTENSION IF NOT EXISTS unaccent;

ALTER TABLE public.clubs
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS partner_type TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS history TEXT;

CREATE OR REPLACE FUNCTION public.slugify(txt TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(public.unaccent(coalesce(txt,''))),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

UPDATE public.clubs
SET slug = CASE
  WHEN public.slugify(name) = '' THEN 'club-' || substr(id::text, 1, 8)
  ELSE public.slugify(name) || '-' || substr(id::text, 1, 6)
END
WHERE slug IS NULL;

ALTER TABLE public.clubs ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clubs_slug_unique ON public.clubs (lower(slug));
CREATE INDEX IF NOT EXISTS clubs_verified_idx ON public.clubs (verified) WHERE verified = true;

CREATE TABLE IF NOT EXISTS public.partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('club','coach','school','federation','organizer')),
  organization_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  city TEXT,
  country TEXT,
  member_count INTEGER,
  website_url TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  decided_at TIMESTAMPTZ,
  club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.partner_applications TO authenticated;
GRANT INSERT ON public.partner_applications TO anon;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
  ON public.partner_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own applications"
  ON public.partner_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update applications"
  ON public.partner_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.club_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'meetup',
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS club_events_club_starts_idx ON public.club_events (club_id, starts_at DESC);
GRANT SELECT ON public.club_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.club_events TO authenticated;
GRANT ALL ON public.club_events TO service_role;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read club events" ON public.club_events FOR SELECT USING (true);
CREATE POLICY "Club owners/admins manage events" ON public.club_events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.club_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS club_news_club_pub_idx ON public.club_news (club_id, published_at DESC);
GRANT SELECT ON public.club_news TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.club_news TO authenticated;
GRANT ALL ON public.club_news TO service_role;
ALTER TABLE public.club_news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read club news" ON public.club_news FOR SELECT USING (true);
CREATE POLICY "Club owners/admins manage news" ON public.club_news FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.club_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS club_gallery_club_idx ON public.club_gallery (club_id, created_at DESC);
GRANT SELECT ON public.club_gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.club_gallery TO authenticated;
GRANT ALL ON public.club_gallery TO service_role;
ALTER TABLE public.club_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view gallery" ON public.club_gallery FOR SELECT USING (true);
CREATE POLICY "Club owners/admins manage gallery" ON public.club_gallery FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clubs c WHERE c.id = club_id AND c.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_partner_apps_updated ON public.partner_applications;
CREATE TRIGGER trg_partner_apps_updated BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_club_events_updated ON public.club_events;
CREATE TRIGGER trg_club_events_updated BEFORE UPDATE ON public.club_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_club_news_updated ON public.club_news;
CREATE TRIGGER trg_club_news_updated BEFORE UPDATE ON public.club_news FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
