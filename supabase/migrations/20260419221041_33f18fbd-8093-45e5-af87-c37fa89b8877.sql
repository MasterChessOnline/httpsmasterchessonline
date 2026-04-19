-- Add bot rating tracking to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bot_rating integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS bot_games_played integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bot_games_won integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bot_games_lost integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bot_games_drawn integer NOT NULL DEFAULT 0;

-- Rating history for graph (works for both online + bot games)
CREATE TABLE IF NOT EXISTS public.rating_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  rating_type text NOT NULL DEFAULT 'online', -- 'online' | 'bot'
  old_rating integer NOT NULL,
  new_rating integer NOT NULL,
  rating_change integer NOT NULL,
  opponent_rating integer,
  opponent_label text,
  result text NOT NULL, -- 'win' | 'loss' | 'draw'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rating history"
  ON public.rating_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rating history"
  ON public.rating_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rating_history_user_created
  ON public.rating_history (user_id, created_at DESC);