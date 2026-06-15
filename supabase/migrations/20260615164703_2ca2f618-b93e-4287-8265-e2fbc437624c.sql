
CREATE TABLE public.game_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.online_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_id, user_id, emoji)
);
CREATE INDEX idx_game_reactions_game ON public.game_reactions(game_id);
GRANT SELECT ON public.game_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.game_reactions TO authenticated;
GRANT ALL ON public.game_reactions TO service_role;
ALTER TABLE public.game_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions are public" ON public.game_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users add reactions" ON public.game_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove own reactions" ON public.game_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);
