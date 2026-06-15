
CREATE TABLE public.challenge_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  time_control_label text NOT NULL DEFAULT '10+5',
  initial_time integer NOT NULL DEFAULT 600,
  increment integer NOT NULL DEFAULT 5,
  is_rated boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  game_id uuid REFERENCES public.online_games(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX idx_challenge_links_code ON public.challenge_links(code);
CREATE INDEX idx_challenge_links_status ON public.challenge_links(status, expires_at);

GRANT SELECT ON public.challenge_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.challenge_links TO authenticated;
GRANT ALL ON public.challenge_links TO service_role;

ALTER TABLE public.challenge_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read links by code"
  ON public.challenge_links FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create links"
  ON public.challenge_links FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid() OR creator_id IS NULL);

CREATE POLICY "Creator or claimer can update"
  ON public.challenge_links FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid() OR claimed_by = auth.uid() OR claimed_by IS NULL)
  WITH CHECK (creator_id = auth.uid() OR claimed_by = auth.uid());

CREATE POLICY "Creator can delete"
  ON public.challenge_links FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());
