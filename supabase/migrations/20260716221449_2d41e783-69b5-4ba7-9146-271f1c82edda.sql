
CREATE TABLE public.roasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL UNIQUE,
  target_user_id uuid,
  roast_text text NOT NULL,
  language text NOT NULL DEFAULT 'sr',
  mode text NOT NULL DEFAULT 'playful',
  upvotes integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.roasts TO anon;
GRANT SELECT, INSERT, UPDATE ON public.roasts TO authenticated;
GRANT ALL ON public.roasts TO service_role;

ALTER TABLE public.roasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roasts readable by all" ON public.roasts FOR SELECT USING (true);
CREATE POLICY "roasts insert by anyone signed in" ON public.roasts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "roasts update shares/upvotes" ON public.roasts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX roasts_target_user_id_idx ON public.roasts(target_user_id);
CREATE INDEX roasts_created_at_idx ON public.roasts(created_at DESC);
