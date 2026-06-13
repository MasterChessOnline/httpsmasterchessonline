
CREATE OR REPLACE FUNCTION public.award_bot_game_coins(
  p_bot_rating integer,
  p_result text,
  p_win_streak integer DEFAULT 0,
  p_bot_game_id uuid DEFAULT NULL
)
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
  bg public.bot_games%ROWTYPE;
  award_marker text;
BEGIN
  IF caller IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF p_result NOT IN ('win','loss','draw') THEN RETURN jsonb_build_object('ok', false, 'error', 'bad_result'); END IF;

  SELECT rating, win_streak
    INTO my_rating, win_streak_now
    FROM public.profiles WHERE user_id = caller;

  IF p_result = 'loss' THEN
    PERFORM set_config('request.masterchess_internal', 'true', true);
    UPDATE public.profiles
      SET win_streak = 0, loss_streak = loss_streak + 1, updated_at = now()
      WHERE user_id = caller
      RETURNING master_coins INTO new_bal;
    RETURN jsonb_build_object('ok', true, 'total', 0, 'balance', new_bal, 'reason', 'loss_no_coins');
  END IF;

  IF p_bot_game_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing_bot_game_id');
  END IF;

  SELECT * INTO bg FROM public.bot_games WHERE id = p_bot_game_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bot_game_not_found');
  END IF;
  IF bg.user_id <> caller THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_owner');
  END IF;
  IF bg.outcome <> p_result THEN
    RETURN jsonb_build_object('ok', false, 'error', 'outcome_mismatch');
  END IF;

  p_bot_rating := bg.bot_rating;

  award_marker := 'bot_award:' || p_bot_game_id::text;
  IF EXISTS (
    SELECT 1 FROM public.user_inventory
    WHERE user_id = caller AND item_key = award_marker
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_awarded');
  END IF;

  IF p_result = 'draw' THEN
    IF COALESCE(p_bot_rating, 0) <= COALESCE(my_rating, 1200) THEN
      PERFORM set_config('request.masterchess_internal', 'true', true);
      UPDATE public.profiles
        SET win_streak = 0, loss_streak = 0, updated_at = now()
        WHERE user_id = caller
        RETURNING master_coins INTO new_bal;
      BEGIN
        INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
          VALUES (caller, award_marker, '_bot_award', 0);
      EXCEPTION WHEN OTHERS THEN NULL;
      END;
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
    base := CASE
      WHEN p_bot_rating < 1000 THEN 50
      WHEN p_bot_rating < 1400 THEN 75
      WHEN p_bot_rating < 1800 THEN 100
      WHEN p_bot_rating < 2200 THEN 125
      ELSE 150
    END;

    cooldown_key := 'botcd:' || (FLOOR(p_bot_rating/200)*200)::text || ':' || to_char(date_trunc('hour', now()), 'YYYYMMDDHH24');
    SELECT COUNT(*) INTO cooldown_count
      FROM public.user_inventory
      WHERE user_id = caller AND item_key LIKE cooldown_key || '%';
  END IF;

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

  BEGIN
    INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
      VALUES (caller, award_marker, '_bot_award', 0);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
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

CREATE OR REPLACE FUNCTION public.finalize_online_game(
  p_game_id uuid, p_result text, p_end_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  g public.online_games%ROWTYPE;
  updated_game public.online_games%ROWTYPE;
  did_apply boolean := false;
  caller uuid := auth.uid();
  caller_color text;
BEGIN
  IF p_result NOT IN ('1-0','0-1','1/2-1/2') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_result');
  END IF;

  SELECT * INTO g FROM public.online_games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF caller IS NULL OR (caller <> g.white_player_id AND caller <> g.black_player_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;

  PERFORM set_config('request.masterchess_internal', 'true', true);

  IF g.status = 'finished' THEN
    PERFORM public._clear_current_game(p_game_id);
    SELECT * INTO updated_game FROM public.online_games WHERE id = p_game_id;
    RETURN jsonb_build_object('ok', true, 'already', true, 'game', to_jsonb(updated_game), 'applied', false);
  END IF;

  caller_color := CASE WHEN caller = g.white_player_id THEN 'w' ELSE 'b' END;

  IF p_end_reason = 'agreement' THEN
    IF p_result <> '1/2-1/2' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'agreement_must_be_draw');
    END IF;
  ELSIF p_end_reason IN ('resignation','timeout','abandoned') THEN
    IF (caller_color = 'w' AND p_result <> '0-1')
       OR (caller_color = 'b' AND p_result <> '1-0') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'result_inconsistent_with_caller');
    END IF;
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'end_reason_not_allowed');
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
$function$;

CREATE OR REPLACE FUNCTION public._stream_force_role_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sub_tier text;
  canonical_name text;
  canonical_avatar text;
BEGIN
  SELECT tier INTO sub_tier
  FROM public.stream_subscriptions
  WHERE user_id = NEW.user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  NEW.role := COALESCE(sub_tier, 'free');
  NEW.is_highlighted := (sub_tier IS NOT NULL);

  SELECT COALESCE(display_name, username), avatar_url
    INTO canonical_name, canonical_avatar
    FROM public.profiles
    WHERE user_id = NEW.user_id;

  NEW.username   := COALESCE(canonical_name, 'Player');
  NEW.avatar_url := canonical_avatar;

  RETURN NEW;
END;
$function$;

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  username,
  display_name,
  avatar_url,
  bio,
  favorite_openings,
  country,
  country_flag,
  city_key,
  avatar_frame,
  profile_banner,
  push_notifications_enabled,
  is_streamer,
  highest_title_key
) ON public.profiles TO authenticated;

REVOKE SELECT (
  master_coins, login_streak, login_streak_best, last_login_reward_date,
  win_streak, loss_streak, current_game_id, push_notifications_enabled,
  welcome_day, welcome_last_claim, total_xp
) ON public.profiles FROM anon, authenticated;

REVOKE ALL ON public.email_unsubscribe_tokens FROM anon, authenticated;
GRANT ALL ON public.email_unsubscribe_tokens TO service_role;
