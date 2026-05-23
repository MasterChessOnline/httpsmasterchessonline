-- Allow trusted SECURITY DEFINER game functions to update protected fields,
-- while still blocking direct client updates to status/result/Elo fields.
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR current_setting('request.masterchess_internal', true) = 'true' THEN
    RETURN NEW;
  END IF;

  NEW.rating := OLD.rating;
  NEW.peak_rating := OLD.peak_rating;
  NEW.bot_rating := OLD.bot_rating;
  NEW.bot_peak_rating := OLD.bot_peak_rating;
  NEW.master_coins := OLD.master_coins;
  NEW.games_played := OLD.games_played;
  NEW.games_won := OLD.games_won;
  NEW.games_lost := OLD.games_lost;
  NEW.games_drawn := OLD.games_drawn;
  NEW.bot_games_played := OLD.bot_games_played;
  NEW.bot_games_won := OLD.bot_games_won;
  NEW.bot_games_lost := OLD.bot_games_lost;
  NEW.bot_games_drawn := OLD.bot_games_drawn;
  NEW.followers_count := OLD.followers_count;
  NEW.following_count := OLD.following_count;
  NEW.highest_title_key := OLD.highest_title_key;
  NEW.is_streamer := OLD.is_streamer;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_online_game_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR current_setting('request.masterchess_internal', true) = 'true' THEN
    RETURN NEW;
  END IF;

  NEW.result := OLD.result;
  NEW.status := OLD.status;
  NEW.elo_applied := OLD.elo_applied;
  NEW.end_reason := OLD.end_reason;
  NEW.is_rated := OLD.is_rated;
  NEW.white_player_id := OLD.white_player_id;
  NEW.black_player_id := OLD.black_player_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_online_game(p_game_id uuid, p_result text, p_end_reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g public.online_games%ROWTYPE;
  updated_game public.online_games%ROWTYPE;
  did_apply boolean := false;
BEGIN
  IF p_result NOT IN ('1-0','0-1','1/2-1/2') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_result');
  END IF;

  SELECT * INTO g FROM public.online_games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF auth.uid() IS NULL OR (auth.uid() <> g.white_player_id AND auth.uid() <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;

  PERFORM set_config('request.masterchess_internal', 'true', true);

  IF g.status = 'finished' THEN
    PERFORM public._clear_current_game(p_game_id);
    SELECT * INTO updated_game FROM public.online_games WHERE id = p_game_id;
    RETURN jsonb_build_object('ok', true, 'already', true, 'game', to_jsonb(updated_game), 'applied', false);
  END IF;

  UPDATE public.online_games
    SET status = 'finished',
        result = p_result,
        end_reason = p_end_reason,
        updated_at = now()
    WHERE id = p_game_id
    RETURNING * INTO updated_game;

  IF COALESCE(g.elo_applied, false) = false AND COALESCE(g.is_rated, true) = true THEN
    PERFORM public.update_elo_ratings(g.white_player_id, g.black_player_id, p_result);
    did_apply := true;
  END IF;

  UPDATE public.online_games
    SET elo_applied = true, updated_at = now()
    WHERE id = p_game_id
    RETURNING * INTO updated_game;

  PERFORM public._clear_current_game(p_game_id);

  RETURN jsonb_build_object('ok', true, 'applied', did_apply, 'game', to_jsonb(updated_game));
END;
$$;

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

  PERFORM set_config('request.masterchess_internal', 'true', true);

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

  IF p_result IS NOT NULL AND COALESCE(g.elo_applied, false) = false AND COALESCE(g.is_rated, true) = true THEN
    PERFORM public.update_elo_ratings(g.white_player_id, g.black_player_id, p_result);
    did_apply_elo := true;
    UPDATE public.online_games SET elo_applied = true, updated_at = now() WHERE id = p_game_id RETURNING * INTO updated_game;
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

GRANT EXECUTE ON FUNCTION public.finalize_online_game(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commit_online_move(uuid, integer, text, text, text, text, text, text, text, text, text, integer, integer, text, text) TO authenticated;