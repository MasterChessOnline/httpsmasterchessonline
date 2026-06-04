
-- Queue
CREATE TABLE public.battle_royale_queue (
  user_id uuid PRIMARY KEY,
  joined_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.battle_royale_queue TO authenticated;
GRANT ALL ON public.battle_royale_queue TO service_role;
ALTER TABLE public.battle_royale_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "br_queue_view_all" ON public.battle_royale_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "br_queue_leave_self" ON public.battle_royale_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Sessions
CREATE TABLE public.battle_royale_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  winner_id uuid
);
GRANT SELECT ON public.battle_royale_sessions TO authenticated;
GRANT ALL ON public.battle_royale_sessions TO service_role;
ALTER TABLE public.battle_royale_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "br_sessions_view_all" ON public.battle_royale_sessions FOR SELECT TO authenticated USING (true);

-- Matches
CREATE TABLE public.battle_royale_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.battle_royale_sessions(id) ON DELETE CASCADE,
  round int NOT NULL,        -- 1=quarters, 2=semis, 3=final
  slot int NOT NULL,         -- position within the round
  player_a uuid,
  player_b uuid,
  winner_id uuid,
  status text NOT NULL DEFAULT 'pending',  -- pending|done
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, round, slot)
);
GRANT SELECT ON public.battle_royale_matches TO authenticated;
GRANT ALL ON public.battle_royale_matches TO service_role;
ALTER TABLE public.battle_royale_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "br_matches_view_all" ON public.battle_royale_matches FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_br_matches_session ON public.battle_royale_matches(session_id, round, slot);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_royale_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_royale_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_royale_matches;

-- Join Royale RPC
CREATE OR REPLACE FUNCTION public.join_battle_royale()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user uuid := auth.uid();
  _count int;
  _players uuid[];
  _session uuid;
  _i int;
BEGIN
  IF _user IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;

  INSERT INTO public.battle_royale_queue(user_id) VALUES (_user)
  ON CONFLICT (user_id) DO NOTHING;

  LOCK TABLE public.battle_royale_queue IN EXCLUSIVE MODE;
  SELECT COUNT(*) INTO _count FROM public.battle_royale_queue;

  IF _count < 8 THEN
    RETURN jsonb_build_object('ok', true, 'queued', true, 'queue_count', _count, 'needed', 8 - _count);
  END IF;

  -- Take the 8 longest-waiting players
  SELECT ARRAY(
    SELECT user_id FROM public.battle_royale_queue ORDER BY joined_at ASC LIMIT 8
  ) INTO _players;

  DELETE FROM public.battle_royale_queue WHERE user_id = ANY(_players);

  -- Shuffle deterministically with random ordering
  SELECT ARRAY(SELECT u FROM unnest(_players) u ORDER BY random()) INTO _players;

  INSERT INTO public.battle_royale_sessions(status) VALUES ('active') RETURNING id INTO _session;

  -- Create 4 quarterfinal matches
  FOR _i IN 1..4 LOOP
    INSERT INTO public.battle_royale_matches(session_id, round, slot, player_a, player_b)
    VALUES (_session, 1, _i, _players[_i * 2 - 1], _players[_i * 2]);
  END LOOP;

  -- Empty semi + final placeholders
  INSERT INTO public.battle_royale_matches(session_id, round, slot) VALUES (_session, 2, 1), (_session, 2, 2), (_session, 3, 1);

  RETURN jsonb_build_object('ok', true, 'session_id', _session, 'queue_count', 0);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.join_battle_royale() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_battle_royale() TO authenticated;

-- Report winner RPC
CREATE OR REPLACE FUNCTION public.report_battle_royale_winner(_match uuid, _winner uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user uuid := auth.uid();
  _m public.battle_royale_matches%ROWTYPE;
  _session uuid;
  _next_round int;
  _next_slot int;
  _sibling_winner uuid;
  _sibling_status text;
  _new_balance int;
BEGIN
  IF _user IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;

  SELECT * INTO _m FROM public.battle_royale_matches WHERE id = _match;
  IF _m.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'match_not_found'); END IF;
  IF _m.status = 'done' THEN RETURN jsonb_build_object('ok', false, 'error', 'already_done'); END IF;
  IF _user <> _m.player_a AND _user <> _m.player_b THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_participant');
  END IF;
  IF _winner <> _m.player_a AND _winner <> _m.player_b THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_winner');
  END IF;

  UPDATE public.battle_royale_matches
  SET winner_id = _winner, status = 'done'
  WHERE id = _match;

  _session := _m.session_id;

  IF _m.round = 3 THEN
    -- Final: crown champion, award coins
    UPDATE public.battle_royale_sessions
    SET status = 'finished', finished_at = now(), winner_id = _winner
    WHERE id = _session;

    UPDATE public.profiles SET master_coins = master_coins + 500
    WHERE user_id = _winner RETURNING master_coins INTO _new_balance;

    RETURN jsonb_build_object('ok', true, 'champion', true, 'reward', 500, 'new_balance', _new_balance);
  END IF;

  -- Advance: feed into next round
  _next_round := _m.round + 1;
  _next_slot  := ((_m.slot - 1) / 2) + 1;

  -- Determine whether we are the "a" or "b" feeder (odd slot = a, even slot = b)
  IF _m.slot % 2 = 1 THEN
    UPDATE public.battle_royale_matches SET player_a = _winner
    WHERE session_id = _session AND round = _next_round AND slot = _next_slot;
  ELSE
    UPDATE public.battle_royale_matches SET player_b = _winner
    WHERE session_id = _session AND round = _next_round AND slot = _next_slot;
  END IF;

  RETURN jsonb_build_object('ok', true, 'advanced', true, 'next_round', _next_round, 'next_slot', _next_slot);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.report_battle_royale_winner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_battle_royale_winner(uuid, uuid) TO authenticated;
