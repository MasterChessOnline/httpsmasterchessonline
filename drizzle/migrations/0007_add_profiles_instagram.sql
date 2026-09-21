ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram text;
GRANT SELECT (instagram) ON public.profiles TO anon, authenticated;
GRANT UPDATE (instagram) ON public.profiles TO authenticated;

UPDATE public.profiles SET instagram = 'vuk_georgijev'
WHERE user_id = 'b42fd6cb-8bd7-4447-9b8b-1c2cc6e65ada';
