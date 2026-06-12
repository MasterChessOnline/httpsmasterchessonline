
CREATE TABLE IF NOT EXISTS public.weekly_spin_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  iso_year int NOT NULL,
  iso_week int NOT NULL,
  coins_awarded int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, iso_year, iso_week)
);
GRANT SELECT, INSERT ON public.weekly_spin_claims TO authenticated;
GRANT ALL ON public.weekly_spin_claims TO service_role;
ALTER TABLE public.weekly_spin_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own weekly claims"
  ON public.weekly_spin_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Weekly spin RPC
CREATE OR REPLACE FUNCTION public.claim_weekly_spin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  yr int := EXTRACT(ISOYEAR FROM now())::int;
  wk int := EXTRACT(WEEK FROM now())::int;
  exists_row int;
  roll numeric;
  reward int;
  new_bal int;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;

  SELECT 1 INTO exists_row FROM public.weekly_spin_claims
    WHERE user_id = uid AND iso_year = yr AND iso_week = wk;
  IF exists_row IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  roll := random();
  IF    roll < 0.40 THEN reward := 100;
  ELSIF roll < 0.70 THEN reward := 250;
  ELSIF roll < 0.87 THEN reward := 500;
  ELSIF roll < 0.96 THEN reward := 1000;
  ELSIF roll < 0.995 THEN reward := 2500;
  ELSE  reward := 10000;
  END IF;

  INSERT INTO public.weekly_spin_claims(user_id, iso_year, iso_week, coins_awarded)
    VALUES (uid, yr, wk, reward);

  UPDATE public.profiles SET coins = COALESCE(coins, 0) + reward
    WHERE user_id = uid RETURNING coins INTO new_bal;

  RETURN jsonb_build_object('ok', true, 'coins', reward, 'new_balance', new_bal, 'tier', 'weekly');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_weekly_spin FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_weekly_spin TO authenticated;

-- Legendary spin RPC (costs 1000 coins, big payouts)
CREATE OR REPLACE FUNCTION public.spin_wheel_legendary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cost int := 1000;
  bal int;
  roll numeric;
  reward int;
  new_bal int;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthorized'); END IF;

  SELECT COALESCE(coins, 0) INTO bal FROM public.profiles WHERE user_id = uid;
  IF bal < cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_coins', 'needed', cost - bal);
  END IF;

  roll := random();
  IF    roll < 0.50 THEN reward := 500;
  ELSIF roll < 0.80 THEN reward := 1500;
  ELSIF roll < 0.94 THEN reward := 3000;
  ELSIF roll < 0.99 THEN reward := 7500;
  ELSE  reward := 25000;
  END IF;

  UPDATE public.profiles
    SET coins = COALESCE(coins, 0) - cost + reward
    WHERE user_id = uid
    RETURNING coins INTO new_bal;

  RETURN jsonb_build_object(
    'ok', true, 'coins', reward, 'cost', cost,
    'net', reward - cost, 'new_balance', new_bal, 'tier', 'legendary'
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.spin_wheel_legendary FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spin_wheel_legendary TO authenticated;
