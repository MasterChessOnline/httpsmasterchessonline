DROP VIEW IF EXISTS public.community_map_pins;
CREATE VIEW public.community_map_pins
WITH (security_invoker = true) AS
SELECT id, username, avatar_url, rating, country, city, map_lat AS lat, map_lng AS lng
FROM public.profiles
WHERE show_on_map = TRUE AND map_lat IS NOT NULL AND map_lng IS NOT NULL;
GRANT SELECT ON public.community_map_pins TO anon, authenticated;