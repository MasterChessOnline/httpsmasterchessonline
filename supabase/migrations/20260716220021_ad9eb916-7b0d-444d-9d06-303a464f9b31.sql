
-- 1) feed_items
CREATE TABLE IF NOT EXISTS public.feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('match_story','rating_up','tournament_win','streak','club_join','badge_earned')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','friends','private')),
  reaction_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feed_items_user_created_idx ON public.feed_items (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_created_idx ON public.feed_items (created_at DESC);
GRANT SELECT ON public.feed_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feed_items TO authenticated;
GRANT ALL ON public.feed_items TO service_role;
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public feed items visible to all" ON public.feed_items FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Owners manage their feed items" ON public.feed_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2) feed_reactions
CREATE TABLE IF NOT EXISTS public.feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (feed_item_id, user_id, emoji)
);
CREATE INDEX IF NOT EXISTS feed_reactions_item_idx ON public.feed_reactions (feed_item_id);
GRANT SELECT ON public.feed_reactions TO anon, authenticated;
GRANT INSERT, DELETE ON public.feed_reactions TO authenticated;
GRANT ALL ON public.feed_reactions TO service_role;
ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reactions" ON public.feed_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add own reactions" ON public.feed_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove own reactions" ON public.feed_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 3) feed_comments
CREATE TABLE IF NOT EXISTS public.feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID NOT NULL REFERENCES public.feed_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feed_comments_item_idx ON public.feed_comments (feed_item_id, created_at);
GRANT SELECT ON public.feed_comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.feed_comments TO authenticated;
GRANT ALL ON public.feed_comments TO service_role;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.feed_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can edit own comments" ON public.feed_comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON public.feed_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 4) rivalries (deterministic pair: user_a_id < user_b_id)
CREATE TABLE IF NOT EXISTS public.rivalries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wins_a INTEGER NOT NULL DEFAULT 0,
  wins_b INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  total_games INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  last_result TEXT,
  streak_holder_id UUID,
  streak_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)
);
CREATE INDEX IF NOT EXISTS rivalries_a_idx ON public.rivalries (user_a_id, last_played_at DESC);
CREATE INDEX IF NOT EXISTS rivalries_b_idx ON public.rivalries (user_b_id, last_played_at DESC);
GRANT SELECT ON public.rivalries TO anon, authenticated;
GRANT ALL ON public.rivalries TO service_role;
ALTER TABLE public.rivalries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rivalries are public" ON public.rivalries FOR SELECT USING (true);

-- 5) Trigger: after online game finishes, insert match_story + upsert rivalry
CREATE OR REPLACE FUNCTION public.tg_feed_and_rivalry_on_game_end()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  a UUID; b UUID;
  winner_id UUID;
  loser_id UUID;
  is_draw BOOLEAN := false;
  a_wins_delta INT := 0;
  b_wins_delta INT := 0;
  draws_delta INT := 0;
  new_streak_holder UUID;
  new_streak_count INT;
  existing RECORD;
BEGIN
  IF NEW.status <> 'finished' OR COALESCE(OLD.status,'') = 'finished' THEN
    RETURN NEW;
  END IF;

  IF NEW.result = '1-0' THEN
    winner_id := NEW.white_player_id;
    loser_id  := NEW.black_player_id;
  ELSIF NEW.result = '0-1' THEN
    winner_id := NEW.black_player_id;
    loser_id  := NEW.white_player_id;
  ELSE
    is_draw := true;
  END IF;

  -- Feed items: one story for each player
  INSERT INTO public.feed_items (user_id, kind, payload)
  VALUES (
    NEW.white_player_id,
    'match_story',
    jsonb_build_object(
      'game_id', NEW.id,
      'color', 'white',
      'opponent_id', NEW.black_player_id,
      'result', NEW.result,
      'time_control', NEW.time_control_label,
      'end_reason', NEW.end_reason,
      'move_number', NEW.move_number
    )
  );
  INSERT INTO public.feed_items (user_id, kind, payload)
  VALUES (
    NEW.black_player_id,
    'match_story',
    jsonb_build_object(
      'game_id', NEW.id,
      'color', 'black',
      'opponent_id', NEW.white_player_id,
      'result', NEW.result,
      'time_control', NEW.time_control_label,
      'end_reason', NEW.end_reason,
      'move_number', NEW.move_number
    )
  );

  -- Rivalry upsert (deterministic pair)
  IF NEW.white_player_id = NEW.black_player_id THEN
    RETURN NEW; -- guard
  END IF;

  IF NEW.white_player_id < NEW.black_player_id THEN
    a := NEW.white_player_id; b := NEW.black_player_id;
  ELSE
    a := NEW.black_player_id; b := NEW.white_player_id;
  END IF;

  IF is_draw THEN
    draws_delta := 1;
  ELSIF winner_id = a THEN
    a_wins_delta := 1;
  ELSE
    b_wins_delta := 1;
  END IF;

  SELECT * INTO existing FROM public.rivalries WHERE user_a_id = a AND user_b_id = b;
  IF NOT FOUND THEN
    IF is_draw THEN
      new_streak_holder := NULL; new_streak_count := 0;
    ELSE
      new_streak_holder := winner_id; new_streak_count := 1;
    END IF;
    INSERT INTO public.rivalries (
      user_a_id, user_b_id, wins_a, wins_b, draws, total_games,
      last_played_at, last_result, streak_holder_id, streak_count, updated_at
    ) VALUES (
      a, b, a_wins_delta, b_wins_delta, draws_delta, 1,
      now(), NEW.result, new_streak_holder, new_streak_count, now()
    );
  ELSE
    IF is_draw THEN
      new_streak_holder := existing.streak_holder_id; new_streak_count := existing.streak_count;
    ELSIF existing.streak_holder_id = winner_id THEN
      new_streak_holder := winner_id; new_streak_count := existing.streak_count + 1;
    ELSE
      new_streak_holder := winner_id; new_streak_count := 1;
    END IF;

    UPDATE public.rivalries SET
      wins_a = wins_a + a_wins_delta,
      wins_b = wins_b + b_wins_delta,
      draws = draws + draws_delta,
      total_games = total_games + 1,
      last_played_at = now(),
      last_result = NEW.result,
      streak_holder_id = new_streak_holder,
      streak_count = new_streak_count,
      updated_at = now()
    WHERE user_a_id = a AND user_b_id = b;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_feed_and_rivalry_on_game_end ON public.online_games;
CREATE TRIGGER trg_feed_and_rivalry_on_game_end
  AFTER UPDATE ON public.online_games
  FOR EACH ROW
  WHEN (NEW.status = 'finished' AND OLD.status <> 'finished')
  EXECUTE FUNCTION public.tg_feed_and_rivalry_on_game_end();

-- 6) reaction/comment counters
CREATE OR REPLACE FUNCTION public.tg_feed_counters()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'feed_reactions' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.feed_items SET reaction_count = reaction_count + 1 WHERE id = NEW.feed_item_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.feed_items SET reaction_count = GREATEST(reaction_count - 1, 0) WHERE id = OLD.feed_item_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'feed_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.feed_items SET comment_count = comment_count + 1 WHERE id = NEW.feed_item_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.feed_items SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.feed_item_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_feed_reactions_count ON public.feed_reactions;
CREATE TRIGGER trg_feed_reactions_count
  AFTER INSERT OR DELETE ON public.feed_reactions
  FOR EACH ROW EXECUTE FUNCTION public.tg_feed_counters();

DROP TRIGGER IF EXISTS trg_feed_comments_count ON public.feed_comments;
CREATE TRIGGER trg_feed_comments_count
  AFTER INSERT OR DELETE ON public.feed_comments
  FOR EACH ROW EXECUTE FUNCTION public.tg_feed_counters();

-- 7) realtime for reactions and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_items;
