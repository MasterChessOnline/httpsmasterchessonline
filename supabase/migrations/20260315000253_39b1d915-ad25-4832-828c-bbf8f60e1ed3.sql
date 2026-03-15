CREATE TABLE public.story_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  chapter_key text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  stars integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_key)
);

ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own story progress"
ON public.story_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own story progress"
ON public.story_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own story progress"
ON public.story_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);