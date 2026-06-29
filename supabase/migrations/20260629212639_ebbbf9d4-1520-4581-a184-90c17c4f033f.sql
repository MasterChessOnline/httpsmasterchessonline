ALTER TABLE public.tournaments DISABLE TRIGGER USER;
UPDATE public.tournaments SET starts_at = '2026-07-02 15:00:00+00', registration_deadline = '2026-07-02 14:45:00+00' WHERE id = '8e681ff8-8918-4489-a9a3-c7d363d38196';
ALTER TABLE public.tournaments ENABLE TRIGGER USER;