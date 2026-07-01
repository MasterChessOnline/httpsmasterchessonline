ALTER TABLE public.tournaments DISABLE TRIGGER USER;
UPDATE public.tournaments
SET starts_at = '2026-07-05 15:00:00+00'::timestamptz,
    registration_deadline = '2026-07-05 14:45:00+00'::timestamptz,
    checkin_opens_at = '2026-07-05 14:45:00+00'::timestamptz,
    checkin_closes_at = '2026-07-05 14:55:00+00'::timestamptz,
    description = REPLACE(REPLACE(COALESCE(description,''), '2 July 2026', '5 July 2026'), '2026-07-02', '2026-07-05')
WHERE name ILIKE '%Dragan Brakus%' OR name ILIKE '%DB Chess Cup%';
ALTER TABLE public.tournaments ENABLE TRIGGER USER;