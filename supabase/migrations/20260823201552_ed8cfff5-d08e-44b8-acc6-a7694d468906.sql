CREATE OR REPLACE FUNCTION public.cleanup_stale_online_games()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_timed_out int := 0;
  v_aborted_unstarted int := 0;
  v_aborted_stale int := 0;
  v_queue int := 0;
  g record;
  v_result text;
BEGIN
  -- 1) Flag fall: the side to move ran out of clock time.
  FOR g IN
    SELECT id, turn, white_time, black_time, white_player_id, black_player_id,
           COALESCE(last_move_at, created_at) AS ref_at, move_number
    FROM public.online_games
    WHERE status = 'active' AND COALESCE(move_number, 0) > 0
  LOOP
    IF (CASE WHEN g.turn = 'w' THEN g.white_time ELSE g.black_time END)
       - EXTRACT(EPOCH FROM (now() - g.ref_at)) <= 0 THEN
      v_result := CASE WHEN g.turn = 'w' THEN '0-1' ELSE '1-0' END;
      UPDATE public.online_games
         SET status = 'finished', result = v_result, end_reason = 'timeout'
       WHERE id = g.id AND status = 'active';
      UPDATE public.profiles SET current_game_id = NULL
       WHERE user_id IN (g.white_player_id, g.black_player_id)
         AND current_game_id = g.id;
      v_timed_out := v_timed_out + 1;
    END IF;
  END LOOP;

  -- 2) Nobody ever moved and the game is older than 10 minutes.
  WITH done AS (
    UPDATE public.online_games
       SET status = 'aborted', end_reason = 'agreement'
     WHERE status = 'active'
       AND COALESCE(move_number, 0) = 0
       AND created_at < now() - interval '10 minutes'
    RETURNING id, white_player_id, black_player_id
  )
  SELECT count(*) INTO v_aborted_unstarted FROM done;

  -- 3) No move for over 30 minutes: both players are long gone.
  WITH done AS (
    UPDATE public.online_games
       SET status = 'aborted', end_reason = 'agreement'
     WHERE status = 'active'
       AND COALESCE(last_move_at, created_at) < now() - interval '30 minutes'
    RETURNING id
  )
  SELECT count(*) INTO v_aborted_stale FROM done;

  -- 4) Never leave a player locked to a game that is no longer running.
  UPDATE public.profiles p
     SET current_game_id = NULL
   WHERE p.current_game_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.online_games og
        WHERE og.id = p.current_game_id AND og.status = 'active'
     );

  -- 5) Stale queue rows would otherwise match a player against a ghost.
  WITH done AS (
    DELETE FROM public.matchmaking_queue
     WHERE created_at < now() - interval '5 minutes'
    RETURNING id
  )
  SELECT count(*) INTO v_queue FROM done;

  RETURN jsonb_build_object(
    'timed_out', v_timed_out,
    'aborted_unstarted', v_aborted_unstarted,
    'aborted_stale', v_aborted_stale,
    'queue_removed', v_queue
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_stale_online_games() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_stale_online_games() TO service_role;

SELECT cron.unschedule('online-games-cleanup-sql') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'online-games-cleanup-sql'
);
SELECT cron.schedule('online-games-cleanup-sql', '* * * * *', $$SELECT public.cleanup_stale_online_games();$$);

SELECT public.cleanup_stale_online_games();