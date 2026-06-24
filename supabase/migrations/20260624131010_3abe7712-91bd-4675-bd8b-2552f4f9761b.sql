
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS is_signature boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signature_series text;

CREATE INDEX IF NOT EXISTS idx_tournaments_signature_upcoming
  ON public.tournaments (starts_at)
  WHERE is_signature = true AND status IN ('upcoming','registering','active');

DO $$
DECLARE
  base_monday date := (date_trunc('week', now())::date);
  i int;
  d_mon timestamptz;
  d_fri timestamptz;
  d_sun timestamptz;
BEGIN
  FOR i IN 0..7 LOOP
    d_mon := ((base_monday + (i*7))::timestamp + time '19:00') AT TIME ZONE 'UTC';
    d_fri := ((base_monday + (i*7) + 4)::timestamp + time '20:00') AT TIME ZONE 'UTC';
    d_sun := ((base_monday + (i*7) + 6)::timestamp + time '16:00') AT TIME ZONE 'UTC';

    IF d_mon > now() THEN
      INSERT INTO public.tournaments (
        name, description, category, format, tournament_type,
        time_control_label, time_control_seconds, time_control_increment,
        max_players, total_rounds, current_round, status,
        starts_at, registration_deadline, arena_duration_minutes,
        is_rated, visibility, anti_cheat_level, is_signature, signature_series
      )
      SELECT
        'MasterChess Monday · ' || to_char(d_mon, 'Mon DD'),
        'The signature weekly blitz arena. Every Monday, the whole community plays at the same time.',
        'blitz','arena','arena','3+0', 180, 0,
        500, 1, 0, 'upcoming',
        d_mon, d_mon - interval '5 minutes', 90,
        true, 'public', 'strict', true, 'masterchess-monday'
      WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE signature_series='masterchess-monday' AND starts_at=d_mon);
    END IF;

    IF d_fri > now() THEN
      INSERT INTO public.tournaments (
        name, description, category, format, tournament_type,
        time_control_label, time_control_seconds, time_control_increment,
        max_players, total_rounds, current_round, status,
        starts_at, registration_deadline, arena_duration_minutes,
        is_rated, visibility, anti_cheat_level, is_signature, signature_series
      )
      SELECT
        'Friday Night Fire · ' || to_char(d_fri, 'Mon DD'),
        'Bullet chaos. 60 minutes of 1+0 madness. Top 3 get gold flair for a week.',
        'bullet','arena','arena','1+0', 60, 0,
        500, 1, 0, 'upcoming',
        d_fri, d_fri - interval '5 minutes', 60,
        true, 'public', 'strict', true, 'friday-night-fire'
      WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE signature_series='friday-night-fire' AND starts_at=d_fri);
    END IF;

    IF d_sun > now() THEN
      INSERT INTO public.tournaments (
        name, description, category, format, tournament_type,
        time_control_label, time_control_seconds, time_control_increment,
        max_players, total_rounds, current_round, status,
        starts_at, registration_deadline, arena_duration_minutes,
        is_rated, visibility, anti_cheat_level, is_signature, signature_series
      )
      SELECT
        'Sunday Classic · ' || to_char(d_sun, 'Mon DD'),
        'Rapid 10+0 arena. Deep games, big rating swings. Free entry.',
        'rapid','arena','arena','10+0', 600, 0,
        500, 1, 0, 'upcoming',
        d_sun, d_sun - interval '5 minutes', 120,
        true, 'public', 'strict', true, 'sunday-classic'
      WHERE NOT EXISTS (SELECT 1 FROM public.tournaments WHERE signature_series='sunday-classic' AND starts_at=d_sun);
    END IF;
  END LOOP;
END $$;
