
-- Fix: profiles — restrict sensitive columns via column-level GRANTs.
-- Owners read full row through the get_my_profile() SECURITY DEFINER RPC.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, user_id, username, display_name, avatar_url,
  rating, peak_rating, bot_rating, bot_peak_rating,
  games_played, games_won, games_lost, games_drawn,
  bot_games_played, bot_games_won, bot_games_lost, bot_games_drawn,
  bio, favorite_openings, country, country_flag, city_key,
  followers_count, following_count, highest_title_key,
  is_streamer, avatar_frame, profile_banner, total_xp,
  created_at, updated_at
) ON public.profiles TO anon, authenticated;

-- Fix: win_streaks — owner-only SELECT
DROP POLICY IF EXISTS "Anyone can view streaks" ON public.win_streaks;
CREATE POLICY "Users view own streaks" ON public.win_streaks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix: puzzle_solves — owner-only SELECT
DROP POLICY IF EXISTS "Anyone can view puzzle solves" ON public.puzzle_solves;
CREATE POLICY "Users view own puzzle solves" ON public.puzzle_solves
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix: user_daily_streaks — owner-only SELECT
DROP POLICY IF EXISTS "Anyone can view daily streaks" ON public.user_daily_streaks;
CREATE POLICY "Users view own daily streak" ON public.user_daily_streaks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Fix: referrals — drop direct SELECT; clients use my_referral_stats() RPC
-- which returns only aggregate counts (no fingerprint / user_agent).
DROP POLICY IF EXISTS "Referrers can view their referrals" ON public.referrals;
