
CREATE TABLE public.site_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site ratings are viewable by everyone"
  ON public.site_ratings FOR SELECT USING (true);

CREATE POLICY "Users can insert their own rating"
  ON public.site_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rating"
  ON public.site_ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rating"
  ON public.site_ratings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_site_ratings_updated_at
  BEFORE UPDATE ON public.site_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
