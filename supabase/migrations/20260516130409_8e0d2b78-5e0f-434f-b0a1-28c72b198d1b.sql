-- Daily login streak + rewards
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS login_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS login_streak_best integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_reward_date date;

-- Protect new columns from client tampering via the existing protect trigger
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
  RETURN NEW;
END;
$function$;

-- RPC: claim daily reward; returns reward + new streak
CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  -- Reward curve: 10 coins base, +5 per streak day, cap at 100; XP = streak * 10
  reward_coins := LEAST(10 + (new_streak - 1) * 5, 100);
  reward_xp := new_streak * 10;

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
$$;

-- ============================================================
-- LOBBY CHAT (global realtime chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lobby_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 280),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lobby_messages_created_at
  ON public.lobby_messages (created_at DESC);

ALTER TABLE public.lobby_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lobby messages readable by everyone"
  ON public.lobby_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post lobby messages"
  ON public.lobby_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lobby messages"
  ON public.lobby_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_messages;
ALTER TABLE public.lobby_messages REPLICA IDENTITY FULL;

-- ============================================================
-- TOURNAMENT CHAT (per-tournament realtime)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 280),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tournament_messages_lookup
  ON public.tournament_messages (tournament_id, created_at DESC);

ALTER TABLE public.tournament_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournament messages readable by everyone"
  ON public.tournament_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post tournament messages"
  ON public.tournament_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tournament messages"
  ON public.tournament_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_messages;
ALTER TABLE public.tournament_messages REPLICA IDENTITY FULL;