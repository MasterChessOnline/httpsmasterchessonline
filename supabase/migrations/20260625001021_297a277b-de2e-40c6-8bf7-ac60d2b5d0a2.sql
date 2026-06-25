ALTER TABLE public.news_posts
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS author_name text;

ALTER TABLE public.news_posts DROP CONSTRAINT IF EXISTS news_posts_kind_check;
ALTER TABLE public.news_posts ADD CONSTRAINT news_posts_kind_check
  CHECK (kind = ANY (ARRAY['update','world','community','founder','releases','tournaments','milestones','roadmap','ai']));

CREATE INDEX IF NOT EXISTS news_posts_featured_idx ON public.news_posts (featured, created_at DESC);

INSERT INTO public.news_posts (title, slug, body_md, kind, author_name, cover_image, featured, score, source, created_at)
VALUES
(
  'A 13-Year-Old Who Built His Own Chess App',
  'a-13-year-old-who-built-his-own-chess-app',
  E'**Meet Nikola Šakotić, the Serbian U14 Chess Champion who transformed his tournament experience into [MasterChess.live](https://masterchess.live) — a free chess platform built for competitive players.**\n\nHey everyone,\n\nMy name is **Nikola Šakotić**. I am 13 years old and the current **U14 Chess Champion of Serbia**.\n\nPreparing for championship tournaments taught me exactly what serious chess players need to improve and compete at a high level. But over time, I became frustrated with how many platforms place advanced analysis tools, opening preparation, and training features behind expensive paywalls.\n\nI wanted a place where players could focus on chess without limitations. A platform built by a player, for players.\n\nInstead of waiting for someone else to create it, I decided to build my dream chess platform myself.\n\nUsing my real tournament experience, I created **MasterChess.live** — a free web application designed for ambitious players who want powerful chess tools, training resources, analysis features, and a growing community all in one place.\n\nEvery feature on MasterChess has been inspired by my own journey as a competitive chess player and my goal of helping others improve their game.\n\nI''ll let the platform speak for itself. Try it out:\n\n- Play online vs real humans: /play-online\n- Play vs 9 AI bots from 400 to 2000 ELO: /bots\n- Analyze your games: /analysis\n- Train openings: /openings\n- Join free tournaments: /tournaments\n- Climb the leaderboard: /leaderboard\n\nI would love to hear your thoughts, feedback, and ideas for future updates.\n\n— Nikola',
  'founder',
  'Nikola Šakotić',
  '/__l5e/assets-v1/14dae1b4-8366-483a-85ee-cdfb7e456207/nikola-vs-niemann.jpg',
  true,
  142,
  'MasterChess',
  now() - interval '1 day'
),
(
  'MasterChess Wears the Brand at Top Serbian Chess Events',
  'masterchess-brand-serbian-chess-events',
  E'The MasterChess t-shirt has been spotted at several top-tier chess events in Serbia, including matches featuring international super-grandmasters. Nikola Šakotić, founder of MasterChess.live, has been representing the platform in person — building real connections with the chess community offline as well as online.\n\nWe believe chess deserves a platform built by players, for players. Every event we attend, every photo, every conversation pushes the brand further.\n\nReady to join the movement? Play free at /play and become part of the MasterChess community.',
  'community',
  'MasterChess Newsroom',
  '/__l5e/assets-v1/f35f47e4-9616-48fc-b29e-95e8a18ef06e/nikola-with-streamer.jpg',
  false,
  74,
  'MasterChess',
  now() - interval '6 hours'
),
(
  'New Analysis System Released on MasterChess',
  'new-analysis-system-released',
  E'We just shipped a major upgrade to the MasterChess analysis system (/analysis). You can now review every game with move-by-move classification (blunder, mistake, inaccuracy, great move, brilliant), automatic key-moment highlighting, and one-click opening detection.\n\nIt''s fast, it''s private, and it works on the same device you played on — no waiting, no paywalls.\n\nGive it a try after your next online game (/play-online) or match vs a bot (/bots).',
  'releases',
  'MasterChess Newsroom',
  null,
  false,
  61,
  'MasterChess',
  now() - interval '12 hours'
),
(
  'Weekly Signature Tournaments Now Live',
  'weekly-signature-tournaments-live',
  E'Three brand-new signature events run every week on MasterChess:\n\n- MasterChess Monday — 3+0 Blitz, Mondays 19:00 CET\n- Friday Night Fire — 1+0 Bullet, Fridays 21:00 CET\n- Sunday Classic — 10+0 Rapid Swiss, Sundays 17:00 CET\n\nFree to enter, prizes for the winners, and bragging rights for everyone on the leaderboard (/leaderboard). Check the next one inside Tournaments (/tournaments) and join the lobby ten minutes before the start.',
  'tournaments',
  'MasterChess Newsroom',
  null,
  false,
  48,
  'MasterChess',
  now() - interval '1 day'
),
(
  'MasterChess Community Update — June',
  'masterchess-community-update-june',
  E'New month, fresh updates from the MasterChess community (/community):\n\n- New clan banners and tags rolling out across club pages.\n- Voice chat is now stable in online games — try it from any board.\n- Daily missions refreshed with new puzzle and bot challenges.\n- Battle Pass season is mid-flight: claim your tier rewards at /battle-pass.\n\nWant to share your own update or moment? Submit a post at /news/submit and join the newsroom.',
  'community',
  'MasterChess Newsroom',
  null,
  false,
  36,
  'MasterChess',
  now() - interval '2 days'
)
ON CONFLICT (slug) DO UPDATE SET
  body_md = EXCLUDED.body_md,
  cover_image = EXCLUDED.cover_image,
  featured = EXCLUDED.featured,
  kind = EXCLUDED.kind,
  author_name = EXCLUDED.author_name;