
-- ELO rating update function
CREATE OR REPLACE FUNCTION public.update_elo_ratings(
  p_white_id uuid,
  p_black_id uuid,
  p_result text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  white_rating integer;
  black_rating integer;
  expected_white float;
  k integer := 32;
  white_score float;
  black_score float;
  new_white integer;
  new_black integer;
BEGIN
  SELECT rating INTO white_rating FROM profiles WHERE user_id = p_white_id;
  SELECT rating INTO black_rating FROM profiles WHERE user_id = p_black_id;
  
  IF white_rating IS NULL OR black_rating IS NULL THEN RETURN; END IF;
  
  expected_white := 1.0 / (1.0 + power(10.0, (black_rating - white_rating)::float / 400.0));
  
  IF p_result = '1-0' THEN
    white_score := 1.0; black_score := 0.0;
  ELSIF p_result = '0-1' THEN
    white_score := 0.0; black_score := 1.0;
  ELSE
    white_score := 0.5; black_score := 0.5;
  END IF;
  
  new_white := white_rating + round(k * (white_score - expected_white))::integer;
  new_black := black_rating + round(k * (black_score - (1.0 - expected_white)))::integer;
  
  UPDATE profiles SET 
    rating = GREATEST(100, new_white),
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN p_result = '1-0' THEN 1 ELSE 0 END,
    games_lost = games_lost + CASE WHEN p_result = '0-1' THEN 1 ELSE 0 END,
    games_drawn = games_drawn + CASE WHEN p_result = '1/2-1/2' THEN 1 ELSE 0 END
  WHERE user_id = p_white_id;
  
  UPDATE profiles SET 
    rating = GREATEST(100, new_black),
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN p_result = '0-1' THEN 1 ELSE 0 END,
    games_lost = games_lost + CASE WHEN p_result = '1-0' THEN 1 ELSE 0 END,
    games_drawn = games_drawn + CASE WHEN p_result = '1/2-1/2' THEN 1 ELSE 0 END
  WHERE user_id = p_black_id;
END;
$$;

-- Daily puzzle tracking
CREATE TABLE public.puzzle_solves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  puzzle_date date NOT NULL DEFAULT CURRENT_DATE,
  puzzle_index integer NOT NULL,
  solved boolean NOT NULL DEFAULT false,
  time_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, puzzle_date)
);

ALTER TABLE public.puzzle_solves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view puzzle solves" ON public.puzzle_solves FOR SELECT USING (true);
CREATE POLICY "Users can insert own solves" ON public.puzzle_solves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own solves" ON public.puzzle_solves FOR UPDATE USING (auth.uid() = user_id);

-- Make online games viewable by anyone (for spectators & leaderboard)
DROP POLICY IF EXISTS "Players can view their games" ON public.online_games;
CREATE POLICY "Anyone can view finished games" ON public.online_games FOR SELECT USING (
  status = 'finished' OR auth.uid() = white_player_id OR auth.uid() = black_player_id
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.puzzle_solves;
