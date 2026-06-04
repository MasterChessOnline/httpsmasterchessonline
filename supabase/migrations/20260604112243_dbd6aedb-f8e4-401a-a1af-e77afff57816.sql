
-- ============================================================================
-- ECONOMY UPGRADE: rating multiplier, anti-tilt comeback, anti-farm cooldown,
-- loss consolation bump, paid spin RPC, referral first-game bonus.
-- ============================================================================

-- 1. Track loss streak on profile (for anti-tilt comeback bonus).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loss_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS win_streak  integer NOT NULL DEFAULT 0;

-- Allow internal RPCs to write these new columns (protect trigger already
-- blocks direct profile UPDATEs; we update them inside SECURITY DEFINER fns
-- after set_config request.masterchess_internal = true). No protect changes
-- needed for the two new columns because they aren't enumerated in
-- protect_profile_columns (NEW.<col> := OLD.<col>) — they pass through.

-- 2. Rebalanced AWARD vs BOT — adds rating multiplier, anti-farm, anti-tilt,
--    higher loss consolation, and updates streak counters.
CREATE OR REPLACE FUNCTION public.award_bot_game_coins(
  p_bot_rating integer,
  p_result text,
  p_win_streak integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  base integer := 0;
  multiplier numeric := 1.0;
  combo_pct numeric := 0;
  streak_bonus integer := 0;
  first_win_bonus integer := 0;
  comeback_bonus integer := 0;
  total integer;
  my_rating integer;
  new_bal integer;
  cooldown_key text;
  cooldown_count integer := 0;
  loss_streak_now integer := 0;
  win_streak_now integer := 0;
BEGIN
  IF caller IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  IF p_result NOT IN ('win','loss','draw') THEN RETURN jsonb_build_object('ok', false, 'error', 'bad_result'); END IF;

  SELECT rating, loss_streak, win_streak
    INTO my_rating, loss_streak_now, win_streak_now
    FROM public.profiles WHERE user_id = caller;

  -- Anti-farm cooldown: count wins vs this bot tier in the last hour.
  IF p_result = 'win' THEN
    cooldown_key := 'botcd:' || (FLOOR(p_bot_rating/200)*200)::text || ':' || to_char(date_trunc('hour', now()), 'YYYYMMDDHH24');
    SELECT COUNT(*) INTO cooldown_count
      FROM public.user_inventory
      WHERE user_id = caller AND item_key = cooldown_key;
  END IF;

  -- Win vs bot: 50..150 base by difficulty
  base := CASE
    WHEN p_bot_rating < 1000 THEN 50
    WHEN p_bot_rating < 1400 THEN 75
    WHEN p_bot_rating < 1800 THEN 100
    WHEN p_bot_rating < 2200 THEN 125
    ELSE 150
  END;

  IF p_result = 'loss' THEN
    -- Anti-frustration consolation 10..30 by bot difficulty
    base := CASE
      WHEN p_bot_rating < 1400 THEN 10
      WHEN p_bot_rating < 1800 THEN 20
      ELSE 30
    END;
  ELSIF p_result = 'draw' THEN
    base := GREATEST(25, base / 2);
  END IF;

  -- Rating-tier multiplier (player's own strength)
  multiplier := CASE
    WHEN COALESCE(my_rating, 1200) < 1200 THEN 1.0
    WHEN COALESCE(my_rating, 1200) < 1600 THEN 1.2
    WHEN COALESCE(my_rating, 1200) < 2000 THEN 1.5
    ELSE 2.0
  END;

  IF p_result = 'win' THEN
    -- Streak combo % (use the higher of server-tracked win_streak and client-provided)
    combo_pct := CASE
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 10 THEN 1.0
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 5  THEN 0.5
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 3  THEN 0.2
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 2  THEN 0.1
      ELSE 0
    END;
    -- Anti-farm: 4th+ win vs same tier within the hour pays only 25%
    IF cooldown_count >= 3 THEN
      multiplier := multiplier * 0.25;
    END IF;
    streak_bonus := FLOOR(base * combo_pct)::int;
    IF public._mc_claim_first_win_today(caller) THEN
      first_win_bonus := 100;
    END IF;
  ELSIF p_result = 'loss' THEN
    -- Anti-tilt comeback bonus after 3+ consecutive losses (this loss makes it >=3)
    IF loss_streak_now + 1 >= 3 THEN
      comeback_bonus := 50;
    END IF;
  END IF;

  total := GREATEST(0, FLOOR(base * multiplier)::int + streak_bonus + first_win_bonus + comeback_bonus);

  PERFORM set_config('request.masterchess_internal', 'true', true);

  -- Record cooldown marker on wins
  IF p_result = 'win' THEN
    BEGIN
      INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
      VALUES (caller, cooldown_key || ':' || gen_random_uuid()::text, '_bot_cooldown', 0);
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  -- Update streak counters + balance
  UPDATE public.profiles
    SET master_coins = master_coins + total,
        win_streak  = CASE WHEN p_result = 'win'  THEN win_streak  + 1 ELSE 0 END,
        loss_streak = CASE WHEN p_result = 'loss' THEN loss_streak + 1 ELSE 0 END,
        updated_at = now()
    WHERE user_id = caller
    RETURNING master_coins INTO new_bal;

  RETURN jsonb_build_object(
    'ok', true, 'base', base, 'multiplier', multiplier,
    'streak_bonus', streak_bonus, 'first_win_bonus', first_win_bonus,
    'comeback_bonus', comeback_bonus, 'total', total, 'balance', new_bal,
    'anti_farm', cooldown_count >= 3
  );
END;
$$;

-- 3. Rebalanced AWARD vs ONLINE — same multiplier/anti-tilt logic.
CREATE OR REPLACE FUNCTION public.award_online_game_coins(
  p_game_id uuid,
  p_win_streak integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  g record;
  my_rating integer;
  opp_rating integer;
  rating_diff integer;
  outcome text;
  base integer;
  multiplier numeric := 1.0;
  combo_pct numeric := 0;
  streak_bonus integer := 0;
  first_win_bonus integer := 0;
  comeback_bonus integer := 0;
  total integer;
  new_bal integer;
  already boolean;
  loss_streak_now integer := 0;
  win_streak_now integer := 0;
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
    SELECT rating, loss_streak, win_streak INTO my_rating, loss_streak_now, win_streak_now FROM public.profiles WHERE user_id = g.white_player_id;
    SELECT rating INTO opp_rating FROM public.profiles WHERE user_id = g.black_player_id;
  ELSE
    outcome := CASE g.result WHEN '0-1' THEN 'win' WHEN '1-0' THEN 'loss' ELSE 'draw' END;
    SELECT rating, loss_streak, win_streak INTO my_rating, loss_streak_now, win_streak_now FROM public.profiles WHERE user_id = g.black_player_id;
    SELECT rating INTO opp_rating FROM public.profiles WHERE user_id = g.white_player_id;
  END IF;

  rating_diff := COALESCE(opp_rating, 1200) - COALESCE(my_rating, 1200);

  -- Win vs player: 100..300 base, scaled by opponent strength relative to mine
  base := CASE
    WHEN rating_diff >= 300  THEN 300
    WHEN rating_diff >= 150  THEN 220
    WHEN rating_diff >= 0    THEN 160
    WHEN rating_diff >= -150 THEN 130
    ELSE                          100
  END;

  IF outcome = 'loss' THEN
    base := CASE
      WHEN rating_diff >= 150 THEN 30      -- losing to much stronger: bigger consolation
      WHEN rating_diff >= 0   THEN 20
      ELSE                         10
    END;
  ELSIF outcome = 'draw' THEN
    base := GREATEST(50, base / 2);
  END IF;

  multiplier := CASE
    WHEN COALESCE(my_rating, 1200) < 1200 THEN 1.0
    WHEN COALESCE(my_rating, 1200) < 1600 THEN 1.2
    WHEN COALESCE(my_rating, 1200) < 2000 THEN 1.5
    ELSE 2.0
  END;

  IF outcome = 'win' THEN
    combo_pct := CASE
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 10 THEN 1.0
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 5  THEN 0.5
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 3  THEN 0.2
      WHEN GREATEST(p_win_streak, win_streak_now + 1) >= 2  THEN 0.1
      ELSE 0
    END;
    streak_bonus := FLOOR(base * combo_pct)::int;
    IF public._mc_claim_first_win_today(caller) THEN
      first_win_bonus := 100;
    END IF;
  ELSIF outcome = 'loss' THEN
    IF loss_streak_now + 1 >= 3 THEN
      comeback_bonus := 50;
    END IF;
  END IF;

  total := GREATEST(0, FLOOR(base * multiplier)::int + streak_bonus + first_win_bonus + comeback_bonus);

  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.profiles
    SET master_coins = master_coins + total,
        win_streak  = CASE WHEN outcome = 'win'  THEN win_streak  + 1 ELSE 0 END,
        loss_streak = CASE WHEN outcome = 'loss' THEN loss_streak + 1 ELSE 0 END,
        updated_at = now()
    WHERE user_id = caller
    RETURNING master_coins INTO new_bal;
  INSERT INTO public.user_inventory (user_id, item_key, item_type, price_paid)
    VALUES (caller, 'coinaward:' || p_game_id::text, '_coin_award', -total);
  RETURN jsonb_build_object('ok', true, 'base', base, 'multiplier', multiplier,
    'streak_bonus', streak_bonus, 'first_win_bonus', first_win_bonus,
    'comeback_bonus', comeback_bonus, 'total', total,
    'balance', new_bal, 'outcome', outcome, 'opp_rating', opp_rating, 'my_rating', my_rating);
END;
$$;

-- 4. Paid spin (100 coins). Server-side RNG, identical reward table to daily spin.
CREATE OR REPLACE FUNCTION public.spin_wheel_paid()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  cost integer := 100;
  bal integer;
  roll integer;
  coins integer;
  new_bal integer;
BEGIN
  IF caller IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  PERFORM set_config('request.masterchess_internal', 'true', true);
  SELECT master_coins INTO bal FROM public.profiles WHERE user_id = caller FOR UPDATE;
  IF bal IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'no_profile'); END IF;
  IF bal < cost THEN RETURN jsonb_build_object('ok', false, 'error', 'insufficient_coins', 'balance', bal, 'needed', cost - bal); END IF;

  roll := 1 + floor(random() * 100)::int;
  coins := CASE
    WHEN roll <= 35 THEN 25
    WHEN roll <= 60 THEN 50
    WHEN roll <= 78 THEN 100
    WHEN roll <= 90 THEN 250
    WHEN roll <= 96 THEN 500
    WHEN roll <= 99 THEN 1000
    ELSE                 2500
  END;

  UPDATE public.profiles
    SET master_coins = master_coins - cost + coins, updated_at = now()
    WHERE user_id = caller
    RETURNING master_coins INTO new_bal;

  RETURN jsonb_build_object('ok', true, 'cost', cost, 'coins', coins, 'new_balance', new_bal);
END;
$$;
GRANT EXECUTE ON FUNCTION public.spin_wheel_paid() TO authenticated;

-- 5. Referral bonuses. On signup conversion: +300 to BOTH users.
--    After referred user plays their 3rd game: +200 to referrer.
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS signup_bonus_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_game_bonus_paid boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.claim_referral_signup(p_ref_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_referrer uuid;
  v_existing public.referrals%ROWTYPE;
BEGIN
  IF v_uid IS NULL OR p_ref_code IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  v_referrer := public.resolve_ref_code(p_ref_code);
  IF v_referrer IS NULL OR v_referrer = v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_referrer');
  END IF;
  SELECT * INTO v_existing FROM public.referrals WHERE referred_user_id = v_uid LIMIT 1;
  IF FOUND AND v_existing.signup_bonus_paid THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  PERFORM set_config('request.masterchess_internal', 'true', true);

  IF NOT FOUND THEN
    INSERT INTO public.referrals (ref_code, referrer_user_id, referred_user_id, status, converted_at, signup_bonus_paid)
    VALUES (LOWER(p_ref_code), v_referrer, v_uid, 'signed_up', now(), true);
  ELSE
    UPDATE public.referrals
      SET signup_bonus_paid = true, status = 'signed_up', converted_at = now()
      WHERE id = v_existing.id;
  END IF;

  UPDATE public.profiles SET master_coins = master_coins + 300, updated_at = now()
    WHERE user_id IN (v_uid, v_referrer);

  RETURN jsonb_build_object('ok', true, 'bonus_each', 300);
END;
$$;

-- Called from client after a game finishes; pays +200 to referrer once the
-- referred user has at least 3 completed games (bot or online).
CREATE OR REPLACE FUNCTION public.claim_referral_first_games()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ref record;
  v_games integer;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;
  SELECT * INTO v_ref FROM public.referrals WHERE referred_user_id = v_uid LIMIT 1;
  IF NOT FOUND OR v_ref.first_game_bonus_paid THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  SELECT COALESCE(games_played, 0) + COALESCE(bot_games_played, 0) INTO v_games
    FROM public.profiles WHERE user_id = v_uid;
  IF v_games < 3 THEN
    RETURN jsonb_build_object('ok', true, 'pending', true, 'games', v_games);
  END IF;

  PERFORM set_config('request.masterchess_internal', 'true', true);
  UPDATE public.referrals
    SET first_game_bonus_paid = true, status = 'first_game'
    WHERE id = v_ref.id;
  UPDATE public.profiles
    SET master_coins = master_coins + 200, updated_at = now()
    WHERE user_id = v_ref.referrer_user_id;

  RETURN jsonb_build_object('ok', true, 'referrer_bonus', 200);
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_referral_first_games() TO authenticated;
