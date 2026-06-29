
-- ---------- Tournament Standings View ----------
CREATE OR REPLACE VIEW public.tournament_standings_v AS
WITH player_scores AS (
  SELECT
    tr.tournament_id,
    tr.user_id,
    tr.id AS registration_id,
    COALESCE(NULLIF(TRIM(CONCAT(tr.first_name,' ',tr.last_name)),''), 'Player') AS display_name,
    COALESCE(tr.federation, '')  AS country,
    tr.fide_id,
    tr.rating_at_join            AS rating_at_start,
    COALESCE(SUM(
      CASE
        WHEN tp.white_player_id = tr.id AND tp.result = '1-0' THEN 1
        WHEN tp.black_player_id = tr.id AND tp.result = '0-1' THEN 1
        WHEN tp.result = '1/2-1/2' AND (tp.white_player_id = tr.id OR tp.black_player_id = tr.id) THEN 0.5
        WHEN tp.white_player_id = tr.id AND tp.result = '1-0F' THEN 1
        WHEN tp.black_player_id = tr.id AND tp.result = '0-1F' THEN 1
        WHEN tp.white_player_id = tr.id AND tp.result = 'BYE' THEN 1
        ELSE 0
      END
    ), 0)::numeric AS points,
    COUNT(*) FILTER (
      WHERE (tp.white_player_id = tr.id AND tp.result = '1-0')
         OR (tp.black_player_id = tr.id AND tp.result = '0-1')
    ) AS wins,
    COUNT(*) FILTER (
      WHERE tp.result IS NOT NULL
        AND tp.result <> 'BYE'
        AND (tp.white_player_id = tr.id OR tp.black_player_id = tr.id)
    ) AS games_played
  FROM public.tournament_registrations tr
  LEFT JOIN public.tournament_pairings tp
    ON tp.tournament_id = tr.tournament_id
   AND (tp.white_player_id = tr.id OR tp.black_player_id = tr.id)
  GROUP BY tr.tournament_id, tr.user_id, tr.id, tr.first_name, tr.last_name, tr.federation, tr.fide_id, tr.rating_at_join
)
SELECT
  ps.*,
  RANK() OVER (PARTITION BY ps.tournament_id ORDER BY ps.points DESC, ps.wins DESC) AS rank
FROM player_scores ps;

GRANT SELECT ON public.tournament_standings_v TO anon, authenticated, service_role;

-- ---------- Tiebreak helper ----------
CREATE OR REPLACE FUNCTION public.tournament_tiebreaks(p_tournament_id uuid)
RETURNS TABLE (
  registration_id uuid,
  buchholz numeric,
  buchholz_cut1 numeric,
  sonneborn_berger numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT registration_id, points
    FROM public.tournament_standings_v
    WHERE tournament_id = p_tournament_id
  ),
  opp AS (
    SELECT
      r.id AS registration_id,
      CASE WHEN tp.white_player_id = r.id THEN tp.black_player_id ELSE tp.white_player_id END AS opponent_id,
      CASE
        WHEN tp.white_player_id = r.id AND tp.result = '1-0' THEN 1::numeric
        WHEN tp.black_player_id = r.id AND tp.result = '0-1' THEN 1::numeric
        WHEN tp.result = '1/2-1/2' AND (tp.white_player_id = r.id OR tp.black_player_id = r.id) THEN 0.5
        ELSE 0
      END AS my_score
    FROM public.tournament_registrations r
    JOIN public.tournament_pairings tp
      ON tp.tournament_id = r.tournament_id
     AND (tp.white_player_id = r.id OR tp.black_player_id = r.id)
    WHERE r.tournament_id = p_tournament_id
      AND tp.result IS NOT NULL
      AND tp.result <> 'BYE'
  ),
  joined AS (
    SELECT o.registration_id, o.my_score, COALESCE(b.points,0) AS opp_points
    FROM opp o LEFT JOIN base b ON b.registration_id = o.opponent_id
  )
  SELECT
    registration_id,
    COALESCE(SUM(opp_points), 0)                                AS buchholz,
    COALESCE(SUM(opp_points) - MIN(opp_points), 0)              AS buchholz_cut1,
    COALESCE(SUM(opp_points * my_score), 0)                     AS sonneborn_berger
  FROM joined
  GROUP BY registration_id;
$$;

GRANT EXECUTE ON FUNCTION public.tournament_tiebreaks(uuid) TO anon, authenticated, service_role;

-- ---------- Predictions Market ----------
CREATE TABLE IF NOT EXISTS public.tournament_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  predicted_champion_registration_id uuid NOT NULL REFERENCES public.tournament_registrations(id) ON DELETE CASCADE,
  coins_staked integer NOT NULL CHECK (coins_staked > 0),
  payout integer DEFAULT 0,
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);
GRANT SELECT, INSERT, UPDATE ON public.tournament_predictions TO authenticated;
GRANT SELECT ON public.tournament_predictions TO anon;
GRANT ALL    ON public.tournament_predictions TO service_role;
ALTER TABLE public.tournament_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Predictions are world-readable" ON public.tournament_predictions FOR SELECT USING (true);
CREATE POLICY "Users insert their own prediction" ON public.tournament_predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their own unresolved prediction" ON public.tournament_predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id AND resolved = false) WITH CHECK (auth.uid() = user_id);

-- ---------- Hall of Fame ----------
CREATE TABLE IF NOT EXISTS public.tournament_hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  edition_year integer NOT NULL,
  category text NOT NULL,
  registration_id uuid REFERENCES public.tournament_registrations(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  country text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_hof_tournament ON public.tournament_hall_of_fame(tournament_id);
CREATE INDEX IF NOT EXISTS idx_hof_year_cat   ON public.tournament_hall_of_fame(edition_year, category);
GRANT SELECT ON public.tournament_hall_of_fame TO anon, authenticated;
GRANT ALL    ON public.tournament_hall_of_fame TO service_role;
ALTER TABLE public.tournament_hall_of_fame ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hall of fame is public" ON public.tournament_hall_of_fame FOR SELECT USING (true);
CREATE POLICY "Service role manages hall of fame" ON public.tournament_hall_of_fame FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------- Readiness check-ins ----------
CREATE TABLE IF NOT EXISTS public.tournament_round_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number integer NOT NULL,
  registration_id uuid NOT NULL REFERENCES public.tournament_registrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  ready boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, round_number, registration_id)
);
GRANT SELECT, INSERT, UPDATE ON public.tournament_round_readiness TO authenticated;
GRANT ALL ON public.tournament_round_readiness TO service_role;
ALTER TABLE public.tournament_round_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Readiness public read" ON public.tournament_round_readiness FOR SELECT USING (true);
CREATE POLICY "Players mark themselves ready" ON public.tournament_round_readiness FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Players update their own readiness" ON public.tournament_round_readiness FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ---------- Prize categories ----------
ALTER TABLE public.tournament_prizes
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'overall';

-- ---------- Ambassador leaderboard view ----------
CREATE OR REPLACE VIEW public.tournament_ambassador_v AS
SELECT
  ti.tournament_id,
  ti.created_by AS inviter_user_id,
  COALESCE(SUM(ti.uses), 0)::integer AS confirmed_invites,
  COUNT(*)::integer                  AS invite_links_created
FROM public.tournament_invites ti
GROUP BY ti.tournament_id, ti.created_by;

GRANT SELECT ON public.tournament_ambassador_v TO anon, authenticated, service_role;
