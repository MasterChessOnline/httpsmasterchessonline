CREATE TABLE IF NOT EXISTS public.stockfish_eval_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fen TEXT NOT NULL,
  depth INTEGER NOT NULL,
  evaluation INTEGER NOT NULL DEFAULT 0,
  mate INTEGER,
  engine TEXT NOT NULL DEFAULT 'stockfish-18-lite-single',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT stockfish_eval_cache_depth_check CHECK (depth BETWEEN 1 AND 64),
  CONSTRAINT stockfish_eval_cache_fen_length_check CHECK (char_length(fen) BETWEEN 20 AND 120),
  CONSTRAINT stockfish_eval_cache_unique UNIQUE (fen, depth, engine)
);

ALTER TABLE public.stockfish_eval_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read Stockfish eval cache" ON public.stockfish_eval_cache;
DROP POLICY IF EXISTS "Anyone can add Stockfish eval cache" ON public.stockfish_eval_cache;

CREATE POLICY "Anyone can read Stockfish eval cache"
ON public.stockfish_eval_cache
FOR SELECT
USING (true);

CREATE POLICY "Anyone can add Stockfish eval cache"
ON public.stockfish_eval_cache
FOR INSERT
WITH CHECK (
  depth BETWEEN 1 AND 64
  AND char_length(fen) BETWEEN 20 AND 120
  AND engine = 'stockfish-18-lite-single'
);

CREATE INDEX IF NOT EXISTS idx_stockfish_eval_cache_lookup
ON public.stockfish_eval_cache (engine, depth, fen);

CREATE TRIGGER update_stockfish_eval_cache_updated_at
BEFORE UPDATE ON public.stockfish_eval_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();