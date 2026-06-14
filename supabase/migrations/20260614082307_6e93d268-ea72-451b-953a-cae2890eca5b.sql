
-- ============================================================
-- DAILY KING — 24h champion (most rating gained yesterday)
-- ============================================================
CREATE TABLE public.daily_kings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reign_date date NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  rating_gain integer NOT NULL,
  games_played integer NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.daily_kings TO anon;
GRANT SELECT ON public.daily_kings TO authenticated;
GRANT ALL ON public.daily_kings TO service_role;

ALTER TABLE public.daily_kings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily kings"
  ON public.daily_kings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_daily_kings_reign_date ON public.daily_kings (reign_date DESC);

-- Compute (or recompute) the daily king for a given date (default = yesterday).
-- Looks at rating_history rows created on that calendar day in UTC, picks the
-- user with max net gain who played at least 3 games. Idempotent.
CREATE OR REPLACE FUNCTION public.compute_daily_king(p_date date DEFAULT (now() AT TIME ZONE 'UTC')::date - 1)
RETURNS public.daily_kings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  winner_row record;
  result_row public.daily_kings;
BEGIN
  SELECT user_id,
         SUM(rating_change)::int AS gain,
         COUNT(*)::int AS games
    INTO winner_row
    FROM public.rating_history
   WHERE created_at >= p_date::timestamptz
     AND created_at <  (p_date + 1)::timestamptz
   GROUP BY user_id
  HAVING COUNT(*) >= 3
   ORDER BY SUM(rating_change) DESC, COUNT(*) DESC
   LIMIT 1;

  IF winner_row IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.daily_kings (reign_date, user_id, rating_gain, games_played)
  VALUES (p_date, winner_row.user_id, winner_row.gain, winner_row.games)
  ON CONFLICT (reign_date) DO UPDATE
    SET user_id     = EXCLUDED.user_id,
        rating_gain = EXCLUDED.rating_gain,
        games_played= EXCLUDED.games_played,
        computed_at = now()
  RETURNING * INTO result_row;

  RETURN result_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_daily_king(date) TO service_role;

-- Current king = most recent reign_date (yesterday's winner reigns "today").
CREATE OR REPLACE FUNCTION public.get_current_daily_king()
RETURNS TABLE (
  reign_date date,
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  rating_gain integer,
  games_played integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dk.reign_date,
         dk.user_id,
         p.username,
         p.display_name,
         p.avatar_url,
         dk.rating_gain,
         dk.games_played
    FROM public.daily_kings dk
    LEFT JOIN public.profiles p ON p.user_id = dk.user_id
   ORDER BY dk.reign_date DESC
   LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_daily_king() TO anon, authenticated, service_role;

-- ============================================================
-- STYLE TWIN — "you play like Tal" AI result, cached per user
-- ============================================================
CREATE TABLE public.style_twins (
  user_id uuid PRIMARY KEY,
  gm_name text NOT NULL,
  match_pct integer NOT NULL CHECK (match_pct BETWEEN 0 AND 100),
  reasoning text NOT NULL,
  games_analyzed integer NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.style_twins TO authenticated;
GRANT ALL ON public.style_twins TO service_role;

ALTER TABLE public.style_twins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own style twin"
  ON public.style_twins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public readable summary (for share cards) — username + GM only, no reasoning
CREATE OR REPLACE FUNCTION public.get_public_style_twin(p_username text)
RETURNS TABLE (
  username text,
  display_name text,
  avatar_url text,
  gm_name text,
  match_pct integer,
  computed_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.username,
         p.display_name,
         p.avatar_url,
         st.gm_name,
         st.match_pct,
         st.computed_at
    FROM public.profiles p
    JOIN public.style_twins st ON st.user_id = p.user_id
   WHERE p.username = p_username
   LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_style_twin(text) TO anon, authenticated, service_role;
