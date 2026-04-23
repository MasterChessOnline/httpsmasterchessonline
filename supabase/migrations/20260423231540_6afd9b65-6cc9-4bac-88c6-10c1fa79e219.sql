
-- ============ DIRECT MESSAGES ============
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  message text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dm_pair ON public.direct_messages (sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_dm_recipient ON public.direct_messages (recipient_id, read_at);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Helper: are two users friends (accepted)?
CREATE OR REPLACE FUNCTION public.are_friends(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
      AND ((user_id = _a AND friend_id = _b) OR (user_id = _b AND friend_id = _a))
  )
$$;

CREATE POLICY "Users can read own DMs"
  ON public.direct_messages FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Friends can send DMs"
  ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.are_friends(sender_id, recipient_id));

CREATE POLICY "Recipient can mark as read"
  ON public.direct_messages FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;

-- ============ CLUBS ============
CREATE TABLE public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '♞',
  owner_id uuid NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  member_count integer NOT NULL DEFAULT 1,
  avg_rating integer NOT NULL DEFAULT 1200,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member', -- owner | admin | member
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (club_id, user_id)
);
CREATE INDEX idx_club_members_user ON public.club_members (user_id);
CREATE INDEX idx_club_members_club ON public.club_members (club_id);
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- Helper functions to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.is_club_member(_user uuid, _club uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.club_members WHERE user_id = _user AND club_id = _club)
$$;

CREATE OR REPLACE FUNCTION public.get_club_role(_user uuid, _club uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.club_members WHERE user_id = _user AND club_id = _club LIMIT 1
$$;

-- Clubs policies
CREATE POLICY "Anyone can view public clubs"
  ON public.clubs FOR SELECT
  USING (is_public = true OR public.is_club_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create clubs"
  ON public.clubs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners and admins can update club"
  ON public.clubs FOR UPDATE TO authenticated
  USING (public.get_club_role(auth.uid(), id) IN ('owner', 'admin'));

CREATE POLICY "Only owner can delete club"
  ON public.clubs FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Club members policies
CREATE POLICY "Anyone can view members"
  ON public.club_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join clubs"
  ON public.club_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave; owners/admins can kick"
  ON public.club_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.get_club_role(auth.uid(), club_id) IN ('owner', 'admin'));

CREATE POLICY "Owners can change roles"
  ON public.club_members FOR UPDATE TO authenticated
  USING (public.get_club_role(auth.uid(), club_id) = 'owner');

-- ============ CLUB MESSAGES ============
CREATE TABLE public.club_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_club_msg_club ON public.club_messages (club_id, created_at DESC);
ALTER TABLE public.club_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read club chat"
  ON public.club_messages FOR SELECT TO authenticated
  USING (public.is_club_member(auth.uid(), club_id));

CREATE POLICY "Members can post in club chat"
  ON public.club_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_club_member(auth.uid(), club_id));

ALTER PUBLICATION supabase_realtime ADD TABLE public.club_messages;
ALTER TABLE public.club_messages REPLICA IDENTITY FULL;

-- ============ GAME INVITES ============
CREATE TABLE public.game_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  time_control_label text NOT NULL DEFAULT '5+3',
  time_control_seconds integer NOT NULL DEFAULT 300,
  time_control_increment integer NOT NULL DEFAULT 3,
  is_rated boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'pending', -- pending | accepted | declined | cancelled | expired
  game_id uuid,
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  responded_at timestamptz
);
CREATE INDEX idx_game_invites_recipient ON public.game_invites (recipient_id, status, created_at DESC);
CREATE INDEX idx_game_invites_sender ON public.game_invites (sender_id, status);
ALTER TABLE public.game_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender and recipient can view invites"
  ON public.game_invites FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Friends can send invites"
  ON public.game_invites FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.are_friends(sender_id, recipient_id));

CREATE POLICY "Sender or recipient can update invite"
  ON public.game_invites FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_invites;
ALTER TABLE public.game_invites REPLICA IDENTITY FULL;

-- ============ TRIGGERS to keep clubs.member_count accurate ============
CREATE OR REPLACE FUNCTION public.tg_club_member_count()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.clubs SET member_count = member_count + 1, updated_at = now() WHERE id = NEW.club_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.clubs SET member_count = GREATEST(0, member_count - 1), updated_at = now() WHERE id = OLD.club_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER club_member_count_trigger
AFTER INSERT OR DELETE ON public.club_members
FOR EACH ROW EXECUTE FUNCTION public.tg_club_member_count();

-- Auto-add owner as a member when a club is created
CREATE OR REPLACE FUNCTION public.tg_add_owner_as_member()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.club_members (club_id, user_id, role) VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER add_owner_on_club_create
AFTER INSERT ON public.clubs
FOR EACH ROW EXECUTE FUNCTION public.tg_add_owner_as_member();
