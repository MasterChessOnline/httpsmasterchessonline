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
    INTO p
    FROM public.profiles
    WHERE user_id = caller
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_profile');
  END IF;

  IF p.last_login_reward_date = today THEN
    RETURN jsonb_build_object(
      'ok', true,
      'already_claimed', true,
      'streak', p.login_streak,
      'best_streak', p.login_streak_best,
      'next_reward_in_hours', 24
    );
  END IF;

  IF p.last_login_reward_date = (today - INTERVAL '1 day')::date THEN
    new_streak := p.login_streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  -- Spec curve: Day1=25, 2=35, 3=50, 4=75, 5=100, 6=125, 7+=200
  reward_coins := CASE
    WHEN new_streak = 1 THEN 25
    WHEN new_streak = 2 THEN 35
    WHEN new_streak = 3 THEN 50
    WHEN new_streak = 4 THEN 75
    WHEN new_streak = 5 THEN 100
    WHEN new_streak = 6 THEN 125
    ELSE 200
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

  RETURN jsonb_build_object(
    'ok', true,
    'already_claimed', false,
    'streak', new_streak,
    'best_streak', GREATEST(p.login_streak_best, new_streak),
    'coins_awarded', reward_coins,
    'xp_awarded', reward_xp,
    'new_balance', p.master_coins + reward_coins
  );
END;
$function$;