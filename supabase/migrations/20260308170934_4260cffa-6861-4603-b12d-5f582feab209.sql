
-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'blitz',
  time_control_label TEXT NOT NULL DEFAULT '5+3',
  time_control_seconds INTEGER NOT NULL DEFAULT 300,
  time_control_increment INTEGER NOT NULL DEFAULT 3,
  max_players INTEGER NOT NULL DEFAULT 16,
  total_rounds INTEGER NOT NULL DEFAULT 5,
  current_round INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'registering',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 minutes'),
  round_started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tournament registrations
CREATE TABLE public.tournament_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating_at_join INTEGER NOT NULL DEFAULT 1200,
  score NUMERIC(4,1) NOT NULL DEFAULT 0,
  tiebreak NUMERIC(6,1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Tournament pairings (each round)
CREATE TABLE public.tournament_pairings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  white_player_id UUID NOT NULL,
  black_player_id UUID,
  game_id UUID REFERENCES public.online_games(id),
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, round, white_player_id)
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_pairings ENABLE ROW LEVEL SECURITY;

-- Tournaments: everyone can read, authenticated can create (for edge function via service role)
CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (true);

-- Tournament registrations: everyone can read, authenticated users can register
CREATE POLICY "Anyone can view registrations" ON public.tournament_registrations FOR SELECT USING (true);
CREATE POLICY "Users can register for tournaments" ON public.tournament_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own registration" ON public.tournament_registrations FOR DELETE USING (auth.uid() = user_id);

-- Tournament pairings: everyone can read
CREATE POLICY "Anyone can view pairings" ON public.tournament_pairings FOR SELECT USING (true);

-- Enable realtime for tournament tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_pairings;
