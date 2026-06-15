CREATE OR REPLACE FUNCTION public.get_donation_progress()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total_cents', COALESCE((
      SELECT SUM(amount)::bigint
      FROM public.purchases
      WHERE item_type = 'donation' AND status = 'completed'
    ), 0),
    'donor_count', COALESCE((
      SELECT COUNT(DISTINCT COALESCE(user_id::text, stripe_session_id))
      FROM public.purchases
      WHERE item_type = 'donation' AND status = 'completed'
    ), 0),
    'goal', (
      SELECT jsonb_build_object(
        'title', title,
        'target_cents', target_amount,
        'currency', currency,
        'end_date', end_date
      )
      FROM public.donation_goals
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_donation_progress() TO anon, authenticated;