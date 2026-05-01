CREATE TABLE public.bot_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bot_key TEXT,
  bot_name TEXT NOT NULL,
  bot_rating INTEGER NOT NULL,
  player_color TEXT NOT NULL CHECK (player_color IN ('w','b')),
  result TEXT NOT NULL CHECK (result IN ('1-0','0-1','1/2-1/2')),
  outcome TEXT NOT NULL CHECK (outcome IN ('win','loss','draw')),
  pgn TEXT NOT NULL DEFAULT '',
  move_count INTEGER NOT NULL DEFAULT 0,
  time_control_label TEXT NOT NULL DEFAULT 'Casual',
  rating_change INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_bot_games_user_created ON public.bot_games (user_id, created_at DESC);

ALTER TABLE public.bot_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bot games"
  ON public.bot_games FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own bot games"
  ON public.bot_games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own bot games"
  ON public.bot_games FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
