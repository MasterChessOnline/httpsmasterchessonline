
-- 1. game_messages INSERT must verify the user is a player in the referenced game
DROP POLICY IF EXISTS "Game players can insert messages" ON public.game_messages;
CREATE POLICY "Game players can insert messages"
  ON public.game_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.online_games og
      WHERE og.id = game_messages.game_id
        AND (og.white_player_id = auth.uid() OR og.black_player_id = auth.uid())
    )
  );

-- 2. online_games: remove client UPDATE policy. All writes go through SECURITY DEFINER RPCs
--    (commit_online_move, finalize_online_game, abort_online_game, etc.).
DROP POLICY IF EXISTS "Players can update their games" ON public.online_games;

-- 3. referrals: do not expose visitor_fingerprint and user_agent columns to clients.
REVOKE SELECT (visitor_fingerprint, user_agent) ON public.referrals FROM anon, authenticated;

-- 4. spectator_bets: restrict reads to the betting user only.
DROP POLICY IF EXISTS "Anyone can view bets" ON public.spectator_bets;
CREATE POLICY "Users can view their own bets"
  ON public.spectator_bets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. profiles: hide sensitive per-user economy/streak columns from client roles.
--    Public-safe columns remain readable; sensitive columns are reachable only
--    via the SECURITY DEFINER `get_my_profile` RPC (for the owner) or service_role.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, user_id, username, display_name, avatar_url, rating, peak_rating,
  bio, country, country_flag, city_key, games_played, games_won, games_lost,
  games_drawn, followers_count, following_count, highest_title_key,
  is_streamer, bot_rating, bot_peak_rating, bot_games_played, bot_games_won,
  bot_games_lost, bot_games_drawn, favorite_openings, avatar_frame,
  profile_banner, total_xp, current_game_id, created_at, updated_at
) ON public.profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;
