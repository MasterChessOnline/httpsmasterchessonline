
-- 1. contact_messages: explicit deny for anon/authenticated SELECT (defense in depth)
DROP POLICY IF EXISTS "Deny anon/auth select on contact_messages" ON public.contact_messages;
CREATE POLICY "Deny anon/auth select on contact_messages"
  ON public.contact_messages
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- 2. referrals: explicit deny for anon/authenticated SELECT (defense in depth)
DROP POLICY IF EXISTS "Deny anon/auth select on referrals" ON public.referrals;
CREATE POLICY "Deny anon/auth select on referrals"
  ON public.referrals
  AS RESTRICTIVE
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- 3. profiles: re-assert column-level revokes for sensitive fields.
--    The public SELECT policy stays (needed for public player pages / leaderboard),
--    but anon/authenticated must never receive these columns via PostgREST.
--    Owners read their full row through public.get_my_profile() (SECURITY DEFINER).
DO $$
DECLARE
  col text;
  sensitive text[] := ARRAY[
    'master_coins',
    'login_streak',
    'login_streak_best',
    'last_login_reward_date',
    'win_streak',
    'loss_streak',
    'current_game_id',
    'push_notifications_enabled',
    'welcome_day',
    'welcome_last_claim',
    'total_xp'
  ];
BEGIN
  FOREACH col IN ARRAY sensitive LOOP
    EXECUTE format('REVOKE SELECT (%I) ON public.profiles FROM anon, authenticated', col);
  END LOOP;
END $$;
