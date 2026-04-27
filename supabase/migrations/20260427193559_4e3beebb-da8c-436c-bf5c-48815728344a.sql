ALTER TABLE public.online_games
ADD COLUMN IF NOT EXISTS move_number integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.online_game_moves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id uuid NOT NULL,
  ply integer NOT NULL,
  player_id uuid NOT NULL,
  color text NOT NULL,
  from_square text NOT NULL,
  to_square text NOT NULL,
  promotion text,
  san text NOT NULL,
  fen_before text NOT NULL,
  fen_after text NOT NULL,
  pgn_after text NOT NULL DEFAULT '',
  white_time integer NOT NULL,
  black_time integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT online_game_moves_color_check CHECK (color IN ('w', 'b')),
  CONSTRAINT online_game_moves_square_check CHECK (from_square ~ '^[a-h][1-8]$' AND to_square ~ '^[a-h][1-8]$'),
  CONSTRAINT online_game_moves_promotion_check CHECK (promotion IS NULL OR promotion IN ('q', 'r', 'b', 'n')),
  CONSTRAINT online_game_moves_ply_positive CHECK (ply > 0),
  CONSTRAINT online_game_moves_unique_ply UNIQUE (game_id, ply)
);

CREATE INDEX IF NOT EXISTS idx_online_game_moves_game_ply
ON public.online_game_moves (game_id, ply DESC);

CREATE INDEX IF NOT EXISTS idx_online_games_players_status_updated
ON public.online_games (white_player_id, black_player_id, status, updated_at DESC);

ALTER TABLE public.online_game_moves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Game players can view move log" ON public.online_game_moves;
CREATE POLICY "Game players can view move log"
ON public.online_game_moves
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.online_games g
    WHERE g.id = online_game_moves.game_id
      AND (g.white_player_id = auth.uid() OR g.black_player_id = auth.uid())
  )
);

ALTER TABLE public.online_game_moves REPLICA IDENTITY FULL;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.online_game_moves;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;