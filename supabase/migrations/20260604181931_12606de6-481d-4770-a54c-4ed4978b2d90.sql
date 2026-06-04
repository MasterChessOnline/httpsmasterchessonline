-- 1) Referrals: lock down SELECT to service_role only.
DROP POLICY IF EXISTS "Service role can read referrals" ON public.referrals;
CREATE POLICY "Service role can read referrals"
  ON public.referrals
  FOR SELECT
  TO service_role
  USING (true);

-- 2) Spectator bets: remove from realtime publication so bet stakes/amounts
-- are no longer broadcast to any authenticated subscriber. Per-user reads
-- still work via the existing table-level RLS.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'spectator_bets'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.spectator_bets';
  END IF;
END $$;