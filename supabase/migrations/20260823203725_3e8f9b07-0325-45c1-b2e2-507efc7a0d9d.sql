CREATE TABLE public.client_errors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default 'error',
  message text not null,
  stack text,
  route text,
  release text,
  user_agent text,
  session_id text,
  user_id uuid
);
GRANT INSERT ON public.client_errors TO anon, authenticated;
GRANT SELECT ON public.client_errors TO authenticated;
GRANT ALL ON public.client_errors TO service_role;
ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can report errors" ON public.client_errors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read errors" ON public.client_errors FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX client_errors_created_idx ON public.client_errors (created_at DESC);

CREATE TABLE public.web_vitals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  metric text not null,
  value double precision not null,
  route text,
  device text,
  session_id text
);
GRANT INSERT ON public.web_vitals TO anon, authenticated;
GRANT SELECT ON public.web_vitals TO authenticated;
GRANT ALL ON public.web_vitals TO service_role;
ALTER TABLE public.web_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can report vitals" ON public.web_vitals FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read vitals" ON public.web_vitals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX web_vitals_created_idx ON public.web_vitals (created_at DESC);

CREATE TABLE public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  session_id text,
  user_id uuid,
  route text,
  source text,
  props jsonb not null default '{}'::jsonb
);
GRANT INSERT ON public.funnel_events TO anon, authenticated;
GRANT SELECT ON public.funnel_events TO authenticated;
GRANT ALL ON public.funnel_events TO service_role;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can report funnel steps" ON public.funnel_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins read funnel" ON public.funnel_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE INDEX funnel_events_created_idx ON public.funnel_events (created_at DESC);
CREATE INDEX funnel_events_event_idx ON public.funnel_events (event, created_at DESC);

CREATE TABLE public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  rollout smallint not null default 100 check (rollout between 0 and 100),
  description text,
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.feature_flags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flags are public" ON public.feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage flags" ON public.feature_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.feature_flags (key, enabled, rollout, description) VALUES
  ('bot_fallback', true, 100, 'Offer a clearly labelled bot when matchmaking finds nobody'),
  ('prime_time_banner', true, 100, 'Daily 20:00 prime-time RSVP banner'),
  ('battle_pass', true, 100, 'Battle Pass progression'),
  ('clans', true, 100, 'Clan system'),
  ('chess_dna', false, 100, 'Experimental Chess DNA page'),
  ('roast', false, 100, 'Experimental AI roast page'),
  ('chess_map', false, 100, 'Experimental world chess map'),
  ('heavy_home_effects', true, 50, 'Cinematic homepage effects on capable devices')
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_funnel_summary(_days integer DEFAULT 7)
RETURNS TABLE(event text, sessions bigint, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.event, count(DISTINCT f.session_id)::bigint, count(*)::bigint
  FROM public.funnel_events f
  WHERE f.created_at > now() - make_interval(days => greatest(_days, 1))
  GROUP BY f.event
  ORDER BY 3 DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_funnel_summary(integer) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_vitals_summary(_days integer DEFAULT 7)
RETURNS TABLE(metric text, samples bigint, p50 double precision, p75 double precision)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.metric,
         count(*)::bigint,
         percentile_cont(0.5) WITHIN GROUP (ORDER BY v.value),
         percentile_cont(0.75) WITHIN GROUP (ORDER BY v.value)
  FROM public.web_vitals v
  WHERE v.created_at > now() - make_interval(days => greatest(_days, 1))
  GROUP BY v.metric
  ORDER BY 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_vitals_summary(integer) TO authenticated, service_role;