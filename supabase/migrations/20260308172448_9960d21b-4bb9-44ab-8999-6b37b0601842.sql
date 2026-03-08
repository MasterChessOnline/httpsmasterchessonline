
-- Premium chat messages
CREATE TABLE public.premium_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.premium_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view premium chat" ON public.premium_chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert" ON public.premium_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Achievements definitions
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'general',
  requirement_type TEXT NOT NULL DEFAULT 'games_played',
  requirement_value INTEGER NOT NULL DEFAULT 1,
  reward_type TEXT,
  reward_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- User earned achievements
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User collectibles (board themes, piece sets, avatars)
CREATE TABLE public.user_collectibles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  collectible_type TEXT NOT NULL,
  collectible_key TEXT NOT NULL,
  equipped BOOLEAN NOT NULL DEFAULT false,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, collectible_type, collectible_key)
);
ALTER TABLE public.user_collectibles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collectibles" ON public.user_collectibles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collectibles" ON public.user_collectibles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collectibles" ON public.user_collectibles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for premium chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.premium_chat_messages;
