-- Add tiebreak columns to tournament_registrations
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS buchholz numeric(6,1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sonneborn numeric(6,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wins integer NOT NULL DEFAULT 0;

-- Recompute standings tiebreaks for one tournament.
-- Buchholz = sum of all opponents' final scores
-- Sonneborn-Berger = sum of (opponent_score * own_result_against_them)
-- Wins = count of full-point wins (excludes byes, excludes draws)
-- Direct encounter is implicit at sort time (head-to-head between tied players)
CREATE OR REPLACE FUNCTION public.recalc_tournament_tiebreaks(_tid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Build per-player game record (excluding byes), then aggregate.
  WITH games AS (
    SELECT
      p.white_player_id AS player,
      p.black_player_id AS opponent,
      CASE
        WHEN p.result = '1-0' THEN 1.0
        WHEN p.result = '0-1' THEN 0.0
        WHEN p.result = '1/2-1/2' THEN 0.5
        ELSE NULL
      END AS score_pts,
      false AS is_bye
    FROM public.tournament_pairings p
    WHERE p.tournament_id = _tid
      AND p.black_player_id IS NOT NULL
      AND p.result IS NOT NULL
    UNION ALL
    SELECT
      p.black_player_id AS player,
      p.white_player_id AS opponent,
      CASE
        WHEN p.result = '0-1' THEN 1.0
        WHEN p.result = '1-0' THEN 0.0
        WHEN p.result = '1/2-1/2' THEN 0.5
        ELSE NULL
      END AS score_pts,
      false AS is_bye
    FROM public.tournament_pairings p
    WHERE p.tournament_id = _tid
      AND p.black_player_id IS NOT NULL
      AND p.result IS NOT NULL
  ),
  -- Snapshot of each registration's current score (used as opponent's score in BH/SB)
  scores AS (
    SELECT user_id, score::numeric AS s
    FROM public.tournament_registrations
    WHERE tournament_id = _tid
  ),
  per_player AS (
    SELECT
      g.player AS user_id,
      COALESCE(SUM(s.s), 0) AS buchholz,
      COALESCE(SUM(s.s * g.score_pts), 0) AS sonneborn,
      COALESCE(SUM(CASE WHEN g.score_pts = 1.0 THEN 1 ELSE 0 END), 0) AS wins
    FROM games g
    LEFT JOIN scores s ON s.user_id = g.opponent
    WHERE g.score_pts IS NOT NULL
    GROUP BY g.player
  )
  UPDATE public.tournament_registrations r
  SET
    buchholz  = COALESCE(pp.buchholz, 0),
    sonneborn = COALESCE(pp.sonneborn, 0),
    wins      = COALESCE(pp.wins, 0)
  FROM (
    SELECT r2.user_id,
           COALESCE(pp.buchholz, 0)  AS buchholz,
           COALESCE(pp.sonneborn, 0) AS sonneborn,
           COALESCE(pp.wins, 0)      AS wins
    FROM public.tournament_registrations r2
    LEFT JOIN per_player pp ON pp.user_id = r2.user_id
    WHERE r2.tournament_id = _tid
  ) pp
  WHERE r.tournament_id = _tid AND r.user_id = pp.user_id;
END;
$$;

-- Backfill tiebreaks for any existing tournaments
DO $$
DECLARE t_id uuid;
BEGIN
  FOR t_id IN SELECT id FROM public.tournaments LOOP
    PERFORM public.recalc_tournament_tiebreaks(t_id);
  END LOOP;
END $$;