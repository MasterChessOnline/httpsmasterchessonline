
-- 1. Extend tournaments with lifecycle fields
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS forfeit_minutes int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS registration_locked_at timestamptz,
  ADD COLUMN IF NOT EXISTS finished_at timestamptz,
  ADD COLUMN IF NOT EXISTS winner_user_id uuid,
  ADD COLUMN IF NOT EXISTS paused_at timestamptz;

-- 2. Extend pairings with timing + outcome metadata
ALTER TABLE public.tournament_pairings
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS finished_at timestamptz,
  ADD COLUMN IF NOT EXISTS end_reason text,
  ADD COLUMN IF NOT EXISTS forfeit boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_tournament_pairings_game_id
  ON public.tournament_pairings(game_id) WHERE game_id IS NOT NULL;

-- 3. Audit log
CREATE TABLE IF NOT EXISTS public.tournament_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tournament_audit_log TO authenticated;
GRANT ALL ON public.tournament_audit_log TO service_role;
ALTER TABLE public.tournament_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit log" ON public.tournament_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)
         OR EXISTS (SELECT 1 FROM public.tournaments t
                    WHERE t.id = tournament_id AND t.created_by = auth.uid()));
CREATE POLICY "Service writes audit log" ON public.tournament_audit_log
  FOR INSERT TO service_role WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_audit_tournament ON public.tournament_audit_log(tournament_id, created_at DESC);

-- 4. Round state
CREATE TABLE IF NOT EXISTS public.tournament_round_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round int NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | published | in_progress | closed
  published_at timestamptz,
  locked_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, round)
);
GRANT SELECT ON public.tournament_round_state TO anon, authenticated;
GRANT ALL ON public.tournament_round_state TO service_role;
ALTER TABLE public.tournament_round_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads round state" ON public.tournament_round_state
  FOR SELECT USING (true);
CREATE POLICY "Service writes round state" ON public.tournament_round_state
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE TRIGGER trg_touch_round_state
  BEFORE UPDATE ON public.tournament_round_state
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- 5. Auto-ingest: when an online_games row tied to a pairing finishes,
--    copy the result into tournament_pairings.
CREATE OR REPLACE FUNCTION public.tg_tournament_ingest_result()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'finished' AND NEW.result IS NOT NULL
     AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.result IS DISTINCT FROM NEW.result) THEN
    UPDATE public.tournament_pairings
       SET result = NEW.result,
           end_reason = NEW.end_reason,
           finished_at = COALESCE(finished_at, now())
     WHERE game_id = NEW.id AND result IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tournament_ingest_result ON public.online_games;
CREATE TRIGGER trg_tournament_ingest_result
  AFTER UPDATE ON public.online_games
  FOR EACH ROW EXECUTE FUNCTION public.tg_tournament_ingest_result();

-- 6. Helper: is_tournament_admin (organizer OR super admin)
CREATE OR REPLACE FUNCTION public.is_tournament_admin(_user uuid, _tid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user, 'admin'::public.app_role)
      OR EXISTS (SELECT 1 FROM public.tournaments t
                 WHERE t.id = _tid AND t.created_by = _user);
$$;
