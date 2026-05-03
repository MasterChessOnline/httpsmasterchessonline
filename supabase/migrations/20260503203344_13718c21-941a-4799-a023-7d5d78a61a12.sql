
-- 1. profiles: prevent users from modifying protected columns
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_columns_trg ON public.profiles;
CREATE TRIGGER protect_profile_columns_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- 2. online_games: prevent players from modifying result/status/elo_applied directly
CREATE OR REPLACE FUNCTION public.protect_online_game_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  NEW.result := OLD.result;
  NEW.status := OLD.status;
  NEW.elo_applied := OLD.elo_applied;
  NEW.end_reason := OLD.end_reason;
  NEW.is_rated := OLD.is_rated;
  NEW.white_player_id := OLD.white_player_id;
  NEW.black_player_id := OLD.black_player_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_online_game_columns_trg ON public.online_games;
CREATE TRIGGER protect_online_game_columns_trg
BEFORE UPDATE ON public.online_games
FOR EACH ROW EXECUTE FUNCTION public.protect_online_game_columns();

-- 3. player_badges: remove self-award INSERT, restrict to service_role
DROP POLICY IF EXISTS "Users can earn own badges" ON public.player_badges;
CREATE POLICY "Service role inserts badges"
ON public.player_badges
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 4. tournament_streaks: scope UPDATE to owner
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tournament_streaks') THEN
    EXECUTE 'DROP POLICY IF EXISTS "System can update streaks" ON public.tournament_streaks';
    EXECUTE 'CREATE POLICY "Users update own streaks" ON public.tournament_streaks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

-- 5. user_collectibles: restrict INSERT to service_role
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_collectibles') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Users can insert own collectibles" ON public.user_collectibles';
    EXECUTE 'CREATE POLICY "Service role inserts collectibles" ON public.user_collectibles FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END $$;

-- 6. stream_donations: restrict public INSERT
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='stream_donations') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert donations" ON public.stream_donations';
    EXECUTE 'DROP POLICY IF EXISTS "Public can insert donations" ON public.stream_donations';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can create donations" ON public.stream_donations';
    EXECUTE 'CREATE POLICY "Service role inserts donations" ON public.stream_donations FOR INSERT WITH CHECK (auth.role() = ''service_role'')';
  END IF;
END $$;
