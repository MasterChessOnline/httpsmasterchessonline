-- Helper: can a user create/edit tournaments?
CREATE OR REPLACE FUNCTION public.can_manage_tournaments(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin'::public.app_role, 'organizer'::public.app_role)
  )
$$;

-- Extend tournaments table
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS tournament_type text NOT NULL DEFAULT 'swiss',
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS is_rated boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS anti_cheat_level text NOT NULL DEFAULT 'strict',
  ADD COLUMN IF NOT EXISTS registration_deadline timestamp with time zone,
  ADD COLUMN IF NOT EXISTS start_time_locked boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_started boolean NOT NULL DEFAULT false;

-- Validation trigger
CREATE OR REPLACE FUNCTION public.validate_tournament_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.starts_at <= now() THEN
      RAISE EXCEPTION 'Tournament start time must be in the future';
    END IF;
    IF NEW.tournament_type NOT IN ('arena','swiss','round_robin') THEN
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
$$;

DROP TRIGGER IF EXISTS trg_validate_tournaments ON public.tournaments;
CREATE TRIGGER trg_validate_tournaments
  BEFORE INSERT OR UPDATE ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.validate_tournament_changes();

-- RLS: only admin/organizer can create
DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Admins/organizers can create tournaments" ON public.tournaments;
CREATE POLICY "Admins/organizers can create tournaments"
  ON public.tournaments FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_tournaments(auth.uid()) AND created_by = auth.uid());

-- RLS: visibility-aware SELECT
DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "View tournaments by visibility" ON public.tournaments;
CREATE POLICY "View tournaments by visibility"
  ON public.tournaments FOR SELECT
  USING (
    visibility = 'public'
    OR public.can_manage_tournaments(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.tournament_registrations
      WHERE tournament_id = tournaments.id AND user_id = auth.uid()
    )
  );

-- Index for auto-start scheduler
CREATE INDEX IF NOT EXISTS idx_tournaments_auto_start
  ON public.tournaments (status, starts_at)
  WHERE status = 'registering';