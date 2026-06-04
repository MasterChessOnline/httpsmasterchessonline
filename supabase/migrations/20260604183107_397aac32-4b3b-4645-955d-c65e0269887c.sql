
REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id, user_id, username, display_name, avatar_url, rating, peak_rating, bio,
  country, country_flag, city_key, games_played, games_won, games_lost,
  games_drawn, followers_count, following_count, highest_title_key,
  is_streamer, bot_rating, bot_peak_rating, bot_games_played, bot_games_won,
  bot_games_lost, bot_games_drawn, favorite_openings, avatar_frame,
  profile_banner, total_xp, created_at, updated_at
) ON public.profiles TO anon, authenticated;

GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

DROP POLICY IF EXISTS "No client writes to clan_quests" ON public.clan_quests;
CREATE POLICY "No client writes to clan_quests"
  ON public.clan_quests
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Authenticated users can insert eval cache" ON public.stockfish_eval_cache;
CREATE POLICY "Validated eval cache inserts"
  ON public.stockfish_eval_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (
    engine = 'stockfish-18-lite-single'
    AND depth BETWEEN 1 AND 64
    AND fen IS NOT NULL
    AND length(fen) BETWEEN 20 AND 120
    AND fen ~ '^[1-8pnbrqkPNBRQK/]+ [wb] [-KQkqA-Ha-h]+ [-a-h0-9]+ [0-9]+ [0-9]+$'
    AND evaluation BETWEEN -100000 AND 100000
    AND (mate IS NULL OR mate BETWEEN -200 AND 200)
  );
