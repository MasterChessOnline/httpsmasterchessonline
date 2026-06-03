
-- Updated daily reward curve (50/75/100/125/150/200/500) and add first-win-of-day +100 to both bot and online coin RPCs.

CREATE OR REPLACE FUNCTION public.claim_daily_reward()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  p record;
  today date := (now() AT TIME ZONE 'UTC')::date;
  new_streak integer;
  reward_coins integer;
  reward_xp integer;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  SELECT login_streak, login_streak_best, last_login_reward_date, master_coins
    INTO p FROM public.profiles WHERE user_id = caller FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_profile');
  END IF;
  IF p.last_login_reward_date = today THEN
    RETURN jsonb_build_object('ok', true, 'already_claimed', true,
      'streak', p.login_streak, 'best_streak', p.login_streak_best,
      'next_reward_in_hours', 24);
  END IF;
  IF p.last_login_reward_date = (today - INTERVAL '1 day')::date THEN
    new_streak := p.login_streak + 1;
  ELSE
    new_streak := 1;
  END IF;
  reward_coins := CASE
    WHEN new_streak = 1 THEN 50
    WHEN new_streak = 2 THEN 75
    WHEN new_streak = 3 THEN 100
    WHEN new_streak = 4 THEN 125
    WHEN new_streak = 5 THEN 150
    WHEN new_streak = 6 THEN 200
    ELSE 500
  END;
  reward_xp := new_streak * 10;
  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles
    SET login_streak = new_streak,
        login_streak_best = GREATEST(login_streak_best, new_streak),
        last_login_reward_date = today,
        master_coins = master_coins + reward_coins,
        updated_at = now()
    WHERE user_id = caller;
  RETURN jsonb_build_object('ok', true, 'already_claimed', false,
    'streak', new_streak, 'best_streak', GREATEST(p.login_streak_best, new_streak),
    'coins_awarded', reward_coins, 'xp_awarded', reward_xp,
    'new_balance', p.master_coins + reward_coins);
END;
$function$;

-- Helper: claim a first-win-of-day marker (returns true if granted, false if already claimed today).
CREATE OR REPLACE FUNCTION public._mc_claim_first_win_today(p_user uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  today_key text := 'firstwin:' || to_char((now() AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD');
BEGIN
  BEGIN
    INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
      VALUES (p_user, today_key, '_first_win_of_day', -100);
    RETURN true;
  EXCEPTION WHEN unique_violation THEN
    RETURN false;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_bot_game_coins(
  p_bot_rating integer,
  p_result text,
  p_win_streak integer DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  base integer := 0;
  streak_bonus integer := 0;
  first_win_bonus integer := 0;
  total integer;
  new_bal integer;
BEGIN
  IF caller IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF p_result NOT IN ('win','loss','draw') THEN RETURN jsonb_build_object('ok', false, 'error', 'bad_result'); END IF;
  -- Spec tiers
  base := CASE
    WHEN p_bot_rating < 1000 THEN 15
    WHEN p_bot_rating < 1400 THEN 25
    WHEN p_bot_rating < 1800 THEN 40
    WHEN p_bot_rating < 2200 THEN 60
    ELSE 100
  END;
  IF p_result = 'loss' THEN base := 2;
  ELSIF p_result = 'draw' THEN base := GREATEST(5, base / 2);
  END IF;
  IF p_result = 'win' THEN
    streak_bonus := CASE
      WHEN p_win_streak >= 10 THEN 150
      WHEN p_win_streak >= 5 THEN 50
      WHEN p_win_streak >= 3 THEN 20
      WHEN p_win_streak >= 2 THEN 10
      ELSE 0
    END;
    IF public._mc_claim_first_win_today(caller) THEN
      first_win_bonus := 100;
    END IF;
  END IF;
  total := base + streak_bonus + first_win_bonus;
  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles SET master_coins = master_coins + total, updated_at = now()
    WHERE user_id = caller RETURNING master_coins INTO new_bal;
  RETURN jsonb_build_object('ok', true, 'base', base, 'streak_bonus', streak_bonus,
    'first_win_bonus', first_win_bonus, 'total', total, 'balance', new_bal);
END;
$$;

CREATE OR REPLACE FUNCTION public.award_online_game_coins(
  p_game_id uuid,
  p_win_streak integer DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  g record;
  my_rating integer;
  opp_rating integer;
  outcome text;
  base integer;
  streak_bonus integer := 0;
  first_win_bonus integer := 0;
  total integer;
  new_bal integer;
  already boolean;
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
    SELECT rating INTO my_rating FROM public.profiles WHERE user_id = g.white_player_id;
    SELECT rating INTO opp_rating FROM public.profiles WHERE user_id = g.black_player_id;
  ELSE
    outcome := CASE g.result WHEN '0-1' THEN 'win' WHEN '1-0' THEN 'loss' ELSE 'draw' END;
    SELECT rating INTO my_rating FROM public.profiles WHERE user_id = g.black_player_id;
    SELECT rating INTO opp_rating FROM public.profiles WHERE user_id = g.white_player_id;
  END IF;

  base := CASE
    WHEN COALESCE(opp_rating, 1200) < 1000 THEN 15
    WHEN COALESCE(opp_rating, 1200) < 1400 THEN 25
    WHEN COALESCE(opp_rating, 1200) < 1800 THEN 40
    WHEN COALESCE(opp_rating, 1200) < 2200 THEN 60
    ELSE 100
  END;
  IF outcome = 'loss' THEN base := 3;
  ELSIF outcome = 'draw' THEN base := GREATEST(5, base / 2);
  END IF;
  IF outcome = 'win' THEN
    streak_bonus := CASE
      WHEN p_win_streak >= 10 THEN 150
      WHEN p_win_streak >= 5 THEN 50
      WHEN p_win_streak >= 3 THEN 20
      WHEN p_win_streak >= 2 THEN 10
      ELSE 0
    END;
    IF public._mc_claim_first_win_today(caller) THEN
      first_win_bonus := 100;
    END IF;
  END IF;
  total := base + streak_bonus + first_win_bonus;

  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles SET master_coins = master_coins + total, updated_at = now()
    WHERE user_id = caller RETURNING master_coins INTO new_bal;
  INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
    VALUES (caller, 'coinaward:' || p_game_id::text, '_coin_award', -total);
  RETURN jsonb_build_object('ok', true, 'base', base, 'streak_bonus', streak_bonus,
    'first_win_bonus', first_win_bonus, 'total', total,
    'balance', new_bal, 'outcome', outcome, 'opp_rating', opp_rating, 'my_rating', my_rating);
END;
$$;
