
-- Add total XP tracker to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_xp integer NOT NULL DEFAULT 0;

-- Protect total_xp from client tampering (extend existing trigger)
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  NEW.rating := OLD.rating;
  NEW.peak_rating := OLD.peak_rating;
  NEW.bot_rating := OLD.bot_rating;
  NEW.bot_peak_rating := OLD.bot_peak_rating;
  NEW.master_coins := OLD.master_coins;
  NEW.games_played := OLD.games_played;
  NEW.games_won := OLD.games_won;
  NEW.games_lost := OLD.games_lost;
  NEW.games_drawn := OLD.games_drawn;
  NEW.bot_games_played := OLD.bot_games_played;
  NEW.bot_games_won := OLD.bot_games_won;
  NEW.bot_games_lost := OLD.bot_games_lost;
  NEW.bot_games_drawn := OLD.bot_games_drawn;
  NEW.followers_count := OLD.followers_count;
  NEW.following_count := OLD.following_count;
  NEW.highest_title_key := OLD.highest_title_key;
  NEW.is_streamer := OLD.is_streamer;
  NEW.user_id := OLD.user_id;
  NEW.login_streak := OLD.login_streak;
  NEW.login_streak_best := OLD.login_streak_best;
  NEW.last_login_reward_date := OLD.last_login_reward_date;
  NEW.total_xp := OLD.total_xp;
  RETURN NEW;
END;
$function$;

-- Seed XP-based achievements
INSERT INTO public.achievements (key, name, description, icon, category, requirement_type, requirement_value, reward_type, reward_value) VALUES
  ('xp_100',    'Rising Talent',    'Earn 100 XP from daily missions.',     'sparkles', 'progression', 'total_xp', 100,   'coins', '50'),
  ('xp_500',    'Daily Grinder',    'Earn 500 XP from daily missions.',     'flame',    'progression', 'total_xp', 500,   'coins', '150'),
  ('xp_1000',   'XP Hunter',        'Earn 1,000 XP from daily missions.',   'target',   'progression', 'total_xp', 1000,  'coins', '300'),
  ('xp_2500',   'Mission Veteran',  'Earn 2,500 XP from daily missions.',   'trophy',   'progression', 'total_xp', 2500,  'coins', '600'),
  ('xp_5000',   'Mission Master',   'Earn 5,000 XP from daily missions.',   'crown',    'progression', 'total_xp', 5000,  'coins', '1200'),
  ('xp_10000',  'XP Legend',        'Earn 10,000 XP from daily missions.',  'star',     'progression', 'total_xp', 10000, 'coins', '2500')
ON CONFLICT (key) DO NOTHING;

-- Mirror as badges so they show on the profile badge grid
INSERT INTO public.badges_catalog (key, name, description, icon, category, tier, requirement_type, requirement_value) VALUES
  ('xp_100',   'Rising Talent',    '100 XP earned',     'sparkles', 'progression', 'bronze',   'total_xp', 100),
  ('xp_500',   'Daily Grinder',    '500 XP earned',     'flame',    'progression', 'bronze',   'total_xp', 500),
  ('xp_1000',  'XP Hunter',        '1,000 XP earned',   'target',   'progression', 'silver',   'total_xp', 1000),
  ('xp_2500',  'Mission Veteran',  '2,500 XP earned',   'trophy',   'progression', 'silver',   'total_xp', 2500),
  ('xp_5000',  'Mission Master',   '5,000 XP earned',   'crown',    'progression', 'gold',     'total_xp', 5000),
  ('xp_10000', 'XP Legend',        '10,000 XP earned',  'star',     'progression', 'platinum', 'total_xp', 10000)
ON CONFLICT (key) DO NOTHING;

-- Atomic claim RPC: marks claimed, awards XP, evaluates XP achievements
CREATE OR REPLACE FUNCTION public.claim_daily_mission(p_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  caller uuid := auth.uid();
  today date := (now() AT TIME ZONE 'UTC')::date;
  v_progress record;
  v_xp integer;
  v_new_total integer;
  v_awarded_badges text[] := ARRAY[]::text[];
  b record;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Confirm mission is in today's rotation
  IF NOT EXISTS (
    SELECT 1 FROM public.get_today_missions(today) m WHERE m.key = p_key
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_in_rotation');
  END IF;

  SELECT m.xp_reward INTO v_xp
  FROM public.get_today_missions(today) m WHERE m.key = p_key;

  SELECT * INTO v_progress
  FROM public.user_mission_progress
  WHERE user_id = caller AND mission_key = p_key AND mission_date = today
  FOR UPDATE;

  IF NOT FOUND OR NOT v_progress.completed THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_completed');
  END IF;

  IF v_progress.claimed THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  UPDATE public.user_mission_progress
     SET claimed = true, claimed_at = now()
   WHERE id = v_progress.id;

  UPDATE public.profiles
     SET total_xp = total_xp + v_xp,
         updated_at = now()
   WHERE user_id = caller
  RETURNING total_xp INTO v_new_total;

  -- Award any XP threshold badges the user has just crossed
  FOR b IN
    SELECT bc.key
      FROM public.badges_catalog bc
     WHERE bc.requirement_type = 'total_xp'
       AND bc.requirement_value <= v_new_total
       AND NOT EXISTS (
         SELECT 1 FROM public.player_badges pb
          WHERE pb.user_id = caller AND pb.badge_key = bc.key
       )
  LOOP
    INSERT INTO public.player_badges (user_id, badge_key, context)
    VALUES (caller, b.key, jsonb_build_object('source', 'daily_missions', 'total_xp', v_new_total));
    v_awarded_badges := array_append(v_awarded_badges, b.key);
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'xp_awarded', v_xp,
    'total_xp', v_new_total,
    'new_badges', to_jsonb(v_awarded_badges)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_daily_mission(text) TO authenticated;
