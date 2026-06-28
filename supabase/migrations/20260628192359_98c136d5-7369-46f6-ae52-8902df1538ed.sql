
-- Invite link system for DB Chess Cup (and any tournament)
CREATE TABLE IF NOT EXISTS public.tournament_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uses integer NOT NULL DEFAULT 0,
  max_uses integer NOT NULL DEFAULT 100,
  reward_coins integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tournament_invites TO anon, authenticated;
GRANT INSERT ON public.tournament_invites TO authenticated;
GRANT ALL ON public.tournament_invites TO service_role;

ALTER TABLE public.tournament_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invites_public_read" ON public.tournament_invites
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "invites_owner_insert" ON public.tournament_invites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_tournament_invites_tournament ON public.tournament_invites(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_invites_creator ON public.tournament_invites(created_by);

-- Add referrer column to registrations (if not exists)
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS referrer_invite_code text,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;

-- Atomic redemption RPC: bumps uses, returns created_by of the inviter
CREATE OR REPLACE FUNCTION public.redeem_invite(_code text)
RETURNS TABLE(tournament_id uuid, inviter_id uuid, reward_coins integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.tournament_invites%ROWTYPE;
BEGIN
  SELECT * INTO v_row FROM public.tournament_invites WHERE code = _code FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invite_not_found'; END IF;
  IF v_row.uses >= v_row.max_uses THEN RAISE EXCEPTION 'invite_exhausted'; END IF;
  UPDATE public.tournament_invites SET uses = uses + 1 WHERE id = v_row.id;
  RETURN QUERY SELECT v_row.tournament_id, v_row.created_by, v_row.reward_coins;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_invite(text) TO authenticated;
