
CREATE OR REPLACE FUNCTION public.claim_daily_spin()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  today date := (now() AT TIME ZONE 'UTC')::date;
  roll integer;
  coins integer;
  new_bal integer;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF EXISTS (SELECT 1 FROM public.daily_spin_claims WHERE user_id = caller AND claim_date = today) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  roll := 1 + floor(random() * 100)::int; -- 1..100
  coins := CASE
    WHEN roll <= 18 THEN 25
    WHEN roll <= 36 THEN 50
    WHEN roll <= 56 THEN 100
    WHEN roll <= 74 THEN 250
    WHEN roll <= 88 THEN 500
    WHEN roll <= 96 THEN 1000
    ELSE                 2500
  END;

  INSERT INTO public.daily_spin_claims (user_id, claim_date, coins_awarded)
    VALUES (caller, today, coins);

  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles
    SET master_coins = master_coins + coins, updated_at = now()
    WHERE user_id = caller
    RETURNING master_coins INTO new_bal;

  RETURN jsonb_build_object('ok', true, 'coins', coins, 'new_balance', new_bal);
END;
$function$;

CREATE OR REPLACE FUNCTION public.spin_wheel_paid()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller uuid := auth.uid();
  cost   integer := 100;
  bal    integer;
  reward integer;
  roll   numeric;
  new_bal integer;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT master_coins INTO bal FROM public.profiles WHERE user_id = caller;
  IF bal IS NULL OR bal < cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_coins', 'cost', cost);
  END IF;

  roll := random();
  IF    roll < 0.30 THEN reward := 100;
  ELSIF roll < 0.58 THEN reward := 250;
  ELSIF roll < 0.80 THEN reward := 500;
  ELSIF roll < 0.94 THEN reward := 1000;
  ELSIF roll < 0.995 THEN reward := 2500;
  ELSE                  reward := 5000;
  END IF;

  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles
    SET master_coins = master_coins - cost + reward, updated_at = now()
    WHERE user_id = caller
    RETURNING master_coins INTO new_bal;

  RETURN jsonb_build_object('ok', true, 'coins', reward, 'cost', cost, 'new_balance', new_bal);
END;
$function$;
