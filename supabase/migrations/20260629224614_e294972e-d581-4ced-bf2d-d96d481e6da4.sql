
-- FIDE verification schema for tournament registrations
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS fide_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fide_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS fide_verified_name text,
  ADD COLUMN IF NOT EXISTS fide_rapid_rating integer,
  ADD COLUMN IF NOT EXISTS fide_standard_rating integer,
  ADD COLUMN IF NOT EXISTS fide_profile_url text,
  ADD COLUMN IF NOT EXISTS tournament_seed integer;

-- Prevent same FIDE ID registering twice in same tournament (when set)
CREATE UNIQUE INDEX IF NOT EXISTS tournament_registrations_unique_fide
  ON public.tournament_registrations (tournament_id, fide_id)
  WHERE fide_id IS NOT NULL;

-- Tournament-level FIDE policy
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS fide_verification_mode text NOT NULL DEFAULT 'optional'
    CHECK (fide_verification_mode IN ('disabled','optional','required')),
  ADD COLUMN IF NOT EXISTS fide_seeding_rating text NOT NULL DEFAULT 'blitz'
    CHECK (fide_seeding_rating IN ('blitz','rapid','standard')),
  ADD COLUMN IF NOT EXISTS fide_seeding_fallback text NOT NULL DEFAULT 'cascade'
    CHECK (fide_seeding_fallback IN ('cascade','unrated','masterchess'));
