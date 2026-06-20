
-- Phase 2 — Rewards + Status System

-- 1. tournament_titles
CREATE TABLE IF NOT EXISTS public.tournament_titles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_key text NOT NULL,
  title_label text NOT NULL,
  season text,
  tournament_id uuid,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tournament_titles_user ON public.tournament_titles(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_titles_key ON public.tournament_titles(title_key);

GRANT SELECT ON public.tournament_titles TO anon, authenticated;
GRANT ALL ON public.tournament_titles TO service_role;
ALTER TABLE public.tournament_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Titles are public" ON public.tournament_titles FOR SELECT USING (true);
CREATE POLICY "Service role manages titles" ON public.tournament_titles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. unique_badges (1-of-1 flex)
CREATE TABLE IF NOT EXISTS public.unique_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key text NOT NULL UNIQUE,
  badge_label text NOT NULL,
  description text,
  current_owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  awarded_at timestamptz,
  asset_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.unique_badges TO anon, authenticated;
GRANT ALL ON public.unique_badges TO service_role;
ALTER TABLE public.unique_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Unique badges public read" ON public.unique_badges FOR SELECT USING (true);
CREATE POLICY "Admin manage unique badges" ON public.unique_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Service role unique badges" ON public.unique_badges FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. feature_votes
CREATE TABLE IF NOT EXISTS public.feature_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  weight int NOT NULL DEFAULT 1,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_votes TO authenticated;
GRANT ALL ON public.feature_votes TO service_role;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes public read" ON public.feature_votes FOR SELECT USING (true);
CREATE POLICY "Beta+ users vote" ON public.feature_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own vote" ON public.feature_votes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own vote" ON public.feature_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. profile extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username_style text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS coach_pro_until timestamptz,
  ADD COLUMN IF NOT EXISTS unlocked_courses jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS access_tier text NOT NULL DEFAULT 'standard';

-- 5. RPC: award title (called by edge fn)
CREATE OR REPLACE FUNCTION public.award_tournament_title(
  _user_id uuid,
  _title_key text,
  _title_label text,
  _season text DEFAULT NULL,
  _tournament_id uuid DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.tournament_titles(user_id, title_key, title_label, season, tournament_id, metadata)
  VALUES (_user_id, _title_key, _title_label, _season, _tournament_id, COALESCE(_metadata,'{}'::jsonb))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- 6. RPC: transfer unique badge (only by admin / service role)
CREATE OR REPLACE FUNCTION public.transfer_unique_badge(_badge_key text, _new_owner uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.unique_badges
    SET current_owner_id = _new_owner, awarded_at = now(), updated_at = now()
    WHERE badge_key = _badge_key;
END;
$$;

-- 7. seed legendary unique badges
INSERT INTO public.unique_badges (badge_key, badge_label, description)
VALUES
  ('one_of_one_champion','1-of-1 Champion','The only Champion badge in existence. Held by whoever last won the season finals.'),
  ('first_blood','First Blood','First-ever tournament winner on MasterChess.'),
  ('king_of_kings','King of Kings','Longest KOTH throne defense.')
ON CONFLICT (badge_key) DO NOTHING;
