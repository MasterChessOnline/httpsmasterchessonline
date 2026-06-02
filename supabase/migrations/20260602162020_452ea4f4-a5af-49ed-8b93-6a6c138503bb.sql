-- Daily Spin claims: one per UTC day per user
CREATE TABLE IF NOT EXISTS public.daily_spin_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claim_date date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  coins_awarded integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, claim_date)
);

GRANT SELECT, INSERT ON public.daily_spin_claims TO authenticated;
GRANT ALL ON public.daily_spin_claims TO service_role;

ALTER TABLE public.daily_spin_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own spin claims"
  ON public.daily_spin_claims FOR SELECT
  USING (auth.uid() = user_id);

-- No client INSERT/UPDATE/DELETE: writes happen through SECURITY DEFINER RPC only.

-- Weighted spin RPC. Weights: 25(35) 50(25) 100(18) 250(12) 500(6) 1000(3) 2500(1) → total 100.
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
    WHEN roll <= 35  THEN 25
    WHEN roll <= 60  THEN 50
    WHEN roll <= 78  THEN 100
    WHEN roll <= 90  THEN 250
    WHEN roll <= 96  THEN 500
    WHEN roll <= 99  THEN 1000
    ELSE                  2500
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