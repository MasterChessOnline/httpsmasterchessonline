
-- Extend tournaments
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS external_results_url text,
  ADD COLUMN IF NOT EXISTS prize_kind text NOT NULL DEFAULT 'cash'
    CHECK (prize_kind IN ('cash','masterchess_loot','mixed'));

-- tournament_prizes
CREATE TABLE IF NOT EXISTS public.tournament_prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  place_from int NOT NULL,
  place_to int NOT NULL,
  label text NOT NULL,
  coins int NOT NULL DEFAULT 0,
  badge_key text,
  cosmetic_key text,
  is_special boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tournament_prizes TO anon, authenticated;
GRANT ALL ON public.tournament_prizes TO service_role;
ALTER TABLE public.tournament_prizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prizes are public" ON public.tournament_prizes FOR SELECT USING (true);
CREATE POLICY "Organizers manage prizes" ON public.tournament_prizes
  FOR ALL TO authenticated
  USING (public.can_manage_tournaments(auth.uid()))
  WITH CHECK (public.can_manage_tournaments(auth.uid()));

-- tournament_payouts
CREATE TABLE IF NOT EXISTS public.tournament_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  place int,
  coins int NOT NULL DEFAULT 0,
  badge_key text,
  cosmetic_key text,
  label text,
  paid_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);
GRANT SELECT ON public.tournament_payouts TO authenticated;
GRANT ALL ON public.tournament_payouts TO service_role;
ALTER TABLE public.tournament_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payouts visible to owner and admins" ON public.tournament_payouts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'::public.app_role));

-- tournament_sponsors
CREATE TABLE IF NOT EXISTS public.tournament_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  website text,
  tier text NOT NULL DEFAULT 'community'
    CHECK (tier IN ('title','gold','silver','community')),
  display_order int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tournament_sponsors TO anon, authenticated;
GRANT ALL ON public.tournament_sponsors TO service_role;
ALTER TABLE public.tournament_sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors public" ON public.tournament_sponsors FOR SELECT USING (true);
CREATE POLICY "Organizers manage sponsors" ON public.tournament_sponsors
  FOR ALL TO authenticated
  USING (public.can_manage_tournaments(auth.uid()))
  WITH CHECK (public.can_manage_tournaments(auth.uid()));

-- affiliates
CREATE TABLE IF NOT EXISTS public.affiliates (
  code text PRIMARY KEY,
  owner_user_id uuid,
  owner_name text NOT NULL,
  owner_email text,
  partner_tier text NOT NULL DEFAULT 'creator'
    CHECK (partner_tier IN ('founder','media','club','creator','sponsor')),
  commission_coins_per_signup int NOT NULL DEFAULT 200,
  commission_coins_per_tournament_join int NOT NULL DEFAULT 500,
  total_clicks int NOT NULL DEFAULT 0,
  total_signups int NOT NULL DEFAULT 0,
  total_joins int NOT NULL DEFAULT 0,
  total_coins_paid int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.affiliates TO anon, authenticated;
GRANT ALL ON public.affiliates TO service_role;
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Affiliate aggregate is public" ON public.affiliates FOR SELECT USING (true);
CREATE POLICY "Admins manage affiliates" ON public.affiliates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- Hide email column from public
REVOKE SELECT (owner_email) ON public.affiliates FROM anon;
REVOKE SELECT (owner_email) ON public.affiliates FROM authenticated;

-- affiliate_clicks (lightweight log)
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL REFERENCES public.affiliates(code) ON DELETE CASCADE,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.affiliate_clicks TO anon, authenticated;
GRANT SELECT, DELETE ON public.affiliate_clicks TO service_role;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone may log a click" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read clicks" ON public.affiliate_clicks
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.log_affiliate_click(_code text, _referrer text DEFAULT NULL, _ua text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.affiliates WHERE code = _code AND is_active = true) THEN
    RETURN;
  END IF;
  INSERT INTO public.affiliate_clicks (code, referrer, user_agent)
    VALUES (_code, NULLIF(LEFT(COALESCE(_referrer,''), 500), ''), NULLIF(LEFT(COALESCE(_ua,''), 300), ''));
  UPDATE public.affiliates SET total_clicks = total_clicks + 1, updated_at = now()
    WHERE code = _code;
END $$;
GRANT EXECUTE ON FUNCTION public.log_affiliate_click(text, text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_affiliate_public(_code text)
RETURNS TABLE(code text, owner_name text, partner_tier text, total_clicks int, total_signups int, total_joins int, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT code, owner_name, partner_tier, total_clicks, total_signups, total_joins, created_at
  FROM public.affiliates WHERE code = _code AND is_active = true
$$;
GRANT EXECUTE ON FUNCTION public.get_affiliate_public(text) TO anon, authenticated;

-- media_outreach
CREATE TABLE IF NOT EXISTS public.media_outreach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet text NOT NULL,
  contact_name text,
  contact_email text,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','sent','opened','replied','published','rejected')),
  pitch_url text,
  notes text,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.media_outreach TO authenticated;
GRANT ALL ON public.media_outreach TO service_role;
ALTER TABLE public.media_outreach ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage outreach" ON public.media_outreach
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- updated_at trigger
CREATE TRIGGER affiliates_touch BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER media_outreach_touch BEFORE UPDATE ON public.media_outreach
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
