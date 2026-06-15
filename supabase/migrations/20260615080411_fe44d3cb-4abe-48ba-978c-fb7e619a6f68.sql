-- =========================================================================
-- 1) PROFILES: revoke SELECT on sensitive columns from `anon`
-- =========================================================================
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, user_id, username, display_name, avatar_url,
  rating, peak_rating,
  games_played, games_won, games_lost, games_drawn,
  bot_rating, bot_peak_rating,
  bot_games_played, bot_games_won, bot_games_lost, bot_games_drawn,
  created_at, updated_at,
  favorite_openings, favorite_opening, bio,
  followers_count, following_count,
  country, country_flag, highest_title_key, city_key,
  avatar_frame, profile_banner,
  is_streamer, onboarding_completed, skill_level
) ON public.profiles TO anon;

-- authenticated keeps full SELECT (covered by the existing permissive policy;
-- own-row sensitive data is served through get_my_profile RPC for clarity).

-- =========================================================================
-- 2) commit_online_move: server-side validation of promotion field
-- =========================================================================
CREATE OR REPLACE FUNCTION public.commit_online_move(
  p_game_id uuid, p_expected_move_number integer,
  p_fen_before text, p_fen_after text, p_san text, p_pgn_after text,
  p_from text, p_to text, p_promotion text,
  p_color text, p_turn_after text,
  p_white_time integer, p_black_time integer,
  p_result text DEFAULT NULL::text, p_end_reason text DEFAULT NULL::text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  g public.online_games%ROWTYPE;
  updated_game public.online_games%ROWTYPE;
  caller uuid := auth.uid();
  did_apply_elo boolean := false;
  v_promotion text;
  v_to_rank text;
  v_expected_rank text;
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

  -- Server-side promotion validation:
  --   Only accept a promotion when the move ends on the promotion rank
  --   AND the piece value is one of q/r/b/n. Otherwise force NULL.
  v_promotion := NULLIF(LOWER(COALESCE(p_promotion, '')), '');
  v_to_rank := RIGHT(COALESCE(p_to, ''), 1);
  v_expected_rank := CASE WHEN p_color = 'w' THEN '8' ELSE '1' END;
  IF v_promotion IS NOT NULL THEN
    IF v_to_rank <> v_expected_rank OR v_promotion NOT IN ('q','r','b','n') THEN
      v_promotion := NULL;
    END IF;
  END IF;

  PERFORM set_config('request.masterchess_internal', 'true', true);

  INSERT INTO public.online_game_moves (
    game_id, ply, player_id, color, from_square, to_square, promotion,
    san, fen_before, fen_after, pgn_after, white_time, black_time
  ) VALUES (
    p_game_id, p_expected_move_number + 1, caller, p_color, p_from, p_to,
    v_promotion, p_san, p_fen_before, p_fen_after, p_pgn_after,
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
$function$;

-- Re-apply grants (CREATE OR REPLACE keeps them but be explicit)
REVOKE EXECUTE ON FUNCTION public.commit_online_move(uuid,integer,text,text,text,text,text,text,text,text,text,integer,integer,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.commit_online_move(uuid,integer,text,text,text,text,text,text,text,text,text,integer,integer,text,text) TO authenticated, service_role;

-- Clean up historical bad data: only keep promotion when destination is a promotion rank
UPDATE public.online_game_moves
   SET promotion = NULL
 WHERE promotion IS NOT NULL
   AND NOT (
     (color = 'w' AND RIGHT(to_square, 1) = '8') OR
     (color = 'b' AND RIGHT(to_square, 1) = '1')
   );