-- Public awards / recognitions shown on a player's profile.
CREATE TABLE IF NOT EXISTS public.user_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  description text,
  issuer text NOT NULL DEFAULT 'MasterChess',
  badge text NOT NULL DEFAULT 'award',
  awarded_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_awards TO anon;
GRANT SELECT ON public.user_awards TO authenticated;
GRANT ALL ON public.user_awards TO service_role;

ALTER TABLE public.user_awards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "awards are public" ON public.user_awards;
CREATE POLICY "awards are public" ON public.user_awards
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admins manage awards" ON public.user_awards;
CREATE POLICY "admins manage awards" ON public.user_awards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS user_awards_user_idx ON public.user_awards(user_id, awarded_at DESC);

-- Personal in-app notification inbox.
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  link text,
  kind text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.user_notifications TO authenticated;
GRANT ALL ON public.user_notifications TO service_role;

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own notifications read" ON public.user_notifications;
CREATE POLICY "own notifications read" ON public.user_notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own notifications update" ON public.user_notifications;
CREATE POLICY "own notifications update" ON public.user_notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins manage notifications" ON public.user_notifications;
CREATE POLICY "admins manage notifications" ON public.user_notifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS user_notifications_inbox_idx
  ON public.user_notifications(user_id, is_read, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;

-- Award Vuk67 the official Coach recognition.
INSERT INTO public.user_awards (user_id, title, subtitle, description, issuer, badge)
VALUES (
  'b42fd6cb-8bd7-4447-9b8b-1c2cc6e65ada',
  'MasterChess Coach',
  'Official recognition',
  'Vuk67 is recognised as an official MasterChess Coach for helping other players improve, teaching openings and endgames, and setting an example of fair, human-only play.',
  'Dragan Brakus',
  'coach'
);

INSERT INTO public.user_notifications (user_id, title, body, link, kind)
VALUES
  ('b42fd6cb-8bd7-4447-9b8b-1c2cc6e65ada',
   'You are now a MasterChess Coach',
   'Congratulations Vuk67! You have received the official Coach recognition, awarded by Dragan Brakus. The badge is now visible on your profile.',
   '/profile', 'award'),
  ('b42fd6cb-8bd7-4447-9b8b-1c2cc6e65ada',
   'Recognition from Dragan Brakus',
   'Your Coach badge is signed by Dragan Brakus and appears permanently on your MasterChess profile.',
   '/profile', 'award');