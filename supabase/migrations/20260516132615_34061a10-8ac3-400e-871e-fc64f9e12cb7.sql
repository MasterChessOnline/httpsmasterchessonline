
-- 1. Add difficulty column with constraint
ALTER TABLE public.daily_missions
  ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'easy';

DO $$ BEGIN
  ALTER TABLE public.daily_missions
    ADD CONSTRAINT daily_missions_difficulty_chk
    CHECK (difficulty IN ('easy','medium','hard','elite'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.daily_missions
    ADD CONSTRAINT daily_missions_key_unique UNIQUE (key);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Replace pool with 20 missions across 4 tiers
DELETE FROM public.daily_missions;

INSERT INTO public.daily_missions (key, title, description, icon, mission_type, target_value, xp_reward, is_active, sort_order, difficulty) VALUES
  -- EASY (1)
  ('easy_play_1',       'Warm Up',          'Play 1 online game today.',                    'swords',    'games_played',   1, 25, true, 1, 'easy'),
  ('easy_lesson_1',     'Quick Study',      'Open 1 lesson today.',                         'book-open', 'lesson_visited', 1, 30, true, 1, 'easy'),
  ('easy_bot_1',        'Bot Sparring',     'Beat 1 bot today.',                            'bot',       'bot_won',        1, 30, true, 1, 'easy'),
  ('easy_play_2',       'Two for Tea',      'Play 2 online games today.',                   'swords',    'games_played',   2, 35, true, 1, 'easy'),
  ('easy_win_1',        'First Blood',      'Win 1 game today.',                            'trophy',    'games_won',      1, 40, true, 1, 'easy'),

  -- MEDIUM (2)
  ('med_play_3',        'Player of the Day','Play 3 online games today.',                   'swords',    'games_played',   3, 60, true, 2, 'medium'),
  ('med_win_2',         'Double Up',        'Win 2 games today.',                           'trophy',    'games_won',      2, 75, true, 2, 'medium'),
  ('med_bot_2',         'Bot Hunter',       'Beat 2 bots today.',                           'bot',       'bot_won',        2, 70, true, 2, 'medium'),
  ('med_lesson_2',      'Curious Mind',     'Open 2 lessons today.',                        'book-open', 'lesson_visited', 2, 60, true, 2, 'medium'),
  ('med_play_4',        'Grinder',          'Play 4 online games today.',                   'swords',    'games_played',   4, 75, true, 2, 'medium'),

  -- HARD (3)
  ('hard_win_3',        'Triple Threat',    'Win 3 games today.',                           'trophy',    'games_won',      3, 110, true, 3, 'hard'),
  ('hard_play_6',       'Marathon',         'Play 6 online games today.',                   'swords',    'games_played',   6, 120, true, 3, 'hard'),
  ('hard_bot_3',        'Bot Slayer',       'Beat 3 bots today.',                           'bot',       'bot_won',        3, 110, true, 3, 'hard'),
  ('hard_streak_2',     'On a Roll',        'Win 2 games in a row today.',                  'flame',     'win_streak',     2, 130, true, 3, 'hard'),
  ('hard_lesson_3',     'Scholar',          'Open 3 lessons today.',                        'book-open', 'lesson_visited', 3, 100, true, 3, 'hard'),

  -- ELITE (4)
  ('elite_win_5',       'Conqueror',        'Win 5 games today.',                           'trophy',    'games_won',      5, 200, true, 4, 'elite'),
  ('elite_play_10',     'Iron Will',        'Play 10 online games today.',                  'swords',    'games_played',  10, 220, true, 4, 'elite'),
  ('elite_streak_3',    'Hot Streak',       'Win 3 games in a row today.',                  'flame',     'win_streak',     3, 250, true, 4, 'elite'),
  ('elite_bot_5',       'Engine Crusher',   'Beat 5 bots today.',                           'bot',       'bot_won',        5, 200, true, 4, 'elite'),
  ('elite_win_4',       'Champion',         'Win 4 games today.',                           'trophy',    'games_won',      4, 180, true, 4, 'elite');

-- 3. Deterministic per-day rotation: pick one mission per difficulty by date
CREATE OR REPLACE FUNCTION public.get_today_missions(p_date date DEFAULT (now() AT TIME ZONE 'UTC')::date)
RETURNS TABLE(
  id uuid,
  key text,
  title text,
  description text,
  icon text,
  mission_type text,
  target_value integer,
  xp_reward integer,
  sort_order integer,
  difficulty text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      m.*,
      ROW_NUMBER() OVER (PARTITION BY m.difficulty ORDER BY m.key) - 1 AS idx,
      COUNT(*) OVER (PARTITION BY m.difficulty) AS bucket_size
    FROM public.daily_missions m
    WHERE m.is_active = true
  ),
  picked AS (
    SELECT difficulty,
           ((EXTRACT(EPOCH FROM p_date::timestamp)::bigint / 86400)
             + CASE difficulty WHEN 'easy' THEN 0 WHEN 'medium' THEN 7 WHEN 'hard' THEN 13 WHEN 'elite' THEN 19 ELSE 0 END
           )::bigint % MAX(bucket_size) AS pick_idx
    FROM ranked
    GROUP BY difficulty
  )
  SELECT r.id, r.key, r.title, r.description, r.icon, r.mission_type,
         r.target_value, r.xp_reward, r.sort_order, r.difficulty
  FROM ranked r
  JOIN picked p ON p.difficulty = r.difficulty AND p.pick_idx = r.idx
  ORDER BY CASE r.difficulty
    WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 WHEN 'elite' THEN 4 ELSE 5 END;
$$;

GRANT EXECUTE ON FUNCTION public.get_today_missions(date) TO anon, authenticated;
