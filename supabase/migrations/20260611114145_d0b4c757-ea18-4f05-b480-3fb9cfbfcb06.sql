
-- 1. Track column on claims
ALTER TABLE public.battle_pass_claims
  ADD COLUMN IF NOT EXISTS track text NOT NULL DEFAULT 'free'
  CHECK (track IN ('free','premium'));

-- Replace unique constraint to include track
ALTER TABLE public.battle_pass_claims
  DROP CONSTRAINT IF EXISTS battle_pass_claims_user_id_season_id_tier_index_key;
ALTER TABLE public.battle_pass_claims
  ADD CONSTRAINT battle_pass_claims_user_season_tier_track_key
  UNIQUE (user_id, season_id, tier_index, track);

-- 2. Premium pass ownership
CREATE TABLE IF NOT EXISTS public.battle_pass_premium (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  price_paid integer NOT NULL DEFAULT 0,
  UNIQUE (user_id, season_id)
);

GRANT SELECT ON public.battle_pass_premium TO authenticated;
GRANT ALL ON public.battle_pass_premium TO service_role;

ALTER TABLE public.battle_pass_premium ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view_own_premium_pass" ON public.battle_pass_premium;
CREATE POLICY "view_own_premium_pass" ON public.battle_pass_premium
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Helper
CREATE OR REPLACE FUNCTION public.has_premium_pass(_user uuid, _season uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.battle_pass_premium
    WHERE user_id = _user AND season_id = _season
  );
$$;

-- 4. Buy premium pass (2500 coins)
CREATE OR REPLACE FUNCTION public.buy_premium_pass()
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _season uuid;
  _price int := 2500;
  _balance int;
  _new_balance int;
BEGIN
  IF _user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT id INTO _season FROM public.seasons
  WHERE status = 'active' AND now() BETWEEN starts_at AND ends_at
  ORDER BY starts_at DESC LIMIT 1;

  IF _season IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_active_season');
  END IF;

  IF EXISTS(SELECT 1 FROM public.battle_pass_premium WHERE user_id=_user AND season_id=_season) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_owned');
  END IF;

  SELECT master_coins INTO _balance FROM public.profiles WHERE user_id = _user;
  IF COALESCE(_balance,0) < _price THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_coins', 'balance', COALESCE(_balance,0), 'price', _price);
  END IF;

  UPDATE public.profiles SET master_coins = master_coins - _price
  WHERE user_id = _user RETURNING master_coins INTO _new_balance;

  INSERT INTO public.battle_pass_premium(user_id, season_id, price_paid)
  VALUES (_user, _season, _price);

  RETURN jsonb_build_object('ok', true, 'new_balance', _new_balance, 'season_id', _season);
END;
$$;

-- 5. Updated claim function (50 tiers + bonus 51+, Free vs Premium track)
CREATE OR REPLACE FUNCTION public.claim_battle_pass_tier(_tier integer, _track text DEFAULT 'free')
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _season uuid;
  _xp int;
  _required int;
  _reward int;
  _new_balance int;
  _has_premium boolean;
BEGIN
  IF _user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF _tier < 1 OR _tier > 100 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_tier');
  END IF;
  IF _track NOT IN ('free','premium') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_track');
  END IF;

  SELECT bp.season_id, bp.season_xp INTO _season, _xp
  FROM public.battle_pass_progress(_user) bp;

  IF _season IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_active_season');
  END IF;

  IF _track = 'premium' THEN
    SELECT public.has_premium_pass(_user, _season) INTO _has_premium;
    IF NOT _has_premium THEN
      RETURN jsonb_build_object('ok', false, 'error', 'no_premium_pass');
    END IF;
  END IF;

  _required := _tier * 100;
  IF COALESCE(_xp, 0) < _required THEN
    RETURN jsonb_build_object('ok', false, 'error', 'locked', 'xp', COALESCE(_xp,0), 'required', _required);
  END IF;

  IF EXISTS(
    SELECT 1 FROM public.battle_pass_claims
    WHERE user_id = _user AND season_id = _season
      AND tier_index = _tier AND track = _track
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  -- Free: 50 + tier*10. Premium: 2x. Bonus tiers (>50): +50 flat extra.
  _reward := 50 + _tier * 10;
  IF _track = 'premium' THEN _reward := _reward * 2; END IF;
  IF _tier > 50 THEN _reward := _reward + 50; END IF;

  INSERT INTO public.battle_pass_claims(user_id, season_id, tier_index, reward_coins, track)
  VALUES (_user, _season, _tier, _reward, _track);

  UPDATE public.profiles
  SET master_coins = master_coins + _reward
  WHERE user_id = _user
  RETURNING master_coins INTO _new_balance;

  RETURN jsonb_build_object('ok', true, 'reward', _reward, 'new_balance', _new_balance,
                            'tier', _tier, 'track', _track);
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_premium_pass(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.buy_premium_pass() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_battle_pass_tier(integer, text) TO authenticated;
