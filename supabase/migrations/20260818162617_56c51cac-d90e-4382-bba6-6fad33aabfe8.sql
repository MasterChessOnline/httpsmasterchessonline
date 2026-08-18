CREATE OR REPLACE FUNCTION public.claim_queue_opponent(p_time_control_label text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_opp uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  WITH cand AS (
    SELECT q.id
    FROM public.matchmaking_queue q
    WHERE q.time_control_label = p_time_control_label
      AND q.user_id <> v_uid
    ORDER BY q.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  DELETE FROM public.matchmaking_queue q
  USING cand
  WHERE q.id = cand.id
  RETURNING q.user_id INTO v_opp;

  IF v_opp IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_opponent');
  END IF;

  RETURN jsonb_build_object('ok', true, 'opponent_id', v_opp);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_queue_opponent(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_queue_opponent(text) TO authenticated;