
-- 1) stream_donations: remove permissive public INSERT
DROP POLICY IF EXISTS "System can insert donations" ON public.stream_donations;

-- Ensure a service-role-only insert path exists (kept idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='stream_donations'
      AND policyname='Service role inserts donations'
  ) THEN
    CREATE POLICY "Service role inserts donations"
      ON public.stream_donations
      FOR INSERT
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- 2) contact_messages: explicit no-read for non-service-role.
--    (Default-deny applies when no SELECT policy exists; this makes intent explicit.)
DROP POLICY IF EXISTS "Service role can read contact messages" ON public.contact_messages;
CREATE POLICY "Service role can read contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (auth.role() = 'service_role');

-- 3) Fix mutable search_path on trigger function
CREATE OR REPLACE FUNCTION public.touch_notification_prefs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
