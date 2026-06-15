ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS skill_level text,
  ADD COLUMN IF NOT EXISTS favorite_opening text;