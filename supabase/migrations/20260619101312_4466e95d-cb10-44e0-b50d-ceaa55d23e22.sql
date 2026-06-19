
CREATE TABLE public.variation_explanations (
  cache_key text PRIMARY KEY,
  course_id text NOT NULL,
  variation_id text NOT NULL,
  summary text,
  moves jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.variation_explanations TO anon, authenticated;
GRANT ALL    ON public.variation_explanations TO service_role;

ALTER TABLE public.variation_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached explanations"
  ON public.variation_explanations FOR SELECT
  USING (true);

CREATE INDEX variation_explanations_course_idx
  ON public.variation_explanations (course_id, variation_id);
