
-- Public, read-only RPCs for the "Beat Nikola" page.
-- bot_games rows stay private (RLS still blocks raw SELECT); these functions
-- expose only aggregated, public-safe data via SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.get_beat_nikola_stats()
RETURNS TABLE(attempts bigint, wins bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*) FILTER (WHERE bot_key = 'nikola-sakotic') AS attempts,
    count(*) FILTER (WHERE bot_key = 'nikola-sakotic' AND outcome = 'win') AS wins
  FROM public.bot_games;
$$;

CREATE OR REPLACE FUNCTION public.get_beat_nikola_leaderboard(_limit int DEFAULT 50)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  avatar_url text,
  rating int,
  move_count int,
  time_control_label text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    g.user_id,
    coalesce(p.display_name, 'Player') AS display_name,
    p.avatar_url,
    p.rating,
    g.move_count,
    g.time_control_label,
    g.created_at
  FROM public.bot_games g
  LEFT JOIN public.profiles p ON p.user_id = g.user_id
  WHERE g.bot_key = 'nikola-sakotic'
    AND g.outcome = 'win'
  ORDER BY g.created_at DESC
  LIMIT least(coalesce(_limit, 50), 200);
$$;

GRANT EXECUTE ON FUNCTION public.get_beat_nikola_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_beat_nikola_leaderboard(int) TO anon, authenticated;
