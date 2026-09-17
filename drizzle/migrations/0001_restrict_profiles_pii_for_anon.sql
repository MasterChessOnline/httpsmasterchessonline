-- Hide personal data (real names, birth year, FIDE id, Discord identity) from anonymous visitors
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, user_id, username, display_name, avatar_url, avatar_frame, profile_banner, username_style,
  bio, country, country_flag, city, city_key, club, federation, fide_title, highest_title_key,
  rating, peak_rating, bot_rating, bot_peak_rating, skill_level, access_tier,
  games_played, games_won, games_lost, games_drawn,
  bot_games_played, bot_games_won, bot_games_lost, bot_games_drawn,
  win_streak, loss_streak, login_streak, login_streak_best, total_xp,
  followers_count, following_count, favorite_opening, favorite_openings,
  is_streamer, show_on_map, map_lat, map_lng, current_game_id,
  created_at, updated_at
) ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;