-- Tournaments: restrict UPDATE to service_role
DROP POLICY IF EXISTS "System can update tournaments" ON public.tournaments;
CREATE POLICY "Service role manages tournaments"
  ON public.tournaments FOR UPDATE
  TO service_role
  USING (true) WITH CHECK (true);

-- Tournament pairings: restrict INSERT/UPDATE to service_role
DROP POLICY IF EXISTS "System can create pairings" ON public.tournament_pairings;
DROP POLICY IF EXISTS "System can update pairings" ON public.tournament_pairings;
CREATE POLICY "Service role inserts pairings"
  ON public.tournament_pairings FOR INSERT
  TO service_role
  WITH CHECK (true);
CREATE POLICY "Service role updates pairings"
  ON public.tournament_pairings FOR UPDATE
  TO service_role
  USING (true) WITH CHECK (true);

-- Tournament registrations: restrict UPDATE to service_role
DROP POLICY IF EXISTS "System can update registrations" ON public.tournament_registrations;
CREATE POLICY "Service role updates registrations"
  ON public.tournament_registrations FOR UPDATE
  TO service_role
  USING (true) WITH CHECK (true);

-- User achievements: only service role can insert (no self-awarding)
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Service role grants achievements"
  ON public.user_achievements FOR INSERT
  TO service_role
  WITH CHECK (true);
