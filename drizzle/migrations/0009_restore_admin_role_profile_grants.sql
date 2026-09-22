GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_tournaments(uuid) TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;