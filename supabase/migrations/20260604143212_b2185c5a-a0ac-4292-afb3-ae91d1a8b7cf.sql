
CREATE TABLE public.battle_pass_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  season_id uuid NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  tier_index int NOT NULL,
  reward_coins int NOT NULL DEFAULT 0,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, season_id, tier_index)
);

GRANT SELECT ON public.battle_pass_claims TO authenticated;
GRANT ALL ON public.battle_pass_claims TO service_role;

ALTER TABLE public.battle_pass_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "view_own_bp_claims"
  ON public.battle_pass_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_bp_claims_user_season ON public.battle_pass_claims(user_id, season_id);

-- Progress function
CREATE OR REPLACE FUNCTION public.battle_pass_progress(_user uuid)
RETURNS TABLE(season_id uuid, season_name text, season_xp int, ends_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH s AS (
    SELECT id, name, starts_at, ends_at FROM public.seasons
    WHERE status = 'active'
    ORDER BY season_number DESC LIMIT 1
  ),
  bot AS (
    SELECT COUNT(*)::int c FROM public.bot_games bg, s
    WHERE bg.user_id = _user
      AND bg.created_at >= s.starts_at
      AND bg.result = 'win'
  ),
  onl AS (
    SELECT COUNT(*)::int c FROM public.online_games og, s
    WHERE og.created_at >= s.starts_at
      AND ((og.white_player_id = _user AND og.result = '1-0')
        OR (og.black_player_id = _user AND og.result = '0-1'))
  )
  SELECT s.id, s.name, ((bot.c + onl.c) * 25)::int AS xp, s.ends_at
  FROM s, bot, onl;
$$;

GRANT EXECUTE ON FUNCTION public.battle_pass_progress(uuid) TO authenticated;

-- Claim function
CREATE OR REPLACE FUNCTION public.claim_battle_pass_tier(_tier int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user uuid := auth.uid();
  _season uuid;
  _xp int;
  _required int;
  _reward int;
  _new_balance int;
BEGIN
  IF _user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF _tier < 1 OR _tier > 30 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_tier');
  END IF;

  SELECT bp.season_id, bp.season_xp INTO _season, _xp
  FROM public.battle_pass_progress(_user) bp;

  IF _season IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_active_season');
  END IF;

  _required := _tier * 100;
  IF COALESCE(_xp, 0) < _required THEN
    RETURN jsonb_build_object('ok', false, 'error', 'locked', 'xp', COALESCE(_xp,0), 'required', _required);
  END IF;

  IF EXISTS(
    SELECT 1 FROM public.battle_pass_claims
    WHERE user_id = _user AND season_id = _season AND tier_index = _tier
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  _reward := 50 + _tier * 10;

  INSERT INTO public.battle_pass_claims(user_id, season_id, tier_index, reward_coins)
  VALUES (_user, _season, _tier, _reward);

  UPDATE public.profiles
  SET master_coins = master_coins + _reward
  WHERE user_id = _user
  RETURNING master_coins INTO _new_balance;

  RETURN jsonb_build_object('ok', true, 'reward', _reward, 'new_balance', _new_balance, 'tier', _tier);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_battle_pass_tier(int) TO authenticated;
