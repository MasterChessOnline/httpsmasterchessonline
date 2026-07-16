-- Chess DNA snapshots
CREATE TABLE public.chess_dna_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_label text NOT NULL,
  aggression_score int NOT NULL DEFAULT 50,
  defense_score int NOT NULL DEFAULT 50,
  tactics_score int NOT NULL DEFAULT 50,
  endgame_score int NOT NULL DEFAULT 50,
  favorite_openings jsonb NOT NULL DEFAULT '[]'::jsonb,
  best_color text,
  weakness text,
  summary text,
  games_analyzed int NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chess_dna_snapshots TO authenticated;
GRANT SELECT ON public.chess_dna_snapshots TO anon;
GRANT ALL ON public.chess_dna_snapshots TO service_role;
ALTER TABLE public.chess_dna_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public dna read" ON public.chess_dna_snapshots FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "own dna insert" ON public.chess_dna_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own dna update" ON public.chess_dna_snapshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own dna delete" ON public.chess_dna_snapshots FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_dna_user ON public.chess_dna_snapshots(user_id);

-- Challenge cards (share-ready snapshots after games)
CREATE TABLE public.challenge_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  share_code text NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 10),
  title text NOT NULL,
  result text NOT NULL,
  fen text,
  rating_change int DEFAULT 0,
  opponent_name text,
  view_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.challenge_cards TO authenticated;
GRANT SELECT ON public.challenge_cards TO anon;
GRANT ALL ON public.challenge_cards TO service_role;
ALTER TABLE public.challenge_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards public read" ON public.challenge_cards FOR SELECT USING (true);
CREATE POLICY "cards own insert" ON public.challenge_cards FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "cards own update" ON public.challenge_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_cards_share ON public.challenge_cards(share_code);
CREATE INDEX idx_cards_user ON public.challenge_cards(user_id);

-- Embed widget analytics (loaded on external sites)
CREATE TABLE public.embed_widgets_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_type text NOT NULL,
  referrer text,
  variant text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.embed_widgets_analytics TO anon;
GRANT INSERT ON public.embed_widgets_analytics TO authenticated;
GRANT ALL ON public.embed_widgets_analytics TO service_role;
ALTER TABLE public.embed_widgets_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can log embed hit" ON public.embed_widgets_analytics FOR INSERT WITH CHECK (true);
CREATE INDEX idx_embed_created ON public.embed_widgets_analytics(created_at DESC);

-- updated_at trigger for DNA
CREATE TRIGGER trg_dna_updated BEFORE UPDATE ON public.chess_dna_snapshots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();