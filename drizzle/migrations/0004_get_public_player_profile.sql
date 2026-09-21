CREATE OR REPLACE FUNCTION public.get_public_player_profile(p_username text)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  username text,
  avatar_url text,
  rating integer,
  peak_rating integer,
  games_played integer,
  games_won integer,
  games_lost integer,
  games_drawn integer,
  bio text,
  country text,
  country_flag text,
  created_at timestamptz,
  profile_banner text,
  master_coins integer,
  total_xp integer,
  skill_level text,
  fide_title text,
  highest_title_key text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    p.rating,
    p.peak_rating,
    p.games_played,
    p.games_won,
    p.games_lost,
    p.games_drawn,
    p.bio,
    p.country,
    p.country_flag,
    p.created_at,
    p.profile_banner,
    p.master_coins,
    p.total_xp,
    p.skill_level,
    p.fide_title,
    p.highest_title_key
  FROM public.profiles AS p
  WHERE lower(p.username) = lower(p_username)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_player_profile(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_player_profile(text) TO anon, authenticated, service_role;