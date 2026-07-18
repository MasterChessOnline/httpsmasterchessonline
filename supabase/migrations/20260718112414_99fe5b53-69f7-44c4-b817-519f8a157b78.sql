DROP POLICY IF EXISTS "Anyone can view registrations" ON public.tournament_registrations;

CREATE POLICY "Registrant reads own registration"
ON public.tournament_registrations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Tournament organizer reads registrations"
ON public.tournament_registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_registrations.tournament_id
      AND t.created_by = auth.uid()
  )
);

CREATE POLICY "Admins read registrations"
ON public.tournament_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));