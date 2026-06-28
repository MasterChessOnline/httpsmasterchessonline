
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS chief_arbiter text,
  ADD COLUMN IF NOT EXISTS deputy_arbiter text,
  ADD COLUMN IF NOT EXISTS organizer_email text,
  ADD COLUMN IF NOT EXISTS rating_type text DEFAULT 'unrated',
  ADD COLUMN IF NOT EXISTS venue text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS chess_results_status text DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS chess_results_submitted_at timestamptz;

UPDATE public.tournaments
SET
  chief_arbiter = COALESCE(chief_arbiter, 'Nikola Sakotic (MasterChess Arbiter Team)'),
  organizer_label = COALESCE(organizer_label, 'MasterChess.live'),
  organizer_email = COALESCE(organizer_email, 'nikola@masterchess.live'),
  rating_type = COALESCE(rating_type, 'unrated'),
  venue = COALESCE(venue, 'Online — masterchess.live'),
  city = COALESCE(city, 'Belgrade'),
  chess_results_status = COALESCE(chess_results_status, 'not_submitted')
WHERE name ILIKE '%Brakus%';
