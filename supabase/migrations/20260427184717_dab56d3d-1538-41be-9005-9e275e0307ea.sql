
ALTER TABLE public.online_games
  ADD COLUMN IF NOT EXISTS end_reason text,
  ADD COLUMN IF NOT EXISTS elo_applied boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.finalize_online_game(
  p_game_id uuid,
  p_result text,
  p_end_reason text
) RETURNS jsonb
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

  -- Caller must be a player in the game
  IF auth.uid() IS NULL OR (auth.uid() <> g.white_player_id AND auth.uid() <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;

  -- Already finished AND elo applied → no-op
  IF g.status = 'finished' AND g.elo_applied = true THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  -- Mark finished + set reason on first finalize
  IF g.status <> 'finished' THEN
    UPDATE public.online_games
      SET status = 'finished',
          result = p_result,
          end_reason = p_end_reason,
          updated_at = now()
      WHERE id = p_game_id;
  END IF;

  -- Apply Elo exactly once (rated games only)
  IF g.elo_applied = false AND COALESCE(g.is_rated, true) = true THEN
    PERFORM public.update_elo_ratings(g.white_player_id, g.black_player_id, p_result);
    did_apply := true;
  END IF;

  UPDATE public.online_games
    SET elo_applied = true
    WHERE id = p_game_id;

  RETURN jsonb_build_object('ok', true, 'applied', did_apply);
END;
$$;
