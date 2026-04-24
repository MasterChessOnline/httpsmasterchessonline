DROP VIEW IF EXISTS public.tournament_played_pairs;

CREATE VIEW public.tournament_played_pairs
WITH (security_invoker = true)
AS
SELECT
  tournament_id,
  LEAST(white_player_id, black_player_id) AS player_a,
  GREATEST(white_player_id, black_player_id) AS player_b,
  array_agg(round ORDER BY round) AS rounds
FROM public.tournament_pairings
WHERE black_player_id IS NOT NULL
GROUP BY tournament_id, LEAST(white_player_id, black_player_id), GREATEST(white_player_id, black_player_id);