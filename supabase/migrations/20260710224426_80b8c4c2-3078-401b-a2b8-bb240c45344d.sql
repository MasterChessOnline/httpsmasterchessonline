
-- Lock down affiliates.owner_email: remove public row access; expose safe subset via view.
DROP POLICY IF EXISTS "Affiliate aggregate is public" ON public.affiliates;

-- Only owner or admin can read full row (including owner_email)
CREATE POLICY "Affiliate owner or admin can read"
  ON public.affiliates
  FOR SELECT
  USING (
    auth.uid() = owner_user_id
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Revoke direct table SELECT from anon/authenticated; they use the view below
REVOKE SELECT ON public.affiliates FROM anon;
-- keep authenticated SELECT so RLS-owner policy works; column REVOKE prevents email leak
REVOKE SELECT (owner_email) ON public.affiliates FROM anon;
REVOKE SELECT (owner_email) ON public.affiliates FROM authenticated;

-- Public-safe view (no email)
CREATE OR REPLACE VIEW public.affiliates_public
WITH (security_invoker = true) AS
SELECT
  code, owner_user_id, owner_name, partner_tier,
  commission_coins_per_signup, commission_coins_per_tournament_join,
  total_clicks, total_signups, total_joins, total_coins_paid,
  is_active, created_at, updated_at
FROM public.affiliates
WHERE is_active = true;

GRANT SELECT ON public.affiliates_public TO anon, authenticated;
