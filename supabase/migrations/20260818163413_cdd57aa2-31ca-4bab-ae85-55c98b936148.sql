-- 1. OPEN CHALLENGES (seek lobby)
CREATE TABLE IF NOT EXISTS public.open_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  creator_name text,
  creator_rating integer NOT NULL DEFAULT 1200,
  time_control_label text NOT NULL DEFAULT '5+0',
  base_seconds integer NOT NULL DEFAULT 300,
  increment integer NOT NULL DEFAULT 0,
  is_rated boolean NOT NULL DEFAULT true,
  color_pref text NOT NULL DEFAULT 'random',
  status text NOT NULL DEFAULT 'open',
  game_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes')
);

CREATE INDEX IF NOT EXISTS open_challenges_open_idx ON public.open_challenges (status, created_at DESC);
CREATE INDEX IF NOT EXISTS open_challenges_creator_idx ON public.open_challenges (creator_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.open_challenges TO authenticated;
GRANT SELECT ON public.open_challenges TO anon;
GRANT ALL ON public.open_challenges TO service_role;

ALTER TABLE public.open_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open challenges"
  ON public.open_challenges FOR SELECT USING (true);

CREATE POLICY "Users create own challenges"
  ON public.open_challenges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users update own challenges"
  ON public.open_challenges FOR UPDATE TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Users delete own challenges"
  ON public.open_challenges FOR DELETE TO authenticated
  USING (auth.uid() = creator_id);

-- 2. REMATCH OFFERS (survives page refresh, unlike chat-message signalling)
CREATE TABLE IF NOT EXISTS public.rematch_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_game_id uuid NOT NULL,
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  new_game_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS rematch_offers_unique_idx
  ON public.rematch_offers (source_game_id, from_user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rematch_offers TO authenticated;
GRANT ALL ON public.rematch_offers TO service_role;

ALTER TABLE public.rematch_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view rematch offers"
  ON public.rematch_offers FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users create own rematch offers"
  ON public.rematch_offers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Participants update rematch offers"
  ON public.rematch_offers FOR UPDATE TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- 3. Atomic accept of an open challenge -> creates the game
CREATE OR REPLACE FUNCTION public.accept_open_challenge(_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ch public.open_challenges;
  me uuid := auth.uid();
  new_game uuid;
  white uuid;
  black uuid;
BEGIN
  IF me IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  END IF;

  SELECT * INTO ch
  FROM public.open_challenges
  WHERE id = _challenge_id AND status = 'open' AND expires_at > now()
  FOR UPDATE SKIP LOCKED;

  IF ch.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unavailable');
  END IF;

  IF ch.creator_id = me THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'own_challenge');
  END IF;

  IF ch.color_pref = 'white' THEN
    white := ch.creator_id; black := me;
  ELSIF ch.color_pref = 'black' THEN
    white := me; black := ch.creator_id;
  ELSIF random() < 0.5 THEN
    white := ch.creator_id; black := me;
  ELSE
    white := me; black := ch.creator_id;
  END IF;

  INSERT INTO public.online_games (
    white_player_id, black_player_id, white_time, black_time,
    increment, time_control_label, is_rated, status
  ) VALUES (
    white, black, ch.base_seconds, ch.base_seconds,
    ch.increment, ch.time_control_label, ch.is_rated, 'active'
  ) RETURNING id INTO new_game;

  UPDATE public.open_challenges
  SET status = 'matched', game_id = new_game
  WHERE id = ch.id;

  DELETE FROM public.matchmaking_queue WHERE user_id IN (me, ch.creator_id);

  RETURN jsonb_build_object('ok', true, 'game_id', new_game);
END;
$$;

REVOKE ALL ON FUNCTION public.accept_open_challenge(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_open_challenge(uuid) TO authenticated;

-- 4. Expire stale challenges + flag flagged-on-time / abandoned games
CREATE OR REPLACE FUNCTION public.expire_online_games()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  timed_out integer := 0;
  aborted integer := 0;
  stale integer := 0;
BEGIN
  UPDATE public.open_challenges
  SET status = 'expired'
  WHERE status = 'open' AND expires_at <= now();
  stale := ROW_COUNT_HACK_NOOP();
  RETURN jsonb_build_object('ok', true);
END;
$$;

DROP FUNCTION IF EXISTS public.expire_online_games();

CREATE OR REPLACE FUNCTION public.expire_online_games()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n_stale integer := 0;
  n_timeout integer := 0;
  n_abort integer := 0;
BEGIN
  -- stale seeks
  WITH s AS (
    UPDATE public.open_challenges SET status = 'expired'
    WHERE status = 'open' AND expires_at <= now()
    RETURNING 1
  ) SELECT count(*) INTO n_stale FROM s;

  -- never-started games older than 2 minutes with no move
  WITH a AS (
    UPDATE public.online_games
    SET status = 'aborted', end_reason = 'agreement', updated_at = now()
    WHERE status = 'active' AND move_number <= 1 AND last_move_at IS NULL
      AND created_at < now() - interval '2 minutes'
    RETURNING 1
  ) SELECT count(*) INTO n_abort FROM a;

  -- clock flagged: side to move ran out of time since the last move
  WITH t AS (
    UPDATE public.online_games g
    SET status = 'finished',
        end_reason = 'timeout',
        result = CASE WHEN g.turn = 'w' THEN '0-1' ELSE '1-0' END,
        white_time = CASE WHEN g.turn = 'w' THEN 0 ELSE g.white_time END,
        black_time = CASE WHEN g.turn = 'b' THEN 0 ELSE g.black_time END,
        updated_at = now()
    WHERE g.status = 'active'
      AND g.last_move_at IS NOT NULL
      AND EXTRACT(EPOCH FROM (now() - g.last_move_at)) >
          (CASE WHEN g.turn = 'w' THEN g.white_time ELSE g.black_time END) + 5
    RETURNING 1
  ) SELECT count(*) INTO n_timeout FROM t;

  -- drop abandoned queue entries
  DELETE FROM public.matchmaking_queue WHERE created_at < now() - interval '5 minutes';

  RETURN jsonb_build_object('ok', true, 'expired_seeks', n_stale, 'aborted', n_abort, 'timeouts', n_timeout);
END;
$$;

REVOKE ALL ON FUNCTION public.expire_online_games() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expire_online_games() TO authenticated, service_role;

-- 5. Realtime for the lobby and rematch offers
ALTER PUBLICATION supabase_realtime ADD TABLE public.open_challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rematch_offers;