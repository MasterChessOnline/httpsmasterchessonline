
-- 1. Confessions: drop broad public select that exposed user_id; public reads go via SECURITY DEFINER RPC public_confessions
DROP POLICY IF EXISTS "Public confessions are visible to all" ON public.confessions;

-- 2. Referrals: block all client writes (only service_role / SECURITY DEFINER may write)
CREATE POLICY "Deny anon/auth insert on referrals"
  ON public.referrals AS RESTRICTIVE FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Deny anon/auth update on referrals"
  ON public.referrals AS RESTRICTIVE FOR UPDATE
  TO anon, authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny anon/auth delete on referrals"
  ON public.referrals AS RESTRICTIVE FOR DELETE
  TO anon, authenticated
  USING (false);

-- 3. Battle royale queue: explicit self-insert policy (inserts also happen via SECURITY DEFINER RPC)
CREATE POLICY "br_queue_join_self"
  ON public.battle_royale_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
