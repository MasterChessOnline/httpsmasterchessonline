DROP POLICY IF EXISTS "View tournaments by visibility" ON public.tournaments;

CREATE POLICY "View tournaments by visibility"
ON public.tournaments
FOR SELECT
TO public
USING (
  visibility = 'public'
  OR created_by = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.tournament_registrations tr
    WHERE tr.tournament_id = tournaments.id
      AND tr.user_id = auth.uid()
  )
);