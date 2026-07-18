CREATE OR REPLACE FUNCTION public.get_public_tournament_standings(p_tournament_id uuid DEFAULT NULL)
RETURNS TABLE (
  registration_id uuid,
  tournament_id uuid,
  rank bigint,
  score numeric,
  buchholz numeric,
  buchholz_cut1 numeric,
  progressive_score numeric,
  performance_rating integer,
  wins integer,
  first_name text,
  last_name text,
  federation text,
  fide_title text,
  rating_at_join integer,
  fide_verified boolean,
  fide_blitz_rating integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH target_tournament AS (
    SELECT t.id
    FROM public.tournaments t
    WHERE p_tournament_id IS NOT NULL AND t.id = p_tournament_id
    UNION ALL
    SELECT t.id
    FROM public.tournaments t
    WHERE p_tournament_id IS NULL
      AND (t.name ILIKE '%Dragan Brakus%' OR t.name ILIKE '%DB Chess Cup%')
    ORDER BY id DESC
    LIMIT 1
  ), ranked AS (
    SELECT
      tr.id AS registration_id,
      tr.tournament_id,
      rank() OVER (
        ORDER BY tr.score DESC,
                 tr.buchholz_cut1 DESC,
                 tr.buchholz DESC,
                 tr.progressive_score DESC,
                 coalesce(tr.fide_blitz_rating, tr.rating_at_join, 0) DESC,
                 tr.created_at ASC
      ) AS rank,
      tr.score,
      tr.buchholz,
      tr.buchholz_cut1,
      tr.progressive_score,
      tr.performance_rating,
      tr.wins,
      nullif(btrim(tr.first_name), '') AS first_name,
      nullif(btrim(tr.last_name), '') AS last_name,
      nullif(upper(btrim(tr.federation)), '') AS federation,
      nullif(upper(btrim(tr.fide_title)), '') AS fide_title,
      tr.rating_at_join,
      tr.fide_verified,
      tr.fide_blitz_rating,
      tr.created_at
    FROM public.tournament_registrations tr
    JOIN target_tournament tt ON tt.id = tr.tournament_id
    WHERE coalesce(tr.is_test_bot, false) = false
  )
  SELECT
    r.registration_id,
    r.tournament_id,
    r.rank,
    r.score,
    r.buchholz,
    r.buchholz_cut1,
    r.progressive_score,
    r.performance_rating,
    r.wins,
    r.first_name,
    r.last_name,
    r.federation,
    r.fide_title,
    r.rating_at_join,
    r.fide_verified,
    r.fide_blitz_rating
  FROM ranked r
  ORDER BY r.rank ASC, r.created_at ASC;
$$;

REVOKE ALL ON FUNCTION public.get_public_tournament_standings(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_tournament_standings(uuid) TO anon, authenticated, service_role;