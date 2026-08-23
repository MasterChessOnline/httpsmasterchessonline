REVOKE ALL ON FUNCTION public.get_funnel_summary(integer) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.get_vitals_summary(integer) FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.get_funnel_summary(_days integer DEFAULT 7)
RETURNS TABLE(event text, sessions bigint, total bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT f.event, count(DISTINCT f.session_id)::bigint, count(*)::bigint
  FROM public.funnel_events f
  WHERE f.created_at > now() - make_interval(days => greatest(_days, 1))
  GROUP BY f.event
  ORDER BY 3 DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_vitals_summary(_days integer DEFAULT 7)
RETURNS TABLE(metric text, samples bigint, p50 double precision, p75 double precision)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT v.metric,
         count(*)::bigint,
         percentile_cont(0.5) WITHIN GROUP (ORDER BY v.value),
         percentile_cont(0.75) WITHIN GROUP (ORDER BY v.value)
  FROM public.web_vitals v
  WHERE v.created_at > now() - make_interval(days => greatest(_days, 1))
  GROUP BY v.metric
  ORDER BY 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_funnel_summary(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_vitals_summary(integer) TO authenticated;