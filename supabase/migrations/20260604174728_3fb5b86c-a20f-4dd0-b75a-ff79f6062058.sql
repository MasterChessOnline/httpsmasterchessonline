
-- 1) win_streaks: remove user write policies, add server-only RPC
DROP POLICY IF EXISTS "Users can insert own streak" ON public.win_streaks;
DROP POLICY IF EXISTS "Users can update own streak" ON public.win_streaks;

CREATE OR REPLACE FUNCTION public.bump_win_streak(p_rating_type text, p_result text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  prev record;
  cur integer := 0;
  best integer := 0;
  loss integer := 0;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_rating_type NOT IN ('online','bot') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_rating_type');
  END IF;
  IF p_result NOT IN ('win','loss','draw') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_result');
  END IF;

  SELECT current_streak, best_streak, loss_streak
    INTO prev
    FROM public.win_streaks
    WHERE user_id = caller AND rating_type = p_rating_type
    FOR UPDATE;

  cur  := COALESCE(prev.current_streak, 0);
  best := COALESCE(prev.best_streak, 0);
  loss := COALESCE(prev.loss_streak, 0);

  IF p_result = 'win' THEN
    cur  := cur + 1;
    loss := 0;
  ELSIF p_result = 'loss' THEN
    cur  := 0;
    loss := loss + 1;
  ELSE
    cur  := 0;
  END IF;
  IF cur > best THEN best := cur; END IF;

  INSERT INTO public.win_streaks (
    user_id, rating_type, current_streak, best_streak, loss_streak, last_result, updated_at
  ) VALUES (
    caller, p_rating_type, cur, best, loss, p_result, now()
  )
  ON CONFLICT (user_id, rating_type) DO UPDATE
    SET current_streak = EXCLUDED.current_streak,
        best_streak    = EXCLUDED.best_streak,
        loss_streak    = EXCLUDED.loss_streak,
        last_result    = EXCLUDED.last_result,
        updated_at     = now();

  RETURN jsonb_build_object(
    'ok', true,
    'current_streak', cur,
    'best_streak', best,
    'loss_streak', loss,
    'last_result', p_result
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.bump_win_streak(text, text) TO authenticated;

-- 2) user_mission_progress: remove user write policies, add server-validated RPC
DROP POLICY IF EXISTS "Users insert own mission progress" ON public.user_mission_progress;
DROP POLICY IF EXISTS "Users update own mission progress" ON public.user_mission_progress;

CREATE OR REPLACE FUNCTION public.bump_mission_progress(
  p_mission_type text,
  p_amount integer DEFAULT 1,
  p_set_absolute integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  today date := (now() AT TIME ZONE 'UTC')::date;
  def record;
  existing record;
  base_val integer;
  new_val integer;
  is_done boolean;
  updated integer := 0;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_amount IS NULL OR p_amount < 0 OR p_amount > 1000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_amount');
  END IF;

  -- Only mutate missions in today's rotation that match the type
  FOR def IN
    SELECT m.key, m.target_value
      FROM public.get_today_missions(today) m
     WHERE m.mission_type = p_mission_type
  LOOP
    SELECT id, current_value, completed
      INTO existing
      FROM public.user_mission_progress
      WHERE user_id = caller
        AND mission_key = def.key
        AND mission_date = today
      FOR UPDATE;

    base_val := COALESCE(existing.current_value, 0);
    IF p_set_absolute IS NOT NULL THEN
      new_val := GREATEST(0, LEAST(p_set_absolute, def.target_value));
    ELSE
      new_val := LEAST(base_val + p_amount, def.target_value);
    END IF;
    is_done := new_val >= def.target_value;

    IF existing.id IS NULL THEN
      INSERT INTO public.user_mission_progress (
        user_id, mission_key, mission_date, current_value, completed, completed_at
      ) VALUES (
        caller, def.key, today, new_val, is_done,
        CASE WHEN is_done THEN now() ELSE NULL END
      );
      updated := updated + 1;
    ELSIF NOT existing.completed THEN
      UPDATE public.user_mission_progress
         SET current_value = new_val,
             completed = is_done,
             completed_at = CASE WHEN is_done THEN now() ELSE completed_at END
       WHERE id = existing.id;
      updated := updated + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'updated', updated);
END;
$$;
GRANT EXECUTE ON FUNCTION public.bump_mission_progress(text, integer, integer) TO authenticated;

-- 3) online_games: remove direct INSERT; creation must go through start_online_game RPC
DROP POLICY IF EXISTS "Authenticated users can insert games" ON public.online_games;

-- 4) stockfish_eval_cache: drop anonymous INSERT, keep authenticated INSERT only
DROP POLICY IF EXISTS "Anyone can add Stockfish eval cache" ON public.stockfish_eval_cache;

-- 5) contact_messages: tighten WITH CHECK to reject blank/garbage submissions
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit valid contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name))    BETWEEN 1 AND 120
    AND char_length(btrim(email)) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(btrim(message)) BETWEEN 1 AND 4000
  );
