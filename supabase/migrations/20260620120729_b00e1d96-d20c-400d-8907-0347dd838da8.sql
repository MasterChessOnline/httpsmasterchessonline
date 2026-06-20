
-- 1) Bonus columns
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS fast_win_bonus numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS no_mistake_bonus numeric NOT NULL DEFAULT 0;

-- 2) Relax tournament_type whitelist to allow knockout & koth & puzzle
CREATE OR REPLACE FUNCTION public.validate_tournament_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.starts_at <= now() THEN
      RAISE EXCEPTION 'Tournament start time must be in the future';
    END IF;
    IF NEW.tournament_type NOT IN ('arena','swiss','round_robin','knockout','koth','puzzle') THEN
      RAISE EXCEPTION 'Invalid tournament_type';
    END IF;
    IF NEW.visibility NOT IN ('public','private') THEN
      RAISE EXCEPTION 'Invalid visibility';
    END IF;
    IF NEW.anti_cheat_level NOT IN ('basic','strict') THEN
      RAISE EXCEPTION 'Invalid anti_cheat_level';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.start_time_locked = true
       AND NEW.starts_at IS DISTINCT FROM OLD.starts_at
       AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Start time is locked. Only super admin can change it.';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) King of the Hill throne
CREATE TABLE IF NOT EXISTS public.koth_throne (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  current_king_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  defended_count integer NOT NULL DEFAULT 0,
  crowned_at timestamptz NOT NULL DEFAULT now(),
  last_challenge_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id)
);

GRANT SELECT ON public.koth_throne TO authenticated;
GRANT SELECT ON public.koth_throne TO anon;
GRANT ALL ON public.koth_throne TO service_role;

ALTER TABLE public.koth_throne ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view KOTH throne"
  ON public.koth_throne FOR SELECT
  USING (true);

-- 4) Puzzle tournament attempts
CREATE TABLE IF NOT EXISTS public.puzzle_tournament_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  puzzle_id text NOT NULL,
  solved boolean NOT NULL DEFAULT false,
  solve_time_ms integer,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id, puzzle_id)
);

CREATE INDEX IF NOT EXISTS idx_pta_tournament ON public.puzzle_tournament_attempts(tournament_id);
CREATE INDEX IF NOT EXISTS idx_pta_user ON public.puzzle_tournament_attempts(user_id);

GRANT SELECT, INSERT ON public.puzzle_tournament_attempts TO authenticated;
GRANT SELECT ON public.puzzle_tournament_attempts TO anon;
GRANT ALL ON public.puzzle_tournament_attempts TO service_role;

ALTER TABLE public.puzzle_tournament_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view puzzle attempts"
  ON public.puzzle_tournament_attempts FOR SELECT
  USING (true);

CREATE POLICY "Users insert their own puzzle attempts"
  ON public.puzzle_tournament_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
