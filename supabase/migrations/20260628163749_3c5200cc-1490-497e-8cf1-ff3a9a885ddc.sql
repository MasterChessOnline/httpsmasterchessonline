
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS prize_pool_eur numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prize_escalator_step numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS donation_total_eur numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sponsor_label text;

ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS bye_rounds integer[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS withdrew_at timestamptz;
