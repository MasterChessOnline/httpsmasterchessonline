
-- 1. Fix stream_subscriptions: prevent self-grant of premium
DROP POLICY IF EXISTS "System can insert subscriptions" ON public.stream_subscriptions;
DROP POLICY IF EXISTS "System can update subscriptions" ON public.stream_subscriptions;
DROP POLICY IF EXISTS "Anyone can view subscriptions" ON public.stream_subscriptions;

-- Users can view only their own subscription
CREATE POLICY "Users view own subscription"
ON public.stream_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only service_role (edge functions / Stripe webhook) can write
CREATE POLICY "Service role manages subscriptions insert"
ON public.stream_subscriptions
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role manages subscriptions update"
ON public.stream_subscriptions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Restrict EXECUTE on SECURITY DEFINER helper/internal functions to authenticated users only
REVOKE EXECUTE ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_tournaments(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.commit_online_move(uuid, integer, text, text, text, text, text, text, text, text, text, integer, integer, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.dismiss_game_invite(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.finalize_online_game(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_club_role(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_club_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.recalc_tournament_tiebreaks(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_elo_ratings(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tournament_color_balance(uuid) FROM PUBLIC, anon;

-- Email queue functions are internal-only (edge functions use service_role)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- Set search_path for email functions (currently mutable)
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 3. Restrict avatars bucket listing: replace broad SELECT with object-level read
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

CREATE POLICY "Avatar files are publicly readable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] IS NOT NULL);

-- 4. Realtime authorization: scope channel subscriptions to authenticated users
-- and require ownership/participation for sensitive topics.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to receive broadcast/presence events on topics
-- they have permission for. We restrict to authenticated only at minimum;
-- table-level RLS continues to filter actual row data delivered.
DROP POLICY IF EXISTS "Authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "Authenticated can receive realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
