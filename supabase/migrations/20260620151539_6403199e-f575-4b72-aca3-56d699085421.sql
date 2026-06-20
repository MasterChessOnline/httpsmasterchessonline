CREATE TABLE public.site_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_config TO anon, authenticated;
GRANT ALL ON public.site_config TO service_role;

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_config readable by everyone"
  ON public.site_config FOR SELECT
  USING (true);

CREATE POLICY "site_config writable by service role only"
  ON public.site_config FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);