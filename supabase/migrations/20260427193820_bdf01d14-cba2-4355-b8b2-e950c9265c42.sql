CREATE OR REPLACE FUNCTION public.commit_online_move(
  p_game_id uuid,
  p_expected_move_number integer,
  p_fen_before text,
  p_fen_after text,
  p_san text,
  p_pgn_after text,
  p_from text,
  p_to text,
  p_promotion text,
  p_color text,
  p_turn_after text,
  p_white_time integer,
  p_black_time integer,
  p_result text DEFAULT NULL,
  p_end_reason text DEFAULT NULL
)
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
  SELECT * INTO g
  FROM public.online_games
  WHERE id = p_game_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF caller IS NULL OR (caller <> g.white_player_id AND caller <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;

  IF g.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_active', 'game', to_jsonb(g));
  END IF;

  IF p_color NOT IN ('w', 'b') OR p_turn_after NOT IN ('w', 'b') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_turn');
  END IF;

  IF (p_color = 'w' AND caller <> g.white_player_id) OR (p_color = 'b' AND caller <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_player');
  END IF;

  IF g.turn <> p_color OR g.move_number <> p_expected_move_number OR g.fen <> p_fen_before THEN
    RETURN jsonb_build_object('ok', false, 'error', 'stale_position', 'game', to_jsonb(g));
  END IF;

  IF p_result IS NOT NULL AND p_result NOT IN ('1-0', '0-1', '1/2-1/2') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_result');
  END IF;

  INSERT INTO public.online_game_moves (
    game_id,
    ply,
    player_id,
    color,
    from_square,
    to_square,
    promotion,
    san,
    fen_before,
    fen_after,
    pgn_after,
    white_time,
    black_time
  ) VALUES (
    p_game_id,
    p_expected_move_number + 1,
    caller,
    p_color,
    p_from,
    p_to,
    NULLIF(p_promotion, ''),
    p_san,
    p_fen_before,
    p_fen_after,
    p_pgn_after,
    GREATEST(0, p_white_time),
    GREATEST(0, p_black_time)
  );

  UPDATE public.online_games
  SET
    fen = p_fen_after,
    pgn = p_pgn_after,
    turn = p_turn_after,
    move_number = p_expected_move_number + 1,
    last_move_from = p_from,
    last_move_to = p_to,
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
    UPDATE public.online_games
    SET elo_applied = true
    WHERE id = p_game_id
    RETURNING * INTO updated_game;
  END IF;

  RETURN jsonb_build_object('ok', true, 'game', to_jsonb(updated_game), 'elo_applied', did_apply_elo);
EXCEPTION
  WHEN unique_violation THEN
    SELECT * INTO g FROM public.online_games WHERE id = p_game_id;
    RETURN jsonb_build_object('ok', false, 'error', 'duplicate_move', 'game', to_jsonb(g));
END;
$$;

GRANT EXECUTE ON FUNCTION public.commit_online_move(uuid, integer, text, text, text, text, text, text, text, text, text, integer, integer, text, text) TO authenticated;