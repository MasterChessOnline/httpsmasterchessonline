SET session_replication_role = replica;
UPDATE public.tournaments SET starts_at = '2026-07-23T14:00:00Z' WHERE name ILIKE '%Dragan Brakus%';
SET session_replication_role = origin;