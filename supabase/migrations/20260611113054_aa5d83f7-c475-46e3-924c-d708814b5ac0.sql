
-- 1) Lock down referrals — only service_role
REVOKE ALL ON public.referrals FROM anon, authenticated;
GRANT ALL ON public.referrals TO service_role;

-- 2) Season results: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view season results" ON public.season_results;
CREATE POLICY "Authenticated can view season results"
ON public.season_results
FOR SELECT
TO authenticated
USING (true);
REVOKE SELECT ON public.season_results FROM anon;
GRANT SELECT ON public.season_results TO authenticated;
GRANT ALL ON public.season_results TO service_role;
