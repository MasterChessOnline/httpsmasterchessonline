
-- 1. Column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_game_id uuid NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_current_game_id
  ON public.profiles(current_game_id)
  WHERE current_game_id IS NOT NULL;

-- 2. Helper: clear current_game_id for both players of a game
CREATE OR REPLACE FUNCTION public._clear_current_game(p_game_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
     SET current_game_id = NULL
   WHERE current_game_id = p_game_id;
$$;

-- 3. cleanup_stale_game: clears link if game finished or abandoned long ago
CREATE OR REPLACE FUNCTION public.cleanup_stale_game(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gid uuid;
  g record;
BEGIN
  SELECT current_game_id INTO v_gid FROM public.profiles WHERE user_id = p_user_id;
  IF v_gid IS NULL THEN RETURN NULL; END IF;

  SELECT * INTO g FROM public.online_games WHERE id = v_gid;
  IF NOT FOUND
     OR g.status <> 'active'
     OR (g.updated_at IS NOT NULL AND g.updated_at < now() - interval '2 hours' AND COALESCE(g.move_number,0) = 0)
  THEN
    UPDATE public.profiles SET current_game_id = NULL WHERE user_id = p_user_id;
    RETURN NULL;
  END IF;

  RETURN v_gid;
END;
$$;

-- 4. assert_can_queue: returns active game id if blocked, else NULL
CREATE OR REPLACE FUNCTION public.assert_can_queue()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  v_gid uuid;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  v_gid := public.cleanup_stale_game(caller);
  -- always purge stray queue rows for this user
  DELETE FROM public.matchmaking_queue WHERE user_id = caller;
  IF v_gid IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_in_game', 'game_id', v_gid);
  END IF;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 5. start_online_game: atomic creation with single-game guard
CREATE OR REPLACE FUNCTION public.start_online_game(
  p_white_id uuid,
  p_black_id uuid,
  p_white_time integer,
  p_black_time integer,
  p_time_control_label text,
  p_increment integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  w_gid uuid;
  b_gid uuid;
  new_game public.online_games%ROWTYPE;
BEGIN
  IF caller IS NULL OR (caller <> p_white_id AND caller <> p_black_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;
  IF p_white_id = p_black_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'same_player');
  END IF;

  -- Clean stale links first
  PERFORM public.cleanup_stale_game(p_white_id);
  PERFORM public.cleanup_stale_game(p_black_id);

  -- Lock both profile rows in deterministic order to avoid deadlock
  PERFORM 1 FROM public.profiles
    WHERE user_id IN (p_white_id, p_black_id)
    ORDER BY user_id
    FOR UPDATE;

  SELECT current_game_id INTO w_gid FROM public.profiles WHERE user_id = p_white_id;
  SELECT current_game_id INTO b_gid FROM public.profiles WHERE user_id = p_black_id;

  IF w_gid IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'white_busy', 'game_id', w_gid);
  END IF;
  IF b_gid IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'black_busy', 'game_id', b_gid);
  END IF;

  INSERT INTO public.online_games (
    white_player_id, black_player_id,
    white_time, black_time,
    time_control_label, increment
  ) VALUES (
    p_white_id, p_black_id,
    p_white_time, p_black_time,
    p_time_control_label, p_increment
  ) RETURNING * INTO new_game;

  UPDATE public.profiles SET current_game_id = new_game.id
    WHERE user_id IN (p_white_id, p_black_id);

  DELETE FROM public.matchmaking_queue
    WHERE user_id IN (p_white_id, p_black_id);

  RETURN jsonb_build_object('ok', true, 'game', to_jsonb(new_game));
END;
$$;

-- 6. abort_online_game: only when no moves played
CREATE OR REPLACE FUNCTION public.abort_online_game(p_game_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  g record;
BEGIN
  SELECT * INTO g FROM public.online_games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF caller IS NULL OR (caller <> g.white_player_id AND caller <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;
  IF g.status <> 'active' THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;
  IF COALESCE(g.move_number, 0) > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'moves_played');
  END IF;

  UPDATE public.online_games
     SET status = 'aborted',
         end_reason = 'agreement',
         updated_at = now()
   WHERE id = p_game_id;

  PERFORM public._clear_current_game(p_game_id);

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 7. Patch finalize_online_game to free both players atomically
CREATE OR REPLACE FUNCTION public.finalize_online_game(p_game_id uuid, p_result text, p_end_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g record;
  did_apply boolean := false;
BEGIN
  SELECT * INTO g FROM public.online_games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF auth.uid() IS NULL OR (auth.uid() <> g.white_player_id AND auth.uid() <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;

  IF g.status = 'finished' AND g.elo_applied = true THEN
    PERFORM public._clear_current_game(p_game_id);
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  IF g.status <> 'finished' THEN
    UPDATE public.online_games
      SET status = 'finished',
          result = p_result,
          end_reason = p_end_reason,
          updated_at = now()
      WHERE id = p_game_id;
  END IF;

  IF g.elo_applied = false AND COALESCE(g.is_rated, true) = true THEN
    PERFORM public.update_elo_ratings(g.white_player_id, g.black_player_id, p_result);
    did_apply := true;
  END IF;

  UPDATE public.online_games SET elo_applied = true WHERE id = p_game_id;

  PERFORM public._clear_current_game(p_game_id);

  RETURN jsonb_build_object('ok', true, 'applied', did_apply);
END;
$$;

-- 8. Patch commit_online_move to free both players when result lands
CREATE OR REPLACE FUNCTION public.commit_online_move(p_game_id uuid, p_expected_move_number integer, p_fen_before text, p_fen_after text, p_san text, p_pgn_after text, p_from text, p_to text, p_promotion text, p_color text, p_turn_after text, p_white_time integer, p_black_time integer, p_result text DEFAULT NULL::text, p_end_reason text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g public.online_games%ROWTYPE;
  updated_game public.online_games%ROWTYPE;
  caller uuid := auth.uid();
  did_apply_elo boolean := false;
BEGIN
  SELECT * INTO g FROM public.online_games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'not_found'); END IF;
  IF caller IS NULL OR (caller <> g.white_player_id AND caller <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;
  IF g.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_active', 'game', to_jsonb(g));
  END IF;
  IF p_color NOT IN ('w','b') OR p_turn_after NOT IN ('w','b') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_turn');
  END IF;
  IF (p_color = 'w' AND caller <> g.white_player_id) OR (p_color = 'b' AND caller <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_player');
  END IF;
  IF g.turn <> p_color OR g.move_number <> p_expected_move_number OR g.fen <> p_fen_before THEN
    RETURN jsonb_build_object('ok', false, 'error', 'stale_position', 'game', to_jsonb(g));
  END IF;
  IF p_result IS NOT NULL AND p_result NOT IN ('1-0','0-1','1/2-1/2') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_result');
  END IF;

  INSERT INTO public.online_game_moves (
    game_id, ply, player_id, color, from_square, to_square, promotion,
    san, fen_before, fen_after, pgn_after, white_time, black_time
  ) VALUES (
    p_game_id, p_expected_move_number + 1, caller, p_color, p_from, p_to,
    NULLIF(p_promotion, ''), p_san, p_fen_before, p_fen_after, p_pgn_after,
    GREATEST(0, p_white_time), GREATEST(0, p_black_time)
  );

  UPDATE public.online_games
  SET fen = p_fen_after, pgn = p_pgn_after, turn = p_turn_after,
      move_number = p_expected_move_number + 1,
      last_move_from = p_from, last_move_to = p_to,
      last_move_at = now(),
      white_time = GREATEST(0, p_white_time),
      black_time = GREATEST(0, p_black_time),
      status = CASE WHEN p_result IS NULL THEN 'active' ELSE 'finished' END,
      result = COALESCE(p_result, result),
      end_reason = COALESCE(p_end_reason, end_reason),
      updated_at = now()
  WHERE id = p_game_id
  RETURNING * INTO updated_game;

  IF p_result IS NOT NULL AND g.elo_applied = false AND COALESCE(g.is_rated, true) = true THEN
    PERFORM public.update_elo_ratings(g.white_player_id, g.black_player_id, p_result);
    did_apply_elo := true;
    UPDATE public.online_games SET elo_applied = true WHERE id = p_game_id RETURNING * INTO updated_game;
  END IF;

  IF p_result IS NOT NULL THEN
    PERFORM public._clear_current_game(p_game_id);
  END IF;

  RETURN jsonb_build_object('ok', true, 'game', to_jsonb(updated_game), 'elo_applied', did_apply_elo);
EXCEPTION
  WHEN unique_violation THEN
    SELECT * INTO g FROM public.online_games WHERE id = p_game_id;
    RETURN jsonb_build_object('ok', false, 'error', 'duplicate_move', 'game', to_jsonb(g));
END;
$$;

-- 9. Backfill current_game_id for existing active games
UPDATE public.profiles p
   SET current_game_id = og.id
  FROM public.online_games og
 WHERE og.status = 'active'
   AND (og.white_player_id = p.user_id OR og.black_player_id = p.user_id)
   AND p.current_game_id IS NULL;
