ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS arena_duration_minutes integer,
  ADD COLUMN IF NOT EXISTS berserk_allowed boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tournament_participants'
  ) THEN
    EXECUTE 'ALTER TABLE public.tournament_participants ADD COLUMN IF NOT EXISTS arena_score integer NOT NULL DEFAULT 0';
  END IF;
END $$;