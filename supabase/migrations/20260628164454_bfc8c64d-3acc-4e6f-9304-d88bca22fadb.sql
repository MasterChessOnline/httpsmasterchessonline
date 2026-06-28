
-- 1. Profiles: revoke sensitive columns from anon & authenticated
REVOKE SELECT (first_name, last_name, birth_year, map_lat, map_lng) ON public.profiles FROM anon;
REVOKE SELECT (first_name, last_name, birth_year, map_lat, map_lng) ON public.profiles FROM authenticated;

CREATE OR REPLACE FUNCTION public.get_my_private_profile()
RETURNS TABLE(first_name text, last_name text, birth_year int, map_lat numeric, map_lng numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT first_name, last_name, birth_year, map_lat, map_lng
  FROM public.profiles WHERE user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_private_profile() TO authenticated;

-- 2. Tournament registrations: revoke birth_year, fide_id from anon & authenticated
REVOKE SELECT (birth_year, fide_id) ON public.tournament_registrations FROM anon;
REVOKE SELECT (birth_year, fide_id) ON public.tournament_registrations FROM authenticated;

CREATE OR REPLACE FUNCTION public.get_my_tournament_registration(_tournament_id uuid)
RETURNS TABLE(birth_year int, fide_id text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT birth_year, fide_id
  FROM public.tournament_registrations
  WHERE tournament_id = _tournament_id AND user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_tournament_registration(uuid) TO authenticated;

-- 3. feature_votes: authenticated-only SELECT
DROP POLICY IF EXISTS "Votes public read" ON public.feature_votes;
CREATE POLICY "Authenticated read feature votes"
  ON public.feature_votes FOR SELECT
  TO authenticated
  USING (true);

-- 4. stream_donations: authenticated-only SELECT
DROP POLICY IF EXISTS "Anyone can view donations" ON public.stream_donations;
CREATE POLICY "Authenticated read stream donations"
  ON public.stream_donations FOR SELECT
  TO authenticated
  USING (true);

-- 5. Fix function search_path
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- 6. Contact form rate limit (max 3 inserts/hour per email)
CREATE OR REPLACE FUNCTION public.contact_messages_rate_limit()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE recent_count int;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.contact_messages
  WHERE lower(email) = lower(NEW.email)
    AND created_at > now() - interval '1 hour';
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many contact submissions. Please try again later.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_messages_rate_limit_trg ON public.contact_messages;
CREATE TRIGGER contact_messages_rate_limit_trg
  BEFORE INSERT ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.contact_messages_rate_limit();
