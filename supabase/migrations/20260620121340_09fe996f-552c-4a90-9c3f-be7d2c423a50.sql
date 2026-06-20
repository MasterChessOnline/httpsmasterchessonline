
REVOKE EXECUTE ON FUNCTION public.award_tournament_title(uuid, text, text, text, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.award_tournament_title(uuid, text, text, text, uuid, jsonb) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.transfer_unique_badge(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transfer_unique_badge(text, uuid) TO authenticated, service_role;
