
-- Tournament chat messages table
CREATE TABLE IF NOT EXISTS public.tournament_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournament_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament chat" ON public.tournament_chat_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can send tournament chat" ON public.tournament_chat_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for tables not already in publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tournament_registrations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_registrations;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tournament_pairings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_pairings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tournament_chat_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_chat_messages;
  END IF;
END $$;

-- RLS policies for tournament management
CREATE POLICY "Authenticated users can create tournaments" ON public.tournaments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "System can update tournaments" ON public.tournaments
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "System can create pairings" ON public.tournament_pairings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "System can update pairings" ON public.tournament_pairings
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "System can update registrations" ON public.tournament_registrations
  FOR UPDATE TO authenticated USING (true);
