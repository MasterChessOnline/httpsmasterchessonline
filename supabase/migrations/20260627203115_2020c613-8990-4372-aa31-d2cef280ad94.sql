
-- ===== tournaments =====
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS checkin_opens_at timestamptz,
  ADD COLUMN IF NOT EXISTS checkin_closes_at timestamptz,
  ADD COLUMN IF NOT EXISTS roster_locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_humanitarian boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS organizer_label text;

-- ===== tournament_registrations =====
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS fide_id text,
  ADD COLUMN IF NOT EXISTS fide_title text,
  ADD COLUMN IF NOT EXISTS fide_blitz_rating int,
  ADD COLUMN IF NOT EXISTS federation text,
  ADD COLUMN IF NOT EXISTS birth_year int,
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS club text,
  ADD COLUMN IF NOT EXISTS buchholz_cut1 numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progressive_score numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS performance_rating int;

-- ===== profiles =====
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS fide_id text,
  ADD COLUMN IF NOT EXISTS fide_title text,
  ADD COLUMN IF NOT EXISTS federation text,
  ADD COLUMN IF NOT EXISTS birth_year int,
  ADD COLUMN IF NOT EXISTS club text;

-- ===== extended tiebreaks =====
CREATE OR REPLACE FUNCTION public.recalc_tournament_tiebreaks(_tid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  WITH games AS (
    SELECT
      p.round,
      p.white_player_id AS player,
      p.black_player_id AS opponent,
      CASE WHEN p.result='1-0' THEN 1.0 WHEN p.result='0-1' THEN 0.0 WHEN p.result='1/2-1/2' THEN 0.5 ELSE NULL END AS score_pts
    FROM public.tournament_pairings p
    WHERE p.tournament_id=_tid AND p.black_player_id IS NOT NULL AND p.result IS NOT NULL
    UNION ALL
    SELECT
      p.round,
      p.black_player_id AS player,
      p.white_player_id AS opponent,
      CASE WHEN p.result='0-1' THEN 1.0 WHEN p.result='1-0' THEN 0.0 WHEN p.result='1/2-1/2' THEN 0.5 ELSE NULL END
    FROM public.tournament_pairings p
    WHERE p.tournament_id=_tid AND p.black_player_id IS NOT NULL AND p.result IS NOT NULL
  ),
  byes AS (
    SELECT p.round, p.white_player_id AS player, 1.0::numeric AS score_pts
    FROM public.tournament_pairings p
    WHERE p.tournament_id=_tid AND p.black_player_id IS NULL AND p.result IS NOT NULL
  ),
  scores AS (
    SELECT user_id, score::numeric AS s, rating_at_join FROM public.tournament_registrations WHERE tournament_id=_tid
  ),
  opp_scores AS (
    SELECT g.player, g.opponent, COALESCE(s.s,0) AS opp_score, g.score_pts
    FROM games g LEFT JOIN scores s ON s.user_id=g.opponent
  ),
  agg AS (
    SELECT
      player AS user_id,
      COALESCE(SUM(opp_score),0) AS buchholz,
      COALESCE(SUM(opp_score) - MIN(opp_score),0) AS buchholz_cut1,
      COALESCE(SUM(opp_score * score_pts),0) AS sonneborn,
      COALESCE(SUM(CASE WHEN score_pts=1.0 THEN 1 ELSE 0 END),0) AS wins
    FROM opp_scores
    GROUP BY player
  ),
  -- progressive: sum of running score per round (incl. byes)
  all_results AS (
    SELECT player, round, score_pts FROM opp_scores
    UNION ALL
    SELECT player, round, score_pts FROM byes
  ),
  running AS (
    SELECT player, round,
      SUM(score_pts) OVER (PARTITION BY player ORDER BY round ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_score
    FROM all_results
  ),
  prog AS (
    SELECT player AS user_id, COALESCE(SUM(running_score),0) AS progressive_score
    FROM running GROUP BY player
  ),
  -- performance rating: avg opponent rating + dp from percentage
  perf_raw AS (
    SELECT g.player AS user_id,
           AVG(s.rating_at_join)::numeric AS avg_opp,
           AVG(g.score_pts)::numeric AS pct,
           COUNT(*) AS n
    FROM games g LEFT JOIN scores s ON s.user_id=g.opponent
    WHERE s.rating_at_join IS NOT NULL
    GROUP BY g.player
  ),
  perf AS (
    SELECT user_id,
      CASE
        WHEN n=0 OR pct IS NULL THEN NULL
        WHEN pct >= 0.99 THEN (avg_opp + 800)::int
        WHEN pct <= 0.01 THEN (avg_opp - 800)::int
        ELSE (avg_opp + (-400.0 * ln((1.0 - pct)/pct)))::int
      END AS performance_rating
    FROM perf_raw
  )
  UPDATE public.tournament_registrations r
  SET
    buchholz = COALESCE(a.buchholz, 0),
    buchholz_cut1 = COALESCE(a.buchholz_cut1, 0),
    sonneborn = COALESCE(a.sonneborn, 0),
    wins = COALESCE(a.wins, 0),
    progressive_score = COALESCE(pr.progressive_score, 0),
    performance_rating = pf.performance_rating
  FROM public.tournament_registrations r2
  LEFT JOIN agg a ON a.user_id = r2.user_id
  LEFT JOIN prog pr ON pr.user_id = r2.user_id
  LEFT JOIN perf pf ON pf.user_id = r2.user_id
  WHERE r.id = r2.id AND r2.tournament_id = _tid AND r.tournament_id = _tid;
END;
$function$;

-- ===== seed: Dragan Brakus Humanitarian Blitz, June 30 2026, Europe/Belgrade =====
INSERT INTO public.tournaments (
  name, description, category, format, tournament_type,
  total_rounds, max_players,
  time_control_label, time_control_seconds, time_control_increment,
  status, starts_at,
  checkin_opens_at, checkin_closes_at,
  is_humanitarian, organizer_label,
  is_signature, signature_series,
  start_time_locked
)
SELECT
  'Dragan Brakus Humanitarian Blitz',
  'Online 9-round Swiss blitz (3+2) on June 30, 2026 — dedicated to Dragan Brakus. Official standings published on Chess-Results Serbia after the event.',
  'blitz', 'swiss', 'swiss',
  9, 256,
  '3+2', 180, 2,
  'registering',
  '2026-06-30 15:00:00+00'::timestamptz,           -- 17:00 Europe/Belgrade (UTC+2)
  '2026-06-30 14:45:00+00'::timestamptz,
  '2026-06-30 14:55:00+00'::timestamptz,
  true, 'MasterChess × Chess-Results Serbia',
  true, 'humanitarian',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.tournaments WHERE name='Dragan Brakus Humanitarian Blitz'
);
