
# MasterChess Growth Loop — Implementation Plan

Goal: ship the 4 highest-leverage pieces from your brief (News, Puzzles loop, Blog, Maps/Reviews) plus the SEO plumbing that ties them together. Everything stays English, matches the existing Gold & Black design, and respects the "no fake engagement" rule.

---

## 1. `/news` — Hacker News–style feed (NEW)

A real, voteable feed that mixes platform updates, chess world news, and community posts. Gives Google fresh content + engagement signals daily.

- **New table `news_posts`** (title, url, slug, body_md, kind: `update`|`world`|`community`, source, author_id, created_at, score cache).
- **New table `news_votes`** (post_id, user_id, value ±1, unique). Score = sum; trending = HN formula `(score-1)/(age_hours+2)^1.8`.
- **New table `news_comments`** (post_id, user_id, body, parent_id) — threaded, optional v1.
- RLS + GRANTs per project rules. `service_role` for edge-function inserts.
- **Edge function `news-ingest-chess`** — pulls a curated chess RSS list (FIDE, Chess.com news RSS is OK as a backend source per the brand-policy memory: backend ingestion fine, never credit competitors in UI; we'll strip source branding and show "World Chess News" tag). Runs hourly via `pg_cron`.
- **Edge function `news-autopost-updates`** — when a release marker is dropped in `site_config.release_notes`, it auto-creates an `update` post.
- **Page `src/pages/News.tsx`** — HN-style list: rank, ▲/▼, title, kind chip, score, age, comments link. Routes: `/news`, `/news/:slug`, `/news/submit` (auth required).
- Full SEO: `<Seo>` per item, JSON-LD `NewsArticle` + `ItemList` on index, added to `sitemap.xml` generator.
- Navbar entry under "Community".

Anti-fake-engagement: no seeded votes, no ghost authors. World-news items show `source: world` with no fake score; only real user votes move them.

## 2. `/blog` — SEO content engine (NEW)

3 posts/week, MDX-style stored in DB so non-devs can publish.

- **New table `blog_posts`** (slug, title, excerpt, body_md, cover_url, tags[], status, published_at, author_id, reading_minutes).
- **Page `src/pages/Blog.tsx`** + `src/pages/BlogPost.tsx`. Markdown renderer via `react-markdown` (already in deps if not, add).
- **Admin page `src/pages/AdminBlog.tsx`** — gated by `has_role(uid,'admin')`. Markdown editor, preview, schedule.
- **Seed 12 posts** matching your brief: "How to Improve Chess Fast", "Chess Basics Explained", "Best Chess Openings", "How to Stop Blunders", "Chess Tactics Guide", "Thinking Like a Chess Player", "Play Chess Online — Complete Guide", "Best Chess Training Methods", "Daily Puzzles: Why They Work", "Endgame Fundamentals", "Calculation Drills", "Reading Your Opponent".
- JSON-LD `Article` + `BreadcrumbList`. New `sitemap-blog.xml` shard added to `sitemap_index.xml`.
- RSS feed at `/blog/rss.xml` for IndexNow + future ingestion.

## 3. Home + funnel SEO tightening

- Update `<title>` / meta on `/`, `/puzzles`, `/news`, `/blog` to the exact strings from your brief.
- Home keyword block (natural prose, not stuffing) under the hero, hidden from logged-in users to keep the play-first UX.
- Add `/news` and `/blog` to `Navbar.tsx` and `NavSearchPalette.tsx`.
- Add a "Daily puzzle → come back tomorrow" return CTA on puzzle complete (uses existing `use-daily-streak`).

## 4. Google Search Console automation

- New edge function `news-indexnow-ping` — fires IndexNow + GSC submit for every new news/blog URL on insert (uses existing `INDEXNOW_KEY`).
- Extend `scripts/generate-sitemap.ts` to pull `news_posts` and `blog_posts` from DB at build time → `sitemap-news.xml`, `sitemap-blog.xml`. Add both to `sitemap_index.xml`.

## 5. Google Maps / GBP polish (docs + admin only — no UI churn)

Maps/GBP setup is already shipped. We add:

- `docs/GBP_COPY_PACK.md` — the exact Name, Description, Categories, Posts, Review-request templates from your brief, copy-pasteable.
- `src/pages/AdminGbpPosts.tsx` already exists — extend with the 3 post templates from your brief preloaded as drafts.
- `GoogleReviewsBlock` is already on the site; add it to `/about` and Home footer band so trust signal shows up sitewide.

No fake reviews seeded — playbook only.

## 6. What we are NOT changing

- No redesign of Home (per Core memory veto).
- No competitor brand names in any UI copy.
- No fake votes/comments/reviews — every engagement primitive is real-user-only.
- AI Voice Coach, game-board layout, MasterCourse work from prior turns: untouched.

---

## Technical notes (for the dev side)

```text
migrations/
  news_posts, news_votes, news_comments  (+ GRANTs, RLS, has_role policies for admin moderation)
  blog_posts                              (+ GRANTs, RLS)
supabase/functions/
  news-ingest-chess/index.ts              (RSS → news_posts, kind='world')
  news-autopost-updates/index.ts          (release marker → kind='update')
  news-indexnow-ping/index.ts             (on new slug → IndexNow + GSC)
src/pages/
  News.tsx, NewsItem.tsx, NewsSubmit.tsx
  Blog.tsx, BlogPost.tsx, AdminBlog.tsx
src/components/
  NewsRow.tsx, VoteArrows.tsx, BlogCard.tsx
scripts/generate-sitemap.ts                (+ news/blog shards)
public/sitemap_index.xml                   (+ 2 new shard rows)
docs/GBP_COPY_PACK.md                      (new — copy/paste pack)
```

Cron:
```sql
select cron.schedule('news-ingest-hourly','0 * * * *', $$select net.http_post(...) /* news-ingest-chess */ $$);
```

---

## Open questions before I build

1. **Scope of v1**: do you want all 6 sections in one go, or ship in 2 waves (Wave A = News + sitemap/SEO, Wave B = Blog + GBP pack)?
2. **Comments on `/news`**: ship v1 with comments, or links-only first and comments later?
3. **Blog seeding**: do you want me to write the full body for all 12 posts (~600-900 words each), or stubs + outline that you/Coach AI finish?
