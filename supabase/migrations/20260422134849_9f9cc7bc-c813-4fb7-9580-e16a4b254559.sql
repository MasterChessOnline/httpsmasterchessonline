-- ============================================================
-- SEASONS
-- ============================================================
CREATE TABLE public.seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'ended' | 'upcoming'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
  ON public.seasons FOR SELECT USING (true);

CREATE POLICY "Admins can manage seasons"
  ON public.seasons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- SEASON RESULTS (historical snapshots)
-- ============================================================
CREATE TABLE public.season_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating_type TEXT NOT NULL DEFAULT 'online', -- 'online' | 'bot'
  final_rank INTEGER NOT NULL,
  final_rating INTEGER NOT NULL,
  peak_rating INTEGER NOT NULL,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  reward_tier TEXT, -- 'champion' | 'diamond' | 'gold' | 'silver' | 'bronze' | null
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, user_id, rating_type)
);

CREATE INDEX idx_season_results_user ON public.season_results(user_id);
CREATE INDEX idx_season_results_season ON public.season_results(season_id, rating_type, final_rank);

ALTER TABLE public.season_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view season results"
  ON public.season_results FOR SELECT USING (true);

CREATE POLICY "Admins can write season results"
  ON public.season_results FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- WIN STREAKS
-- ============================================================
CREATE TABLE public.win_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating_type TEXT NOT NULL DEFAULT 'online', -- 'online' | 'bot'
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  loss_streak INTEGER NOT NULL DEFAULT 0, -- for rating-protection
  last_result TEXT, -- 'win' | 'loss' | 'draw'
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, rating_type)
);

CREATE INDEX idx_win_streaks_user ON public.win_streaks(user_id);

ALTER TABLE public.win_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view streaks"
  ON public.win_streaks FOR SELECT USING (true);

CREATE POLICY "Users can insert own streak"
  ON public.win_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON public.win_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- BADGES CATALOG
-- ============================================================
CREATE TABLE public.badges_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award',
  category TEXT NOT NULL DEFAULT 'general', -- 'streak' | 'milestone' | 'skill' | 'prestige'
  tier TEXT NOT NULL DEFAULT 'bronze', -- 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary'
  requirement_type TEXT NOT NULL, -- 'win_streak' | 'games_played' | 'giant_slayer' | 'win_rate' | 'season_rank'
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.badges_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges catalog"
  ON public.badges_catalog FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges catalog"
  ON public.badges_catalog FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PLAYER BADGES (earned)
-- ============================================================
CREATE TABLE public.player_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  context JSONB, -- snapshot data: streak count, opponent rating, etc.
  UNIQUE (user_id, badge_key)
);

CREATE INDEX idx_player_badges_user ON public.player_badges(user_id);

ALTER TABLE public.player_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view player badges"
  ON public.player_badges FOR SELECT USING (true);

CREATE POLICY "Users can earn own badges"
  ON public.player_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED: Season 1
-- ============================================================
INSERT INTO public.seasons (season_number, name, starts_at, ends_at, status)
VALUES (
  1,
  'Season 1: The Awakening',
  now(),
  now() + INTERVAL '60 days',
  'active'
);

-- ============================================================
-- SEED: Starter badge catalog
-- ============================================================
INSERT INTO public.badges_catalog (key, name, description, icon, category, tier, requirement_type, requirement_value) VALUES
  ('streak_3',          'Heating Up',        'Win 3 games in a row',                            'flame',     'streak',    'bronze',    'win_streak',   3),
  ('streak_5',          'On Fire',           'Win 5 games in a row',                            'flame',     'streak',    'silver',    'win_streak',   5),
  ('streak_10',         'Unstoppable',       'Win 10 games in a row',                           'zap',       'streak',    'gold',      'win_streak',   10),
  ('streak_25',         'Legendary Run',     'Win 25 games in a row',                           'crown',     'streak',    'legendary', 'win_streak',   25),
  ('giant_slayer',      'Giant Slayer',      'Defeat an opponent rated 200+ above you',         'sword',     'skill',     'silver',    'giant_slayer', 200),
  ('giant_slayer_400',  'David vs Goliath',  'Defeat an opponent rated 400+ above you',         'sword',     'skill',     'gold',      'giant_slayer', 400),
  ('games_10',          'Initiate',          'Play 10 ranked games',                            'shield',    'milestone', 'bronze',    'games_played', 10),
  ('games_50',          'Veteran',           'Play 50 ranked games',                            'shield',    'milestone', 'silver',    'games_played', 50),
  ('games_100',         'Centurion',         'Play 100 ranked games',                           'shield',    'milestone', 'gold',      'games_played', 100),
  ('games_500',         'Battle-Hardened',   'Play 500 ranked games',                           'shield',    'milestone', 'diamond',   'games_played', 500),
  ('rating_1600',       'Expert Climber',    'Reach 1600 rating',                               'trending-up','skill',    'gold',      'win_rate',     1600),
  ('rating_1800',       'Master',            'Reach 1800 rating',                               'crown',     'prestige',  'legendary', 'win_rate',     1800);
