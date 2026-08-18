GRANT SELECT ON public.profiles TO anon;

ALTER TABLE public.game_messages REPLICA IDENTITY FULL;
ALTER TABLE public.online_game_presence REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='game_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='online_game_presence') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.online_game_presence;
  END IF;
END $$;