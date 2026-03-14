
-- Streak tracking table
CREATE TABLE public.tournament_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_participation_date date,
  total_tournaments_played integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.tournament_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view streaks" ON public.tournament_streaks FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert own streak" ON public.tournament_streaks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update streaks" ON public.tournament_streaks FOR UPDATE TO authenticated USING (true);

-- Enable realtime for streaks
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_streaks;
