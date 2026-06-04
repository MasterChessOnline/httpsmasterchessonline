-- Remove sensitive tables from realtime publication to prevent broad broadcast
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'game_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.game_messages';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles';
  END IF;
END $$;

-- Lock down anti-cheat flag inserts to service_role only
DROP POLICY IF EXISTS "Users can insert their own anti-cheat flags" ON public.tournament_anti_cheat_flags;
DROP POLICY IF EXISTS "Users can flag themselves" ON public.tournament_anti_cheat_flags;
DROP POLICY IF EXISTS "Authenticated users can insert anti-cheat flags" ON public.tournament_anti_cheat_flags;
DROP POLICY IF EXISTS "Insert own anti-cheat flags" ON public.tournament_anti_cheat_flags;

CREATE POLICY "No client inserts to anti-cheat flags"
ON public.tournament_anti_cheat_flags
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (false);