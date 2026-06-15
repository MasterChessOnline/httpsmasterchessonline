CREATE TABLE IF NOT EXISTS public.confessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 280),
  is_public boolean NOT NULL DEFAULT false,
  show_handle boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS confessions_public_created_idx
  ON public.confessions (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS confessions_user_idx
  ON public.confessions (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.confessions TO authenticated;
GRANT SELECT ON public.confessions TO anon;
GRANT ALL ON public.confessions TO service_role;

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public confessions are visible to all"
  ON public.confessions FOR SELECT
  USING (is_public = true);

CREATE POLICY "Owners read own confessions"
  ON public.confessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owners insert own confessions"
  ON public.confessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners update own confessions"
  ON public.confessions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners delete own confessions"
  ON public.confessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.public_confessions(p_limit int DEFAULT 30)
RETURNS TABLE (
  id uuid,
  body text,
  handle text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.body,
    CASE WHEN c.show_handle THEN COALESCE(p.display_name, 'Anonymous') ELSE 'Anonymous' END,
    c.created_at
  FROM public.confessions c
  LEFT JOIN public.profiles p ON p.user_id = c.user_id
  WHERE c.is_public = true
  ORDER BY c.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 100));
$$;

GRANT EXECUTE ON FUNCTION public.public_confessions(int) TO anon, authenticated;