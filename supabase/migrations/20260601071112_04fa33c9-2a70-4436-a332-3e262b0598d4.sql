
-- Shop inventory
CREATE TABLE public.user_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_key text NOT NULL,
  item_type text NOT NULL,
  price_paid integer NOT NULL DEFAULT 0,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_inventory TO authenticated;
GRANT ALL ON public.user_inventory TO service_role;

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own inventory"
  ON public.user_inventory FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own inventory"
  ON public.user_inventory FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_inventory_user ON public.user_inventory(user_id);

-- Purchase RPC: deducts coins, unlocks item atomically
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
  p_item_key text,
  p_item_type text,
  p_price integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  bal integer;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_price IS NULL OR p_price < 0 OR p_price > 100000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_price');
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_inventory WHERE user_id = caller AND item_key = p_item_key) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_owned');
  END IF;
  PERFORM set_config('request.masterchess_internal', 'true', true);
  SELECT master_coins INTO bal FROM public.profiles WHERE user_id = caller FOR UPDATE;
  IF bal IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_profile');
  END IF;
  IF bal < p_price THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_coins', 'balance', bal, 'needed', p_price - bal);
  END IF;
  UPDATE public.profiles SET master_coins = master_coins - p_price, updated_at = now() WHERE user_id = caller;
  INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
    VALUES (caller, p_item_key, p_item_type, p_price);
  RETURN jsonb_build_object('ok', true, 'balance', bal - p_price);
END;
$$;

-- Coin reward for bot game
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
  total integer;
  new_bal integer;
BEGIN
  IF caller IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF p_result NOT IN ('win','loss','draw') THEN RETURN jsonb_build_object('ok', false, 'error', 'bad_result'); END IF;
  -- Tiered base by bot rating
  base := CASE
    WHEN p_bot_rating < 800 THEN 5
    WHEN p_bot_rating < 1100 THEN 10
    WHEN p_bot_rating < 1400 THEN 15
    WHEN p_bot_rating < 1700 THEN 25
    WHEN p_bot_rating < 2000 THEN 40
    WHEN p_bot_rating < 2400 THEN 60
    ELSE 100
  END;
  IF p_result = 'loss' THEN base := 2;
  ELSIF p_result = 'draw' THEN base := GREATEST(2, base / 2);
  END IF;
  IF p_result = 'win' THEN
    streak_bonus := CASE
      WHEN p_win_streak >= 10 THEN 100
      WHEN p_win_streak >= 5 THEN 50
      WHEN p_win_streak >= 3 THEN 20
      ELSE 0
    END;
  END IF;
  total := base + streak_bonus;
  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles SET master_coins = master_coins + total, updated_at = now()
    WHERE user_id = caller RETURNING master_coins INTO new_bal;
  RETURN jsonb_build_object('ok', true, 'base', base, 'streak_bonus', streak_bonus, 'total', total, 'balance', new_bal);
END;
$$;

-- Coin reward for online game (caller must be a player; finalize must already be done)
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
  diff integer;
  outcome text;
  base integer;
  streak_bonus integer := 0;
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
  -- Idempotency via user_inventory marker (item_type='_coin_award')
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

  diff := COALESCE(opp_rating, 1200) - COALESCE(my_rating, 1200);
  base := CASE
    WHEN diff <= -200 THEN 8
    WHEN diff <= -75 THEN 15
    WHEN diff < 75 THEN 25
    WHEN diff <= 200 THEN 40
    ELSE 75
  END;
  IF outcome = 'loss' THEN base := 3;
  ELSIF outcome = 'draw' THEN base := GREATEST(5, base / 2);
  END IF;
  IF outcome = 'win' THEN
    streak_bonus := CASE
      WHEN p_win_streak >= 10 THEN 100
      WHEN p_win_streak >= 5 THEN 50
      WHEN p_win_streak >= 3 THEN 20
      ELSE 0
    END;
  END IF;
  total := base + streak_bonus;

  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles SET master_coins = master_coins + total, updated_at = now()
    WHERE user_id = caller RETURNING master_coins INTO new_bal;
  INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
    VALUES (caller, 'coinaward:' || p_game_id::text, '_coin_award', -total);
  RETURN jsonb_build_object('ok', true, 'base', base, 'streak_bonus', streak_bonus, 'total', total,
                            'balance', new_bal, 'outcome', outcome, 'opp_rating', opp_rating, 'my_rating', my_rating);
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_shop_item(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_bot_game_coins(integer, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_online_game_coins(uuid, integer) TO authenticated;
