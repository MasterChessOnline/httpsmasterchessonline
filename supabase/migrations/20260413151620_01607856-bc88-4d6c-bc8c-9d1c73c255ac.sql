
-- Stream queue for play vs streamer
CREATE TABLE public.stream_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  username text NOT NULL DEFAULT 'Player',
  avatar_url text,
  priority integer NOT NULL DEFAULT 0,
  role text NOT NULL DEFAULT 'free',
  game_mode text NOT NULL DEFAULT 'blitz',
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stream_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view queue" ON public.stream_queue FOR SELECT USING (true);
CREATE POLICY "Auth users can join queue" ON public.stream_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queue entry" ON public.stream_queue FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can leave queue" ON public.stream_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Stream chat messages
CREATE TABLE public.stream_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  username text NOT NULL DEFAULT 'Player',
  avatar_url text,
  role text NOT NULL DEFAULT 'free',
  message text NOT NULL,
  is_highlighted boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stream_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stream chat" ON public.stream_chat_messages FOR SELECT USING (true);
CREATE POLICY "Auth users can send messages" ON public.stream_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Stream donations
CREATE TABLE public.stream_donations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  username text NOT NULL DEFAULT 'Anonymous',
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  message text,
  alert_shown boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stream_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donations" ON public.stream_donations FOR SELECT USING (true);
CREATE POLICY "System can insert donations" ON public.stream_donations FOR INSERT WITH CHECK (true);

-- Stream subscriptions
CREATE TABLE public.stream_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tier text NOT NULL DEFAULT 'supporter',
  status text NOT NULL DEFAULT 'active',
  stripe_subscription_id text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.stream_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subscriptions" ON public.stream_subscriptions FOR SELECT USING (true);
CREATE POLICY "System can insert subscriptions" ON public.stream_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update subscriptions" ON public.stream_subscriptions FOR UPDATE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_queue;
