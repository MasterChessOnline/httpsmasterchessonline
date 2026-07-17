
-- 1) Extend profiles trigger to block client writes on entitlement columns
CREATE OR REPLACE FUNCTION public.profiles_block_client_stat_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_internal boolean := false;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  BEGIN
    is_internal := current_setting('request.masterchess_internal', true) = 'true';
  EXCEPTION WHEN OTHERS THEN
    is_internal := false;
  END;

  IF is_internal THEN
    RETURN NEW;
  END IF;

  IF NEW.bot_rating       IS DISTINCT FROM OLD.bot_rating
  OR NEW.bot_peak_rating  IS DISTINCT FROM OLD.bot_peak_rating
  OR NEW.bot_games_played IS DISTINCT FROM OLD.bot_games_played
  OR NEW.bot_games_won    IS DISTINCT FROM OLD.bot_games_won
  OR NEW.bot_games_lost   IS DISTINCT FROM OLD.bot_games_lost
  OR NEW.bot_games_drawn  IS DISTINCT FROM OLD.bot_games_drawn
  OR NEW.rating           IS DISTINCT FROM OLD.rating
  OR NEW.peak_rating      IS DISTINCT FROM OLD.peak_rating
  OR NEW.games_played     IS DISTINCT FROM OLD.games_played
  OR NEW.games_won        IS DISTINCT FROM OLD.games_won
  OR NEW.games_lost       IS DISTINCT FROM OLD.games_lost
  OR NEW.games_drawn      IS DISTINCT FROM OLD.games_drawn
  OR NEW.master_coins     IS DISTINCT FROM OLD.master_coins
  OR NEW.total_xp         IS DISTINCT FROM OLD.total_xp
  THEN
    RAISE EXCEPTION 'rating, stat, coin, and XP fields cannot be modified directly';
  END IF;

  -- Premium entitlement fields (paid access): only service role / internal may change these
  IF NEW.access_tier       IS DISTINCT FROM OLD.access_tier
  OR NEW.coach_pro_until   IS DISTINCT FROM OLD.coach_pro_until
  OR NEW.unlocked_courses  IS DISTINCT FROM OLD.unlocked_courses
  THEN
    RAISE EXCEPTION 'premium entitlement fields cannot be modified directly';
  END IF;

  RETURN NEW;
END;
$function$;

-- 2) Hide sensitive PII on tournament_registrations from unauthenticated visitors
--    (Row-level access unchanged; column-level SELECT revoked for anon.)
REVOKE SELECT (first_name, last_name, birth_year, city, fide_id, fide_profile_url, fide_verified_name)
  ON public.tournament_registrations FROM anon;

-- 3) Fix mutable search_path on internal helper functions
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $function$
  SELECT trim(both '-' from regexp_replace(
    lower(public.unaccent(coalesce(txt,''))),
    '[^a-z0-9]+', '-', 'g'
  ));
$function$;
