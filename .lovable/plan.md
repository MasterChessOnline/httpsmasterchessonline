## Why MasterChess.live isn't in Google News yet

Google News indexes brand-new domains slowly (usually weeks to months). What we can control:
1. **Publisher signals** — proper `NewsArticle` JSON-LD, author = "MasterChess.live Newsroom", real cover images, dated articles. ✅ Mostly done, but author label needs to read **"MasterChess.live"** everywhere.
2. **news-sitemap.xml** must list articles published in the last 48h with valid `<news:publication><news:name>MasterChess.live</news:name>`. Needs verification.
3. **Submit to Google Publisher Center** + verify in Search Console — manual step you (Nikola) must do; I'll add a one-page checklist.
4. **Fresh, original, frequent** content — at least 2-3 new articles/week. We'll seed the founder series now.

---

## Plan

### 1. Upload the 3 founder photos as Lovable assets
- `nikola-with-streamer.jpg` (with white-shirt streamer)
- `nikola-vs-niemann-board.jpg` (at the board, Niemann vs Nepo nameplates)
- `nikola-with-gm.jpg` (with the curly-haired GM in suit)

Use these as cover images for the new featured articles.

### 2. Seed 6 new founder-first news articles (English, author = "MasterChess.live Newsroom")
Migration inserts into `news_posts` with `featured=true` for the first one, kind=`founder`/`milestones`/`releases`:

1. **"How a 13-Year-Old Built MasterChess.live — The Full Story"** (FEATURED, cover = streamer photo) — origin story, why he built it, vision.
2. **"Meeting Hans Niemann at the Board in Belgrade"** (cover = Niemann/Nepo board photo) — event report.
3. **"Backstage with a Grandmaster: Lessons from the Top"** (cover = GM photo).
4. **"MasterChess.live Launch Notes — What's Live Today"** (kind=releases) — features list, links to /play, /bots, /tournaments, /puzzles.
5. **"Roadmap 2026: Tournaments, Clans, Battle Royale"** (kind=roadmap).
6. **"Why MasterChess.live Exists — A Founder's Letter"** (kind=founder).

All `author_name = "MasterChess.live Newsroom"`, all bodies original, all in English, all with proper `cover_image` and SEO-friendly slugs.

### 3. Fix author labelling site-wide
- `NewsItem.tsx` default fallback → `"MasterChess.live Newsroom"` (already partial).
- News header chip already shows "Masterchess News" — change to **"MasterChess.live News"** for brand consistency.
- Founder page `/nikola` byline link.

### 4. Make sure every section of `/nikola` and `/authors/nikola-sakotic` is populated
Verify and fill: Founder Photo, Biography, Achievements, Tournament Results, Articles list (pulls from news), Interviews, Updates, Project Timeline, Future Plans. Wire articles list to query `news_posts where kind in ('founder','milestones','releases')`.

### 5. Regenerate news-sitemap.xml & ping
- Update `scripts/generate-sitemap.ts` so `news-sitemap.xml` uses `<news:publication_name>MasterChess.live</news:publication_name>` and only lists articles <48h old (Google News requirement).
- Trigger the existing `news-indexnow-ping` edge function after the new posts are inserted (one-shot SQL `select net.http_post(...)` in the migration, or a manual ping doc).

### 6. "Brutal" growth ideas (added as a docs file + implement the cheap ones now)
Create `docs/GROWTH_PLAYBOOK.md` with 25+ tactics, and implement these immediately:

| # | Tactic | Implementation |
|---|---|---|
| A | **Google Publisher Center submission checklist** | New `docs/GOOGLE_NEWS_SUBMISSION.md` step-by-step |
| B | **RSS auto-discovery** `<link rel="alternate" type="application/rss+xml">` in `index.html` | 1-line edit |
| C | **Twitter/X Card + LinkedIn OG** verified on every news article | Already in `NewsItem.tsx`, audit |
| D | **"As seen with" trust strip on homepage** — small photo row of Nikola with Niemann + GM (links to article) | New component on `/` |
| E | **Auto-generated OG image per article** using existing `og-board-image.ts` pattern | Reuse, add fallback to cover_image |
| F | **`/press` page** — press kit, founder bio, downloadable logos, contact email | New page |
| G | **Founder Story pinned to top of `/news`** forever via `featured` flag | Migration sets it |
| H | **`<link rel="me">` to Nikola's socials** for Google author entity | index.html |
| I | **Sitemap `<lastmod>` set to NOW** on every news rebuild so Google recrawls | scripts/generate-sitemap.ts tweak |
| J | **Daily auto-ping IndexNow + Bing** when a news_post is inserted | DB trigger calling existing edge function |

Documented (not auto-built): GMB posts schedule, Reddit r/chess seeding rules, YouTube Shorts hooks, TikTok scripts (already exist), Quora answer farming, Wikipedia draft, HackerNews Show HN, Product Hunt launch checklist, Discord cross-post, podcast pitch list, school-club outreach template, chess clubs in Serbia outreach, Twitch raid coordination, IG Reels content calendar (15 prompts), influencer DM templates, viral share-card OG variants.

### 7. SEO scan
After everything is in, trigger a fresh SEO scan and tell user to open the SEO tab.

---

### Technical files to touch
- **New migration**: `supabase/migrations/<ts>_founder_news_seed.sql` — insert 6 articles, ensure featured story, set author_name.
- **Edit**: `src/pages/NewsItem.tsx` (author default), `src/pages/News.tsx` (header label), `src/pages/Nikola.tsx` (verify all sections + article list), `src/pages/AuthorNikola.tsx`.
- **Edit**: `scripts/generate-sitemap.ts` (news-sitemap publication_name + 48h filter + lastmod).
- **Edit**: `index.html` (RSS auto-discovery, `<link rel="me">`).
- **New**: `src/pages/Press.tsx`, route in `App.tsx`.
- **New**: `src/components/FounderTrustStrip.tsx` mounted on `/`.
- **New docs**: `docs/GOOGLE_NEWS_SUBMISSION.md`, `docs/GROWTH_PLAYBOOK.md`.
- **Asset uploads**: 3 photos via `lovable-assets`.

### What I need from you (Nikola) — can't be automated
1. Go to **Google Publisher Center** and submit MasterChess.live (I'll give you the exact steps in the doc).
2. In Google Search Console, submit `news-sitemap.xml`.
3. Verify domain ownership if not done.

Ready to build?
