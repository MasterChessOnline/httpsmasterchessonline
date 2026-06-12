
-- Extend site_ratings for full Reviews system
ALTER TABLE public.site_ratings
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS helpful_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS love_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS report_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS site_ratings_visible_idx ON public.site_ratings(hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS site_ratings_rating_idx ON public.site_ratings(rating);

-- Reactions table
CREATE TABLE IF NOT EXISTS public.site_review_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.site_ratings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('like','love','helpful','report')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (review_id, user_id, reaction)
);

GRANT SELECT ON public.site_review_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.site_review_reactions TO authenticated;
GRANT ALL ON public.site_review_reactions TO service_role;

ALTER TABLE public.site_review_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reactions viewable by everyone"
  ON public.site_review_reactions FOR SELECT USING (true);
CREATE POLICY "Users add their own reactions"
  ON public.site_review_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove their own reactions"
  ON public.site_review_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to keep counters fresh
CREATE OR REPLACE FUNCTION public.update_review_reaction_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid uuid;
  delta int;
  r text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    rid := NEW.review_id; r := NEW.reaction; delta := 1;
  ELSE
    rid := OLD.review_id; r := OLD.reaction; delta := -1;
  END IF;

  IF r = 'like' THEN
    UPDATE public.site_ratings SET like_count = GREATEST(0, like_count + delta) WHERE id = rid;
  ELSIF r = 'love' THEN
    UPDATE public.site_ratings SET love_count = GREATEST(0, love_count + delta) WHERE id = rid;
  ELSIF r = 'helpful' THEN
    UPDATE public.site_ratings SET helpful_count = GREATEST(0, helpful_count + delta) WHERE id = rid;
  ELSIF r = 'report' THEN
    UPDATE public.site_ratings SET report_count = GREATEST(0, report_count + delta) WHERE id = rid;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_review_reactions_count ON public.site_review_reactions;
CREATE TRIGGER trg_review_reactions_count
AFTER INSERT OR DELETE ON public.site_review_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_review_reaction_counts();
