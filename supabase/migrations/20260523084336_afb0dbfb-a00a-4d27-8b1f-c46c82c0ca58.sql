-- 1) Harden online_games: extend the protection trigger so direct UPDATEs from
--    players cannot mutate game state. RPCs (commit_online_move, finalize_online_game,
--    abort_online_game) set request.masterchess_internal=true and remain unaffected.
CREATE OR REPLACE FUNCTION public.protect_online_game_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.role() = 'service_role' OR current_setting('request.masterchess_internal', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Existing protected columns
  NEW.result          := OLD.result;
  NEW.status          := OLD.status;
  NEW.elo_applied     := OLD.elo_applied;
  NEW.end_reason      := OLD.end_reason;
  NEW.is_rated        := OLD.is_rated;
  NEW.white_player_id := OLD.white_player_id;
  NEW.black_player_id := OLD.black_player_id;

  -- New: game state columns that must only be written by the server-side
  -- commit_online_move RPC, never by a direct client UPDATE.
  NEW.fen             := OLD.fen;
  NEW.pgn             := OLD.pgn;
  NEW.turn            := OLD.turn;
  NEW.move_number     := OLD.move_number;
  NEW.last_move_from  := OLD.last_move_from;
  NEW.last_move_to    := OLD.last_move_to;
  NEW.last_move_at    := OLD.last_move_at;
  NEW.white_time      := OLD.white_time;
  NEW.black_time      := OLD.black_time;
  NEW.time_control_label := OLD.time_control_label;
  NEW.increment       := OLD.increment;
  NEW.hand_brain_meta := OLD.hand_brain_meta;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_online_game_columns ON public.online_games;
CREATE TRIGGER protect_online_game_columns
BEFORE UPDATE ON public.online_games
FOR EACH ROW
EXECUTE FUNCTION public.protect_online_game_columns();

-- 2) Matchmaking queue: force `rating` to match the user's profile rating
--    on insert, regardless of what the client sent.
CREATE OR REPLACE FUNCTION public.matchmaking_queue_force_profile_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rating integer;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  SELECT rating INTO v_rating FROM public.profiles WHERE user_id = NEW.user_id;
  IF v_rating IS NULL THEN
    RAISE EXCEPTION 'No profile rating found for user';
  END IF;
  NEW.rating := v_rating;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS matchmaking_queue_force_rating ON public.matchmaking_queue;
CREATE TRIGGER matchmaking_queue_force_rating
BEFORE INSERT OR UPDATE ON public.matchmaking_queue
FOR EACH ROW
EXECUTE FUNCTION public.matchmaking_queue_force_profile_rating();

-- 3) Stockfish eval cache: restrict INSERT to authenticated users only.
DROP POLICY IF EXISTS "Anyone can insert eval cache" ON public.stockfish_eval_cache;
DROP POLICY IF EXISTS "Public can insert eval cache" ON public.stockfish_eval_cache;
DROP POLICY IF EXISTS "stockfish_eval_cache_insert" ON public.stockfish_eval_cache;
DROP POLICY IF EXISTS "Authenticated users can insert eval cache" ON public.stockfish_eval_cache;
CREATE POLICY "Authenticated users can insert eval cache"
ON public.stockfish_eval_cache
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4) Tournament anti-cheat flags: only the service role (server-side detectors)
--    may insert. Regular authenticated users can no longer self-report flags.
DROP POLICY IF EXISTS "Users can insert their own anti-cheat flags" ON public.tournament_anti_cheat_flags;
DROP POLICY IF EXISTS "Users can insert anti-cheat flags" ON public.tournament_anti_cheat_flags;
DROP POLICY IF EXISTS "Anyone can insert anti-cheat flags" ON public.tournament_anti_cheat_flags;
DROP POLICY IF EXISTS "tournament_anti_cheat_flags_insert" ON public.tournament_anti_cheat_flags;