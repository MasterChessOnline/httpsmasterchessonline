-- Tighten SECURITY DEFINER function permissions: revoke EXECUTE from anon
-- on every public-schema SECURITY DEFINER function EXCEPT explicitly public ones.
-- Trigger functions and admin-only functions also lose anon execute.
DO $$
DECLARE
  fn record;
  fn_sig text;
  whitelist text[] := ARRAY[
    -- truly public RPCs (read-only or pre-signup flows)
    'resolve_ref_code',
    'track_referral_visit',
    'get_beat_nikola_leaderboard',
    'get_beat_nikola_stats',
    'get_current_daily_king',
    'get_public_style_twin',
    'top_clans'
  ];
BEGIN
  FOR fn IN
    SELECT p.oid,
           p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prosecdef = true
  LOOP
    fn_sig := format('public.%I(%s)', fn.proname, fn.args);
    -- Always revoke PUBLIC (catches default-grant scenarios)
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn_sig);
    IF NOT (fn.proname = ANY(whitelist)) THEN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn_sig);
      -- Keep authenticated + service_role usage
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn_sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn_sig);
    ELSE
      -- public RPC: keep anon + authenticated explicit
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', fn_sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', fn_sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn_sig);
    END IF;
  END LOOP;
END;
$$;