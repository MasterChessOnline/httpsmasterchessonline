CREATE OR REPLACE FUNCTION public.get_donation_progress()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH totals AS (
    SELECT
      COALESCE(SUM(amount)::bigint, 0) AS total_cents,
      COALESCE(COUNT(DISTINCT COALESCE(user_id::text, stripe_session_id)), 0) AS donor_count
    FROM public.purchases
    WHERE item_type = 'donation' AND status = 'completed'
  ),
  goal AS (
    SELECT title, target_amount, currency, end_date
    FROM public.donation_goals
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'total_cents', t.total_cents,
    'donor_count', t.donor_count,
    'goal', (SELECT jsonb_build_object(
        'title', title,
        'target_cents', target_amount * 100,
        'currency', currency,
        'end_date', end_date
      ) FROM goal),
    'milestone', (
      SELECT CASE
        WHEN g.target_amount IS NULL OR g.target_amount = 0 THEN 0
        WHEN t.total_cents / g.target_amount >= 100 THEN 100
        WHEN t.total_cents / g.target_amount >= 75 THEN 75
        WHEN t.total_cents / g.target_amount >= 50 THEN 50
        WHEN t.total_cents / g.target_amount >= 25 THEN 25
        ELSE 0
      END
      FROM goal g
    )
  ) FROM totals t;
$function$;

GRANT EXECUTE ON FUNCTION public.get_donation_progress() TO anon, authenticated;