-- Keep the public DB Chess Cup date aligned everywhere: 2 July 2026, 17:00 CEST.
ALTER TABLE public.tournaments DISABLE TRIGGER USER;

UPDATE public.tournaments
SET
  starts_at = '2026-07-02 15:00:00+00'::timestamptz,
  registration_deadline = '2026-07-02 14:45:00+00'::timestamptz,
  checkin_opens_at = '2026-07-02 14:45:00+00'::timestamptz,
  checkin_closes_at = '2026-07-02 14:55:00+00'::timestamptz,
  max_players = GREATEST(COALESCE(max_players, 0), 500),
  description = regexp_replace(
    COALESCE(description, ''),
    '(June 30, 2026|30 June 2026)',
    '2 July 2026',
    'gi'
  )
WHERE name ILIKE '%Dragan Brakus%' OR name ILIKE '%DB Chess Cup%';

ALTER TABLE public.tournaments ENABLE TRIGGER USER;
