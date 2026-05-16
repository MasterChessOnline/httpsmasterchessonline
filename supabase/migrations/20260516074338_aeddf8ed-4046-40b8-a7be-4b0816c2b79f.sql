
-- Referral tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code text NOT NULL,
  referrer_user_id uuid,
  referred_user_id uuid,
  visitor_fingerprint text,
  status text NOT NULL DEFAULT 'visited',
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  converted_at timestamptz
);

CREATE INDEX IF NOT EXISTS referrals_ref_code_idx ON public.referrals (ref_code);
CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON public.referrals (referrer_user_id);
CREATE INDEX IF NOT EXISTS referrals_referred_idx ON public.referrals (referred_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS referrals_visit_unique
  ON public.referrals (ref_code, visitor_fingerprint)
  WHERE status = 'visited' AND visitor_fingerprint IS NOT NULL;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view their referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_user_id);

-- Resolve a ref_code (first 8 chars of user uuid) → user_id
CREATE OR REPLACE FUNCTION public.resolve_ref_code(_ref_code text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT user_id FROM public.profiles
  WHERE LEFT(user_id::text, 8) = LOWER(_ref_code)
  LIMIT 1;
$$;

-- Anyone (anon) can call this to log a click. Idempotent per (ref_code, fingerprint).
CREATE OR REPLACE FUNCTION public.track_referral_visit(
  p_ref_code text,
  p_fingerprint text,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_referrer uuid;
BEGIN
  IF p_ref_code IS NULL OR length(p_ref_code) < 4 THEN RETURN; END IF;
  v_referrer := public.resolve_ref_code(p_ref_code);
  IF v_referrer IS NULL THEN RETURN; END IF;

  INSERT INTO public.referrals (ref_code, referrer_user_id, visitor_fingerprint, user_agent, status)
  VALUES (LOWER(p_ref_code), v_referrer, p_fingerprint, p_user_agent, 'visited')
  ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_referral_visit(text, text, text) TO anon, authenticated;

-- Called from client after signup to attribute a converting user.
CREATE OR REPLACE FUNCTION public.claim_referral_signup(p_ref_code text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_referrer uuid;
BEGIN
  IF v_uid IS NULL OR p_ref_code IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  v_referrer := public.resolve_ref_code(p_ref_code);
  IF v_referrer IS NULL OR v_referrer = v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_referrer');
  END IF;
  -- Don't double-attribute the same user
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_user_id = v_uid) THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;
  INSERT INTO public.referrals (ref_code, referrer_user_id, referred_user_id, status, converted_at)
  VALUES (LOWER(p_ref_code), v_referrer, v_uid, 'signed_up', now());
  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_referral_signup(text) TO authenticated;

-- Stats for the current user
CREATE OR REPLACE FUNCTION public.my_referral_stats()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'visits',  COUNT(*) FILTER (WHERE status = 'visited'),
    'signups', COUNT(*) FILTER (WHERE status IN ('signed_up','first_game')),
    'first_games', COUNT(*) FILTER (WHERE status = 'first_game')
  )
  FROM public.referrals
  WHERE referrer_user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.my_referral_stats() TO authenticated;
