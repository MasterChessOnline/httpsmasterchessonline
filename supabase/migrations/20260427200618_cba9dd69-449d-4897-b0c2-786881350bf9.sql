CREATE TABLE IF NOT EXISTS public.custom_lessons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  title           text NOT NULL,
  opening_name    text NOT NULL,
  opening_eco     text,
  source_game_id  uuid,
  pgn             text,
  summary         text NOT NULL,
  key_ideas       jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_moves jsonb NOT NULL DEFAULT '[]'::jsonb,
  practice_lines  jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom lessons"
  ON public.custom_lessons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom lessons"
  ON public.custom_lessons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom lessons"
  ON public.custom_lessons FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS custom_lessons_user_idx
  ON public.custom_lessons (user_id, created_at DESC);