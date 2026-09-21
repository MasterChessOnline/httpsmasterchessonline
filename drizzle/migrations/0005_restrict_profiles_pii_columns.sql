REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (
  id, user_id, username, display_name, avatar_url, rating, games_played,
  games_won, games_lost, games_drawn, created_at, updated_at,
  favorite_openings, bio, followers_count, following_count, bot_rating,
  bot_games_played, bot_games_won, bot_games_lost, bot_games_drawn,
  country, country_flag, peak_rating, bot_peak_rating, highest_title_key,
  city_key, master_coins, is_streamer, login_streak, login_streak_best,
  last_login_reward_date, avatar_frame, profile_banner,
  push_notifications_enabled, total_xp, current_game_id, loss_streak,
  win_streak, welcome_day, welcome_last_claim, onboarding_completed,
  skill_level, favorite_opening, username_style, coach_pro_until,
  unlocked_courses, access_tier, discord_user_id, discord_username,
  discord_avatar, discord_linked_at, show_on_map, city, club
) ON public.profiles TO authenticated;

GRANT SELECT (
  id, user_id, username, display_name, avatar_url, rating, games_played,
  games_won, games_lost, games_drawn, created_at, updated_at,
  favorite_openings, bio, followers_count, following_count, bot_rating,
  bot_games_played, bot_games_won, bot_games_lost, bot_games_drawn,
  country, country_flag, peak_rating, bot_peak_rating, highest_title_key,
  city_key, is_streamer, avatar_frame, profile_banner, total_xp,
  skill_level, username_style, access_tier, show_on_map, city, club
) ON public.profiles TO anon;

GRANT ALL ON public.profiles TO service_role;

DROP FUNCTION IF EXISTS public.get_my_private_profile();

CREATE FUNCTION public.get_my_private_profile()
RETURNS TABLE(
  first_name text, last_name text, birth_year integer,
  map_lat numeric, map_lng numeric,
  fide_id text, fide_title text, federation text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT first_name, last_name, birth_year, map_lat, map_lng,
         fide_id, fide_title, federation
  FROM public.profiles WHERE user_id = auth.uid();
$function$;

REVOKE ALL ON FUNCTION public.get_my_private_profile() FROM public;
GRANT EXECUTE ON FUNCTION public.get_my_private_profile() TO authenticated;
