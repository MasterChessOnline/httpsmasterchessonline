-- Daily missions catalog (admin-managed templates)
CREATE TABLE public.daily_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'target',
  mission_type TEXT NOT NULL,
  target_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active missions"
  ON public.daily_missions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage missions"
  ON public.daily_missions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Per-user mission progress (daily reset by date column)
CREATE TABLE public.user_mission_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_key TEXT NOT NULL,
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  claimed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, mission_key, mission_date)
);

ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mission progress"
  ON public.user_mission_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own mission progress"
  ON public.user_mission_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own mission progress"
  ON public.user_mission_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_mission_progress_user_date
  ON public.user_mission_progress (user_id, mission_date DESC);

CREATE TRIGGER set_user_mission_progress_updated_at
  BEFORE UPDATE ON public.user_mission_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-user activity streak
CREATE TABLE public.user_daily_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  freeze_available BOOLEAN NOT NULL DEFAULT true,
  freeze_used_date DATE,
  total_active_days INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily streaks"
  ON public.user_daily_streaks FOR SELECT
  USING (true);

CREATE POLICY "Users insert own daily streak"
  ON public.user_daily_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own daily streak"
  ON public.user_daily_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_user_daily_streaks_updated_at
  BEFORE UPDATE ON public.user_daily_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default missions
INSERT INTO public.daily_missions (key, title, description, icon, mission_type, target_value, xp_reward, sort_order) VALUES
('play_3_games', 'Igrač Dana', 'Odigraj 3 partije danas', 'swords', 'games_played', 3, 50, 1),
('win_1_game', 'Slatka Pobeda', 'Pobedi 1 partiju danas', 'trophy', 'games_won', 1, 75, 2),
('beat_a_bot', 'Lovac na Botove', 'Pobedi protiv bota', 'bot', 'bot_won', 1, 60, 3),
('visit_lesson', 'Učenik', 'Otvori jednu lekciju', 'book-open', 'lesson_visited', 1, 40, 4),
('win_streak_2', 'Talas', 'Pobedi 2 partije zaredom', 'flame', 'win_streak', 2, 100, 5);