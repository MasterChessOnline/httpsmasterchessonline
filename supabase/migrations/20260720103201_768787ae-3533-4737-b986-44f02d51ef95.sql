CREATE UNIQUE INDEX IF NOT EXISTS tournament_registrations_unique_name
ON public.tournament_registrations (tournament_id, lower(first_name), lower(last_name))
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;