CREATE OR REPLACE FUNCTION public.dismiss_game_invite(p_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv record;
BEGIN
  SELECT * INTO inv
  FROM public.game_invites
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', true, 'already_removed', true);
  END IF;

  IF auth.uid() IS NULL OR (auth.uid() <> inv.sender_id AND auth.uid() <> inv.recipient_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_allowed');
  END IF;

  IF inv.status = 'pending' AND inv.expires_at > now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'still_pending');
  END IF;

  DELETE FROM public.game_invites
  WHERE id = p_invite_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.dismiss_game_invite(uuid) TO authenticated;