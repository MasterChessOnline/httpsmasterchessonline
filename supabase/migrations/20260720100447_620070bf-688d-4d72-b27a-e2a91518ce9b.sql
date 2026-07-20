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
      coalesce(tr.fide_blitz_rating, tr.rating_at_join, 1200) AS rating_at_join,
      tr.fide_verified,
      tr.fide_blitz_rating,
      tr.created_at
    FROM public.tournament_registrations tr
    JOIN target_tournament tt ON tt.id = tr.tournament_id
    WHERE coalesce(tr.is_test_bot, false) = false
      AND tr.withdrew_at IS NULL
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

CREATE OR REPLACE FUNCTION public.tg_db_cup_registration_normalize()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.fide_id IS NOT NULL THEN
    NEW.fide_id := NULLIF(regexp_replace(NEW.fide_id, '\D', '', 'g'), '');
    IF NEW.fide_id IS NOT NULL AND (length(NEW.fide_id) < 4 OR length(NEW.fide_id) > 10) THEN
      RAISE EXCEPTION 'FIDE ID must be numbers only — 4 to 10 digits.';
    END IF;
  END IF;

  IF NEW.fide_blitz_rating IS NOT NULL AND NEW.fide_blitz_rating > 0 THEN
    NEW.rating_at_join := NEW.fide_blitz_rating;
  END IF;

  IF NEW.federation IS NOT NULL THEN
    NEW.federation := NULLIF(upper(left(btrim(NEW.federation), 3)), '');
  END IF;

  IF NEW.fide_title IS NOT NULL THEN
    NEW.fide_title := NULLIF(upper(left(btrim(NEW.fide_title), 3)), '');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_db_cup_registration_normalize ON public.tournament_registrations;
CREATE TRIGGER trg_db_cup_registration_normalize
  BEFORE INSERT OR UPDATE ON public.tournament_registrations
  FOR EACH ROW EXECUTE FUNCTION public.tg_db_cup_registration_normalize();

CREATE UNIQUE INDEX IF NOT EXISTS tournament_registrations_unique_fide_not_empty
  ON public.tournament_registrations (tournament_id, fide_id)
  WHERE fide_id IS NOT NULL AND fide_id <> '';

UPDATE public.tournament_registrations
SET rating_at_join = fide_blitz_rating
WHERE fide_blitz_rating IS NOT NULL
  AND fide_blitz_rating > 0
  AND rating_at_join IS DISTINCT FROM fide_blitz_rating;