
-- ============ NEWS ============
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  slug TEXT NOT NULL UNIQUE,
  url TEXT,
  body_md TEXT,
  kind TEXT NOT NULL CHECK (kind IN ('update','world','community')),
  source TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  score INT NOT NULL DEFAULT 0,
  comment_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX news_posts_created_idx ON public.news_posts (created_at DESC);
CREATE INDEX news_posts_kind_idx ON public.news_posts (kind, created_at DESC);

GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;

ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_posts read all" ON public.news_posts FOR SELECT USING (true);
CREATE POLICY "news_posts insert auth" ON public.news_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY "news_posts update own or admin" ON public.news_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "news_posts delete own or admin" ON public.news_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- votes
CREATE TABLE public.news_votes (
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_votes TO authenticated;
GRANT ALL ON public.news_votes TO service_role;
ALTER TABLE public.news_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_votes read auth" ON public.news_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "news_votes write own" ON public.news_votes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- comments
CREATE TABLE public.news_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.news_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX news_comments_post_idx ON public.news_comments (post_id, created_at);
GRANT SELECT ON public.news_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_comments TO authenticated;
GRANT ALL ON public.news_comments TO service_role;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_comments read all" ON public.news_comments FOR SELECT USING (true);
CREATE POLICY "news_comments insert auth" ON public.news_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "news_comments update own" ON public.news_comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "news_comments delete own or admin" ON public.news_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- score + comment_count trigger
CREATE OR REPLACE FUNCTION public.recompute_news_score()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid UUID;
BEGIN
  pid := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.news_posts
     SET score = COALESCE((SELECT SUM(value)::int FROM public.news_votes WHERE post_id = pid), 0),
         updated_at = now()
   WHERE id = pid;
  RETURN NULL;
END $$;

CREATE TRIGGER news_votes_score_aiud
AFTER INSERT OR UPDATE OR DELETE ON public.news_votes
FOR EACH ROW EXECUTE FUNCTION public.recompute_news_score();

CREATE OR REPLACE FUNCTION public.recompute_news_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid UUID;
BEGIN
  pid := COALESCE(NEW.post_id, OLD.post_id);
  UPDATE public.news_posts
     SET comment_count = (SELECT COUNT(*) FROM public.news_comments WHERE post_id = pid)
   WHERE id = pid;
  RETURN NULL;
END $$;

CREATE TRIGGER news_comments_count_aid
AFTER INSERT OR DELETE ON public.news_comments
FOR EACH ROW EXECUTE FUNCTION public.recompute_news_comment_count();

-- ============ BLOG ============
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_md TEXT NOT NULL,
  cover_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled')),
  published_at TIMESTAMPTZ,
  reading_minutes INT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX blog_posts_pub_idx ON public.blog_posts (status, published_at DESC NULLS LAST);

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_posts read published" ON public.blog_posts FOR SELECT
  USING (status = 'published' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "blog_posts admin write" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- updated_at triggers (reuse existing helper if present)
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER news_posts_touch BEFORE UPDATE ON public.news_posts
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
CREATE TRIGGER blog_posts_touch BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();
