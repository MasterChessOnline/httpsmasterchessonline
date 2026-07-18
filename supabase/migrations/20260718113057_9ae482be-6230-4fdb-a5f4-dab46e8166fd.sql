
-- 1. Cannibalization detector
CREATE TABLE public.seo_cannibalization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggested_canonical text,
  impressions integer NOT NULL DEFAULT 0,
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE (query, detected_at)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_cannibalization TO authenticated;
GRANT ALL ON public.seo_cannibalization TO service_role;
ALTER TABLE public.seo_cannibalization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage cannibalization"
  ON public.seo_cannibalization FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. City chess hubs (Google Maps cache + landing page metadata)
CREATE TABLE public.city_chess_hubs (
  city_slug text PRIMARY KEY,
  city_name text NOT NULL,
  country text NOT NULL,
  region text,
  lat double precision,
  lng double precision,
  places_cached jsonb NOT NULL DEFAULT '[]'::jsonb,
  place_count integer NOT NULL DEFAULT 0,
  page_generated boolean NOT NULL DEFAULT false,
  last_refreshed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX city_chess_hubs_country_idx ON public.city_chess_hubs (country, city_slug);
GRANT SELECT ON public.city_chess_hubs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.city_chess_hubs TO authenticated;
GRANT ALL ON public.city_chess_hubs TO service_role;
ALTER TABLE public.city_chess_hubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads city hubs"
  ON public.city_chess_hubs FOR SELECT
  USING (true);
CREATE POLICY "Admins manage city hubs"
  ON public.city_chess_hubs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER city_chess_hubs_updated_at
BEFORE UPDATE ON public.city_chess_hubs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Social post log
CREATE TABLE public.social_post_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('linkedin','tiktok','reddit','x','discord')),
  post_id text,
  content text NOT NULL,
  url text,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','queued')),
  error text,
  engagement jsonb NOT NULL DEFAULT '{}'::jsonb,
  posted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX social_post_log_platform_idx ON public.social_post_log (platform, posted_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_post_log TO authenticated;
GRANT ALL ON public.social_post_log TO service_role;
ALTER TABLE public.social_post_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read social log"
  ON public.social_post_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Pending social posts (queue when connector scope missing)
CREATE TABLE public.pending_social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  payload jsonb NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX pending_social_posts_pending_idx ON public.pending_social_posts (platform, sent_at) WHERE sent_at IS NULL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pending_social_posts TO authenticated;
GRANT ALL ON public.pending_social_posts TO service_role;
ALTER TABLE public.pending_social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage pending posts"
  ON public.pending_social_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
