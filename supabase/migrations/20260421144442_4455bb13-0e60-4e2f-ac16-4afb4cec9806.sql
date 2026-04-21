-- Add country, peak_rating, and bot_peak_rating to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_flag text,
  ADD COLUMN IF NOT EXISTS peak_rating integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS bot_peak_rating integer NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS highest_title_key text;

-- Backfill peak_rating from current rating where it's the default
UPDATE public.profiles SET peak_rating = GREATEST(peak_rating, rating);
UPDATE public.profiles SET bot_peak_rating = GREATEST(bot_peak_rating, bot_rating);

-- Trigger to keep peak_rating in sync (auto-updates on every rating change)
CREATE OR REPLACE FUNCTION public.update_peak_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating > COALESCE(OLD.peak_rating, 0) THEN
    NEW.peak_rating := NEW.rating;
  END IF;
  IF NEW.bot_rating > COALESCE(OLD.bot_peak_rating, 0) THEN
    NEW.bot_peak_rating := NEW.bot_rating;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_update_peak_ratings ON public.profiles;
CREATE TRIGGER profiles_update_peak_ratings
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_peak_ratings();