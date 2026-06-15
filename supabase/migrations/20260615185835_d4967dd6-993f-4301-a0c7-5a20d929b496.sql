CREATE OR REPLACE FUNCTION public.supporter_tier(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH agg AS (
    SELECT
      COALESCE(SUM(amount), 0)::bigint AS total_cents,
      COALESCE(MAX(amount), 0)::bigint AS max_cents,
      COUNT(*)::int AS donation_count
    FROM public.purchases
    WHERE item_type = 'donation'
      AND status = 'completed'
      AND user_id = p_user_id
  )
  SELECT jsonb_build_object(
    'tier', CASE
      WHEN max_cents >= 2500 THEN 'legend'
      WHEN max_cents >= 1000 THEN 'gold'
      WHEN max_cents >= 100  THEN 'coffee'
      ELSE NULL
    END,
    'total_cents', total_cents,
    'donation_count', donation_count
  )
  FROM agg;
$$;

GRANT EXECUTE ON FUNCTION public.supporter_tier(uuid) TO anon, authenticated, service_role;