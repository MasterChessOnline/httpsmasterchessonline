
CREATE OR REPLACE FUNCTION public.award_bot_game_coins(p_bot_rating integer, p_result text, p_win_streak integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  base integer := 0;
  multiplier numeric := 1.0;
  combo_pct numeric := 0;
  streak_bonus integer := 0;
  first_win_bonus integer := 0;
  total integer;
  my_rating integer;
  new_bal integer;
  cooldown_key text;
  cooldown_count integer := 0;
  win_streak_now integer := 0;
BEGIN
  IF caller IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF p_result NOT IN ('win','loss','draw') THEN RETURN jsonb_build_object('ok', false, 'error', 'bad_result'); END IF;

  SELECT rating, win_streak
    INTO my_rating, win_streak_now
    FROM public.profiles WHERE user_id = caller;

  -- Losses: zero coins, but still reset streak.
  IF p_result = 'loss' THEN
    PERFORM set_config('request.masterchess_internal', 'true', true);
    UPDATE public.profiles
      SET win_streak = 0, loss_streak = loss_streak + 1, updated_at = now()
      WHERE user_id = caller
      RETURNING master_coins INTO new_bal;
    RETURN jsonb_build_object('ok', true, 'total', 0, 'balance', new_bal, 'reason', 'loss_no_coins');
  END IF;

  -- Draws: only paid when bot is rated higher than the player.
  IF p_result = 'draw' THEN
    IF COALESCE(p_bot_rating, 0) <= COALESCE(my_rating, 1200) THEN
      PERFORM set_config('request.masterchess_internal', 'true', true);
      UPDATE public.profiles
        SET win_streak = 0, loss_streak = 0, updated_at = now()
        WHERE user_id = caller
        RETURNING master_coins INTO new_bal;
      RETURN jsonb_build_object('ok', true, 'total', 0, 'balance', new_bal, 'reason', 'draw_not_stronger');
    END IF;
    base := CASE
      WHEN p_bot_rating < 1000 THEN 25
      WHEN p_bot_rating < 1400 THEN 40
      WHEN p_bot_rating < 1800 THEN 60
      WHEN p_bot_rating < 2200 THEN 80
      ELSE                          100
    END;
  ELSE
    -- WIN: base by bot difficulty
    base := CASE
      WHEN p_bot_rating < 1000 THEN 50
      WHEN p_bot_rating < 1400 THEN 75
      WHEN p_bot_rating < 1800 THEN 100
      WHEN p_bot_rating < 2200 THEN 125
      ELSE 150
    END;

    -- Anti-farm cooldown: count wins vs this bot tier in the last hour.
    cooldown_key := 'botcd:' || (FLOOR(p_bot_rating/200)*200)::text || ':' || to_char(date_trunc('hour', now()), 'YYYYMMDDHH24');
    SELECT COUNT(*) INTO cooldown_count
      FROM public.user_inventory
      WHERE user_id = caller AND item_key LIKE cooldown_key || '%';
  END IF;

  -- Rating-tier multiplier (player's own strength)
  multiplier := CASE
    WHEN COALESCE(my_rating, 1200) < 1200 THEN 1.0
    WHEN COALESCE(my_rating, 1200) < 1600 THEN 1.2
    WHEN COALESCE(my_rating, 1200) < 2000 THEN 1.5
    ELSE 2.0
  END;

  IF p_result = 'win' THEN
    combo_pct := CASE
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 10 THEN 1.0
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 5  THEN 0.5
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 3  THEN 0.2
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 2  THEN 0.1
      ELSE 0
    END;
    IF cooldown_count >= 3 THEN
      multiplier := multiplier * 0.25;
    END IF;
    streak_bonus := FLOOR(base * combo_pct)::int;
    IF public._mc_claim_first_win_today(caller) THEN
      first_win_bonus := 100;
    END IF;
  END IF;

  total := GREATEST(0, FLOOR(base * multiplier)::int + streak_bonus + first_win_bonus);

  PERFORM set_config('request.masterchess_internal', 'true', true);

  IF p_result = 'win' THEN
    BEGIN
      INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
      VALUES (caller, cooldown_key || ':' || gen_random_uuid()::text, '_bot_cooldown', 0);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  UPDATE public.profiles
    SET master_coins = master_coins + total,
        win_streak  = CASE WHEN p_result = 'win' THEN win_streak + 1 ELSE 0 END,
        loss_streak = 0,
        updated_at = now()
    WHERE user_id = caller
    RETURNING master_coins INTO new_bal;

  RETURN jsonb_build_object(
    'ok', true, 'base', base, 'multiplier', multiplier,
    'streak_bonus', streak_bonus, 'first_win_bonus', first_win_bonus,
    'total', total, 'balance', new_bal,
    'anti_farm', cooldown_count >= 3
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_online_game_coins(p_game_id uuid, p_win_streak integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  g record;
  my_rating integer;
  opp_rating integer;
  rating_diff integer;
  outcome text;
  base integer;
  multiplier numeric := 1.0;
  combo_pct numeric := 0;
  streak_bonus integer := 0;
  first_win_bonus integer := 0;
  total integer;
  new_bal integer;
  already boolean;
  win_streak_now integer := 0;
BEGIN
  IF caller IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  SELECT * INTO g FROM public.online_games WHERE id = p_game_id;
  IF NOT FOUND OR g.status <> 'finished' OR g.result IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_finished');
  END IF;
  IF caller <> g.white_player_id AND caller <> g.black_player_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;
  SELECT EXISTS(SELECT 1 FROM public.user_inventory WHERE user_id = caller AND item_key = 'coinaward:' || p_game_id::text) INTO already;
  IF already THEN RETURN jsonb_build_object('ok', true, 'already', true); END IF;

  IF caller = g.white_player_id THEN
    outcome := CASE g.result WHEN '1-0' THEN 'win' WHEN '0-1' THEN 'loss' ELSE 'draw' END;
    SELECT rating, win_streak INTO my_rating, win_streak_now FROM public.profiles WHERE user_id = g.white_player_id;
    SELECT rating INTO opp_rating FROM public.profiles WHERE user_id = g.black_player_id;
  ELSE
    outcome := CASE g.result WHEN '0-1' THEN 'win' WHEN '1-0' THEN 'loss' ELSE 'draw' END;
    SELECT rating, win_streak INTO my_rating, win_streak_now FROM public.profiles WHERE user_id = g.black_player_id;
    SELECT rating INTO opp_rating FROM public.profiles WHERE user_id = g.white_player_id;
  END IF;

  rating_diff := COALESCE(opp_rating, 1200) - COALESCE(my_rating, 1200);

  -- Losses: zero coins.
  IF outcome = 'loss' THEN
    PERFORM set_config('request.masterchess_internal', 'true', true);
    UPDATE public.profiles
      SET win_streak = 0, loss_streak = loss_streak + 1, updated_at = now()
      WHERE user_id = caller
      RETURNING master_coins INTO new_bal;
    INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
      VALUES (caller, 'coinaward:' || p_game_id::text, '_coin_award', 0);
    RETURN jsonb_build_object('ok', true, 'total', 0, 'balance', new_bal, 'outcome', outcome, 'reason', 'loss_no_coins');
  END IF;

  -- Draws: only paid when opponent rating is higher than caller's.
  IF outcome = 'draw' THEN
    IF rating_diff <= 0 THEN
      PERFORM set_config('request.masterchess_internal', 'true', true);
      UPDATE public.profiles
        SET win_streak = 0, loss_streak = 0, updated_at = now()
        WHERE user_id = caller
        RETURNING master_coins INTO new_bal;
      INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
        VALUES (caller, 'coinaward:' || p_game_id::text, '_coin_award', 0);
      RETURN jsonb_build_object('ok', true, 'total', 0, 'balance', new_bal, 'outcome', outcome, 'reason', 'draw_not_stronger');
    END IF;
    base := CASE
      WHEN rating_diff >= 300 THEN 150
      WHEN rating_diff >= 150 THEN 100
      ELSE                         60
    END;
  ELSE
    -- WIN base
    base := CASE
      WHEN rating_diff >= 300  THEN 300
      WHEN rating_diff >= 150  THEN 220
      WHEN rating_diff >= 0    THEN 160
      WHEN rating_diff >= -150 THEN 130
      ELSE                          100
    END;
  END IF;

  multiplier := CASE
    WHEN COALESCE(my_rating, 1200) < 1200 THEN 1.0
    WHEN COALESCE(my_rating, 1200) < 1600 THEN 1.2
    WHEN COALESCE(my_rating, 1200) < 2000 THEN 1.5
    ELSE 2.0
  END;

  IF outcome = 'win' THEN
    combo_pct := CASE
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 10 THEN 1.0
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 5  THEN 0.5
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 3  THEN 0.2
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 2  THEN 0.1
      ELSE 0
    END;
    streak_bonus := FLOOR(base * combo_pct)::int;
    IF public._mc_claim_first_win_today(caller) THEN
      first_win_bonus := 100;
    END IF;
  END IF;

  total := GREATEST(0, FLOOR(base * multiplier)::int + streak_bonus + first_win_bonus);

  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles
    SET master_coins = master_coins + total,
        win_streak  = CASE WHEN outcome = 'win' THEN win_streak + 1 ELSE 0 END,
        loss_streak = 0,
        updated_at = now()
    WHERE user_id = caller
    RETURNING master_coins INTO new_bal;
  INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
    VALUES (caller, 'coinaward:' || p_game_id::text, '_coin_award', -total);
  RETURN jsonb_build_object('ok', true, 'base', base, 'multiplier', multiplier,
    'streak_bonus', streak_bonus, 'first_win_bonus', first_win_bonus,
    'total', total, 'balance', new_bal, 'outcome', outcome,
    'opp_rating', opp_rating, 'my_rating', my_rating);
END;
$function$;
