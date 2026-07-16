
CREATE TABLE public.seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL,
  lang text NOT NULL DEFAULT 'en',
  title text NOT NULL,
  meta_description text NOT NULL,
  h1 text NOT NULL,
  body_md text NOT NULL,
  jsonld jsonb,
  faq jsonb,
  related_slugs text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  quality_score integer DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  indexed_at timestamptz,
  status text NOT NULL DEFAULT 'published',
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.seo_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_pages TO authenticated;
GRANT ALL ON public.seo_pages TO service_role;

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published seo pages"
  ON public.seo_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage seo pages"
  ON public.seo_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX seo_pages_kind_idx ON public.seo_pages (kind, lang, generated_at DESC);
CREATE INDEX seo_pages_status_idx ON public.seo_pages (status, generated_at DESC);

CREATE TRIGGER seo_pages_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
