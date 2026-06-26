# MasterChess.live — Brutal Growth Playbook

Goal: take MasterChess.live from cold-start to a daily-return chess platform with permanent
Google presence. This is the no-fluff list of moves that actually shift the needle.

## A. Personal-brand SEO (highest leverage)

The "13-year-old Serbian kid who built a chess platform alone" story is rare and shareable.
Lean into it everywhere.

1. **Wikidata entry** for Nikola Šakotić — link `sameAs` to `/nikola-sakotic`, YouTube,
   Wikipedia (when eligible). Even Wikidata-only signals feed Google's Knowledge Graph.
2. **YouTube channel "Nikola @ MasterChess"** — weekly 60-second Shorts:
   - "I built a chess site at 13. Roast my code."
   - "Beating an 1800-rated bot I wrote myself."
   - "Day in the life of a 13-year-old solo founder."
   Each Short → description links to `/news/how-13-year-old-built-masterchess-live`.
3. **GitHub profile README** with the story → links to MasterChess.live. Devs upvote teen founders.
4. **TikTok** short loops of fast wins on MasterChess.live with screen recording + face cam.
5. **Press list (cold email)**: Hacker News (Show HN), Indie Hackers, Reddit r/SideProject,
   r/chess, r/InternetIsBeautiful, Product Hunt, BetaList, ChessBase, Chess.com community blogs,
   local Serbian tech press (Netokracija, Startit, IT Klub). Templates in `docs/PR_PITCHES.md`.

## B. Google News / Maps / GBP

1. Submit `MasterChess.live` to **Google Publisher Center** — see `GOOGLE_NEWS_SUBMISSION.md`.
2. **Google Business Profile**: claim "MasterChess.live" as a service-area business in Belgrade,
   Serbia. Category: *Game Developer*. Add 10 photos (founder, brand shirt, screenshots),
   reviews, and weekly GBP posts mirroring `/news`.
3. **Maps embed** on `/about` and city landing pages — increases local pack relevance.
4. **Local schema** (`LocalBusiness`) on `/chess/:slug` city pages (already shipped).
5. **Review loop**: prompt happy users after a 3-game win streak to leave a Google review.

## C. Content velocity (the unfair advantage)

- Programmatic SEO pages already shipping: `/beat/{bot}`, `/chess/{city}`, `/chess-for/{age}`,
  `/openings/{slug}`. Keep expanding — each is a long-tail Google entry point.
- **Daily news** during launch month (target: 25 articles in 30 days).
- **Weekly blog** of opening guides — already 12 seeded; add 4/month.
- **Auto-ingested chess news** from FIDE/ChessBase/TWIC — keeps the site "alive" between
  founder posts.
- **Auto-OG images** for shared games (`/vs/{code}`) — viral loop on Twitter/Discord.

## D. Cold-start matchmaking fixes

The #1 reason new users churn: empty lobbies. Mitigations:

1. **Showcase scheduled tournaments** on the homepage — MasterChess Monday, Friday Night Fire,
   Sunday Classic (already live). Banner: "Next event in 2h 14m — 47 registered."
2. **Bot-instant-fallback** when no opponent in 20s: offer a same-rating bot game *labeled*
   as a bot (never silently). Builds engagement without lying.
3. **Async ladder**: correspondence-style matches that resolve over hours.
4. **Invite-a-friend** with both sides getting a permanent badge + 500 coins.
5. **Public live game ticker** on the homepage: "47 games in progress right now."

## E. Distribution channels (rank-ordered by ROI)

| Channel              | Effort | Expected first-month impact |
|----------------------|--------|------------------------------|
| Reddit r/chess + r/SideProject (founder story) | 1h | 500–5000 visitors |
| Hacker News (Show HN, weekday 14:00 UTC) | 2h | 1000–20000 visitors if FP |
| YouTube Shorts (3×/week, founder face) | 6h/wk | Compounds; 10k–100k views in 90d |
| TikTok (same Shorts repurposed) | 0.5h/wk | Variable, can spike |
| Twitter/X (founder thread + auto-OG game shares) | 1h/wk | Slow but compounds |
| Local Serbian tech press (Netokracija, Startit) | 2h | Domain authority backlinks |
| Chess Discord servers (real participation, not spam) | 1h/wk | High-retention users |
| Product Hunt launch | 8h | One-time spike, lasting backlink |
| Local school chess clubs (Belgrade, Novi Sad) | 4h | Real ELO games, retention |

## F. Retention loops (so traffic sticks)

- **Daily missions** with streak counter (already shipped — surface it on first login).
- **Push notifications** (PWA) for "Your friend X just challenged you" and "Friday Night Fire
  starts in 1h — you're registered."
- **Weekly recap email**: rating delta, best game, next event.
- **Battle Pass season** every 30 days with cosmetics (free + premium tier later).
- **Clan vs. clan** weekly events.

## G. Authority / E-E-A-T

- **Founder page** (`/nikola-sakotic`) with photos, achievements, news coverage — shipped.
- **Press kit** (`/press` and `/press-kit`) — shipped.
- **About page** with team, mission, contact, country (Serbia).
- **Terms / Privacy / Imprint** with a real address.
- **Schema.org**: `Organization`, `Person` (founder), `NewsArticle`, `LocalBusiness`,
  `BreadcrumbList`, `FAQPage` — all shipped.

## H. Brutal moves (do these and watch numbers move)

1. **Show HN** post titled: *"Show HN: I'm 13 and I built a chess site solo (MasterChess.live)"*
2. **One viral TikTok** of yourself wearing the MasterChess shirt at the Belgrade event,
   captioned: *"They didn't know a 13-year-old built a chess site they're standing next to."*
3. **Cold-email Hikaru's, Levy's (GothamChess), Anna Cramling's, Eric Rosen's** managers with
   the founder story and an offer to play you on stream.
4. **Sponsor one Belgrade school chess tournament** for €100 — get photos, post coverage on
   MasterChess.live News, tag the school.
5. **Run a public bounty**: "First person to hit 2200 ELO on MasterChess.live gets a €100
   custom chess set." Cheap PR, huge engagement.
6. **Open-source one piece** (e.g. the bot personality engine) on GitHub — devs upvote, links
   come for free.
7. **Submit to BetaList, Product Hunt, IndieHackers Best of Week.**

## I. Measurement

- Track in Plausible/PostHog/GA4: source/medium per article URL.
- Search Console: monitor impressions on `nikola sakotic`, `masterchess live`, `13 year old
  chess founder`, `play chess no ads`, `chess no bot fill`.
- Weekly review: which articles drove signups, which channels drove retention.

## J. Anti-patterns to avoid

- Don't spam Discord servers — get banned, lose reputation.
- Don't fake reviews — Google will detect and demote.
- Don't buy traffic — bounces hurt rankings worse than no traffic.
- Don't run ads until retention loops work (CAC will burn the runway).
- Don't translate everything yet — focus English first, then Serbian.
