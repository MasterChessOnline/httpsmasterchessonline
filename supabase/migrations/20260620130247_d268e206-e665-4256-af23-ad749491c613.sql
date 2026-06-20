CREATE TABLE public.gbp_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  cta_label text,
  cta_url text,
  image_url text,
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  error text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gbp_posts TO authenticated;
GRANT ALL ON public.gbp_posts TO service_role;
ALTER TABLE public.gbp_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage gbp_posts" ON public.gbp_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER gbp_posts_updated_at BEFORE UPDATE ON public.gbp_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX gbp_posts_scheduled_idx ON public.gbp_posts(scheduled_for) WHERE status = 'scheduled';