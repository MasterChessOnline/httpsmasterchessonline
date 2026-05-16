
-- Premium cosmetics: avatar frame and profile banner
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_frame text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS profile_banner text DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS push_notifications_enabled boolean NOT NULL DEFAULT false;

-- Allow user to update these cosmetic columns (protect_profile_columns trigger needs update)
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  NEW.rating := OLD.rating;
  NEW.peak_rating := OLD.peak_rating;
  NEW.bot_rating := OLD.bot_rating;
  NEW.bot_peak_rating := OLD.bot_peak_rating;
  NEW.master_coins := OLD.master_coins;
  NEW.games_played := OLD.games_played;
  NEW.games_won := OLD.games_won;
  NEW.games_lost := OLD.games_lost;
  NEW.games_drawn := OLD.games_drawn;
  NEW.bot_games_played := OLD.bot_games_played;
  NEW.bot_games_won := OLD.bot_games_won;
  NEW.bot_games_lost := OLD.bot_games_lost;
  NEW.bot_games_drawn := OLD.bot_games_drawn;
  NEW.followers_count := OLD.followers_count;
  NEW.following_count := OLD.following_count;
  NEW.highest_title_key := OLD.highest_title_key;
  NEW.is_streamer := OLD.is_streamer;
  NEW.user_id := OLD.user_id;
  NEW.login_streak := OLD.login_streak;
  NEW.login_streak_best := OLD.login_streak_best;
  NEW.last_login_reward_date := OLD.last_login_reward_date;
  RETURN NEW;
END;
$function$;

-- Team Battles: teams + members + battles
CREATE TABLE IF NOT EXISTS public.team_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid NOT NULL,
  team_a_name text NOT NULL DEFAULT 'Team A',
  team_b_name text NOT NULL DEFAULT 'Team B',
  team_a_score integer NOT NULL DEFAULT 0,
  team_b_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'lobby',
  starts_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  ends_at timestamptz,
  time_control_label text NOT NULL DEFAULT '5+3',
  max_per_team integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_battle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id uuid NOT NULL REFERENCES public.team_battles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  team text NOT NULL CHECK (team IN ('a','b')),
  score integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (battle_id, user_id)
);

ALTER TABLE public.team_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_battle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team battles"
  ON public.team_battles FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create team battles"
  ON public.team_battles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update team battle"
  ON public.team_battles FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view team battle members"
  ON public.team_battle_members FOR SELECT USING (true);

CREATE POLICY "Users can join team battles"
  ON public.team_battle_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave team battles"
  ON public.team_battle_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_team_battles_updated_at
  BEFORE UPDATE ON public.team_battles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.team_battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_battle_members;
