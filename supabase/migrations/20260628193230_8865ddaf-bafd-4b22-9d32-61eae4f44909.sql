
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS is_test_bot boolean NOT NULL DEFAULT false;

ALTER TABLE public.tournament_registrations
  ALTER COLUMN user_id DROP NOT NULL;

-- Guard: only test-bot rows may have NULL user_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='tournament_registrations_user_or_bot_chk') THEN
    ALTER TABLE public.tournament_registrations
      ADD CONSTRAINT tournament_registrations_user_or_bot_chk
      CHECK (user_id IS NOT NULL OR is_test_bot = true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS tournament_registrations_test_bot_idx
  ON public.tournament_registrations (tournament_id) WHERE is_test_bot = true;
