
-- Draw offers table
CREATE TABLE IF NOT EXISTS public.online_draw_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.online_games(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending|accepted|declined|expired|cancelled
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_draw_offers_game ON public.online_draw_offers(game_id, status);

ALTER TABLE public.online_draw_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players see their game draw offers"
ON public.online_draw_offers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.online_games g
    WHERE g.id = game_id
      AND (g.white_player_id = auth.uid() OR g.black_player_id = auth.uid())
  )
);

-- Game presence heartbeat
CREATE TABLE IF NOT EXISTS public.online_game_presence (
  game_id uuid NOT NULL REFERENCES public.online_games(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_seen timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (game_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_game_presence_seen ON public.online_game_presence(last_seen);

ALTER TABLE public.online_game_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players see presence in their games"
ON public.online_game_presence FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.online_games g
    WHERE g.id = game_id
      AND (g.white_player_id = auth.uid() OR g.black_player_id = auth.uid())
  )
);

-- ===== RPCs =====

CREATE OR REPLACE FUNCTION public.offer_draw(p_game_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  g record;
  existing record;
  new_id uuid;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  SELECT * INTO g FROM public.online_games WHERE id = p_game_id;
  IF NOT FOUND OR g.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_active');
  END IF;
  IF caller <> g.white_player_id AND caller <> g.black_player_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;
  -- Cancel existing pending offers from this user
  UPDATE public.online_draw_offers
    SET status = 'cancelled', resolved_at = now()
    WHERE game_id = p_game_id AND from_user_id = caller AND status = 'pending';
  -- Check opponent already pending? Auto-accept agreement.
  SELECT * INTO existing FROM public.online_draw_offers
    WHERE game_id = p_game_id AND status = 'pending' AND from_user_id <> caller
    ORDER BY created_at DESC LIMIT 1;
  IF FOUND AND existing.created_at > now() - interval '30 seconds' THEN
    UPDATE public.online_draw_offers SET status = 'accepted', resolved_at = now() WHERE id = existing.id;
    PERFORM public.finalize_online_game(p_game_id, '1/2-1/2', 'agreement');
    RETURN jsonb_build_object('ok', true, 'auto_accepted', true);
  END IF;
  INSERT INTO public.online_draw_offers (game_id, from_user_id)
    VALUES (p_game_id, caller) RETURNING id INTO new_id;
  RETURN jsonb_build_object('ok', true, 'offer_id', new_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_draw_offer(p_offer_id uuid, p_accept boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  o record;
  g record;
BEGIN
  SELECT * INTO o FROM public.online_draw_offers WHERE id = p_offer_id FOR UPDATE;
  IF NOT FOUND OR o.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_pending');
  END IF;
  SELECT * INTO g FROM public.online_games WHERE id = o.game_id;
  IF g.white_player_id <> caller AND g.black_player_id <> caller THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;
  IF o.from_user_id = caller THEN
    RETURN jsonb_build_object('ok', false, 'error', 'own_offer');
  END IF;
  IF o.created_at < now() - interval '60 seconds' THEN
    UPDATE public.online_draw_offers SET status='expired', resolved_at=now() WHERE id=p_offer_id;
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;
  IF p_accept THEN
    UPDATE public.online_draw_offers SET status='accepted', resolved_at=now() WHERE id=p_offer_id;
    PERFORM public.finalize_online_game(o.game_id, '1/2-1/2', 'agreement');
    RETURN jsonb_build_object('ok', true, 'accepted', true);
  ELSE
    UPDATE public.online_draw_offers SET status='declined', resolved_at=now() WHERE id=p_offer_id;
    RETURN jsonb_build_object('ok', true, 'accepted', false);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.heartbeat_online_game(p_game_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
BEGIN
  IF caller IS NULL THEN RETURN; END IF;
  INSERT INTO public.online_game_presence (game_id, user_id, last_seen)
  VALUES (p_game_id, caller, now())
  ON CONFLICT (game_id, user_id) DO UPDATE SET last_seen = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_afk_win(p_game_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  g record;
  opp uuid;
  opp_seen timestamptz;
  result_str text;
  end_reason_str text;
BEGIN
  SELECT * INTO g FROM public.online_games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND OR g.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_active');
  END IF;
  IF caller <> g.white_player_id AND caller <> g.black_player_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_player');
  END IF;
  opp := CASE WHEN caller = g.white_player_id THEN g.black_player_id ELSE g.white_player_id END;
  SELECT last_seen INTO opp_seen FROM public.online_game_presence WHERE game_id = p_game_id AND user_id = opp;
  IF opp_seen IS NULL OR opp_seen > now() - interval '45 seconds' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'opponent_present');
  END IF;
  result_str := CASE WHEN caller = g.white_player_id THEN '1-0' ELSE '0-1' END;
  end_reason_str := 'abandonment';
  PERFORM public.finalize_online_game(p_game_id, result_str, end_reason_str);
  RETURN jsonb_build_object('ok', true, 'result', result_str);
END;
$$;
