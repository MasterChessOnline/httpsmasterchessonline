
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_day integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS welcome_last_claim date;

CREATE OR REPLACE FUNCTION public.claim_welcome_reward()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_last date;
  v_day int;
  v_next_day int;
  v_coins int;
  v_label text;
  v_balance int;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT welcome_last_claim, welcome_day, master_coins
    INTO v_last, v_day, v_balance
  FROM public.profiles WHERE user_id = v_uid FOR UPDATE;

  IF v_day >= 7 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'completed', 'day', v_day);
  END IF;
  IF v_last = v_today THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed', 'day', v_day);
  END IF;

  -- Reset if a day was skipped
  IF v_last IS NULL OR v_last < v_today - 1 THEN
    v_next_day := 1;
  ELSE
    v_next_day := COALESCE(v_day, 0) + 1;
  END IF;

  v_coins := CASE v_next_day
    WHEN 1 THEN 100
    WHEN 2 THEN 150
    WHEN 3 THEN 200
    WHEN 4 THEN 250
    WHEN 5 THEN 300
    WHEN 6 THEN 400
    WHEN 7 THEN 500 + floor(random() * 1500)::int
    ELSE 100
  END;

  v_label := CASE v_next_day
    WHEN 6 THEN 'free_spin'
    WHEN 7 THEN 'chest'
    ELSE 'coins'
  END;

  UPDATE public.profiles
    SET master_coins = COALESCE(master_coins, 0) + v_coins,
        welcome_day = v_next_day,
        welcome_last_claim = v_today,
        updated_at = now()
    WHERE user_id = v_uid
    RETURNING master_coins INTO v_balance;

  RETURN jsonb_build_object(
    'ok', true,
    'day', v_next_day,
    'coins', v_coins,
    'reward_type', v_label,
    'new_balance', v_balance
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_welcome_reward() TO authenticated;
