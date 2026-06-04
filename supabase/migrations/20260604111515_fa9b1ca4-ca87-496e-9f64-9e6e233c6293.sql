
-- 1. Spectator bets: forbid direct client INSERTs; only the SECURITY DEFINER
--    place_spectator_bet RPC (which deducts coins atomically) may write rows.
DROP POLICY IF EXISTS "Users place own bets" ON public.spectator_bets;
CREATE POLICY "Service role only inserts bets"
  ON public.spectator_bets
  FOR INSERT
  TO service_role
  WITH CHECK (true);
GRANT EXECUTE ON FUNCTION public.place_spectator_bet(uuid, text, integer, numeric) TO authenticated;

-- 2. Stream chat messages: server-authoritative role/highlight.
CREATE OR REPLACE FUNCTION public._stream_force_role_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_tier text;
BEGIN
  SELECT tier INTO sub_tier
  FROM public.stream_subscriptions
  WHERE user_id = NEW.user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  NEW.role := COALESCE(sub_tier, 'free');
  NEW.is_highlighted := (sub_tier IS NOT NULL);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_stream_chat_force_role ON public.stream_chat_messages;
CREATE TRIGGER trg_stream_chat_force_role
  BEFORE INSERT OR UPDATE ON public.stream_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public._stream_force_role_chat();

-- 3. Stream queue: server-authoritative role + priority.
CREATE OR REPLACE FUNCTION public._stream_force_role_queue()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_tier text;
BEGIN
  SELECT tier INTO sub_tier
  FROM public.stream_subscriptions
  WHERE user_id = NEW.user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  NEW.role := COALESCE(sub_tier, 'free');
  NEW.priority := CASE COALESCE(sub_tier, 'free')
    WHEN 'vip'       THEN 1000
    WHEN 'premium'   THEN 500
    WHEN 'pro'       THEN 250
    WHEN 'supporter' THEN 100
    ELSE 0
  END;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_stream_queue_force_role ON public.stream_queue;
CREATE TRIGGER trg_stream_queue_force_role
  BEFORE INSERT OR UPDATE ON public.stream_queue
  FOR EACH ROW EXECUTE FUNCTION public._stream_force_role_queue();

-- 4. Contact messages: add length CHECK constraints to mitigate abuse.
ALTER TABLE public.contact_messages
  ADD CONSTRAINT contact_messages_name_len CHECK (char_length(name) BETWEEN 1 AND 120),
  ADD CONSTRAINT contact_messages_email_len CHECK (char_length(email) BETWEEN 3 AND 255),
  ADD CONSTRAINT contact_messages_message_len CHECK (char_length(message) BETWEEN 1 AND 4000);

-- 5. Online game moves: allow spectator/public reads of move log
--    (consistent with online_games being publicly spectatable when active/finished).
CREATE POLICY "Public can view moves of active or finished games"
  ON public.online_game_moves
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.online_games g
      WHERE g.id = online_game_moves.game_id
        AND g.status IN ('active', 'finished')
    )
  );
GRANT SELECT ON public.online_game_moves TO anon;
