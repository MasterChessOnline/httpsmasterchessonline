-- Prime Time RSVP: real "I'll be there tonight" signals so the 20:00 hour is never empty.
CREATE TABLE IF NOT EXISTS public.prime_time_rsvp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  play_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, play_date)
);

GRANT SELECT, INSERT, DELETE ON public.prime_time_rsvp TO authenticated;
GRANT ALL ON public.prime_time_rsvp TO service_role;
ALTER TABLE public.prime_time_rsvp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own RSVP"
  ON public.prime_time_rsvp FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Opponent alerts: opt-in to be pinged when a real player is waiting in the queue.
CREATE TABLE IF NOT EXISTS public.opponent_alert_optins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  last_alerted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.opponent_alert_optins TO authenticated;
GRANT ALL ON public.opponent_alert_optins TO service_role;
ALTER TABLE public.opponent_alert_optins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own opponent alert opt-in"
  ON public.opponent_alert_optins FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Public, aggregate-only RSVP count for tonight (no identities exposed).
CREATE OR REPLACE FUNCTION public.prime_time_rsvp_count(_day date DEFAULT (now() AT TIME ZONE 'utc')::date)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.prime_time_rsvp WHERE play_date = _day;
$$;

GRANT EXECUTE ON FUNCTION public.prime_time_rsvp_count(date) TO anon, authenticated;

-- Public transparency stats: honest, real numbers for the /open page.
CREATE OR REPLACE FUNCTION public.get_open_stats()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'players_total', (SELECT count(*) FROM public.profiles),
    'players_30d', (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '30 days'),
    'online_games_total', (SELECT count(*) FROM public.online_games),
    'online_games_30d', (SELECT count(*) FROM public.online_games WHERE created_at > now() - interval '30 days'),
    'bot_games_30d', (SELECT count(*) FROM public.bot_games WHERE created_at > now() - interval '30 days'),
    'live_games_now', (SELECT count(*) FROM public.online_games WHERE status = 'active' AND created_at > now() - interval '15 minutes'),
    'rsvp_today', (SELECT count(*) FROM public.prime_time_rsvp WHERE play_date = (now() AT TIME ZONE 'utc')::date)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_open_stats() TO anon, authenticated;