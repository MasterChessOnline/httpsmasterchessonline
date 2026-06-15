
-- 1. Revoke any direct table access on email tables from app roles.
REVOKE ALL ON public.suppressed_emails FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.email_unsubscribe_tokens FROM PUBLIC, anon, authenticated;

-- 2. Prevent client-side tampering with rating/stat columns on profiles.
-- Server-side SECURITY DEFINER functions set the masterchess_internal flag
-- before mutating these columns; everything else (display name, avatar,
-- settings, etc.) continues to work normally for the owner.
CREATE OR REPLACE FUNCTION public.profiles_block_client_stat_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_internal boolean := false;
BEGIN
  -- service_role bypasses
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_client_stat_writes ON public.profiles;
CREATE TRIGGER profiles_block_client_stat_writes
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_block_client_stat_writes();
