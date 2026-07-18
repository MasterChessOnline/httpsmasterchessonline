REVOKE EXECUTE ON FUNCTION public.get_public_tournament_standings(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_public_tournament_standings(uuid) TO authenticated, service_role;