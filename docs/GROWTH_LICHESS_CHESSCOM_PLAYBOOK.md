# Growth Playbook — What Lichess & Chess.com Actually Did

Two competitors, two radically different playbooks. Both worked. This doc distills the tactics we can steal — legally and without ever naming them on the public site.

## Lichess — "Free, open, and beautiful"

| Move | Why it worked | Our version |
|---|---|---|
| 100% free, open-source, no ads | Instant HN + Reddit love, thousands of dev-blog backlinks | Keep MasterChess free forever; publish a public "How we're funded" page |
| **TV** — spectate the top ongoing game, no login | Passive session-time monster; people leave the tab open all day | Build `/tv`: auto-rotate the highest-rated live game every 15s |
| **Studies** — shareable annotated boards with permanent URLs | #1 backlink magnet in the whole chess web (bloggers embed them) | Build `/study/:id` with OG board image + PGN import |
| Puzzle streak with **daily rating** | D30 retention machine | Extend `/puzzles` with a daily leaderboard + streak fire icon |
| Public API + embeddable boards | Every chess blog links back | We already have `EmbedWidgets` — push it in the docs footer everywhere |
| Zero dark patterns (no forced signup to watch) | Word-of-mouth | Keep `/vs/:code` and `/play-guest` forever loginless |
| Localized languages (>100) | Free traffic from every country | Our i18n is scoped to EN by policy — but city-hubs like `/chess-in/beograd` cover it |

## Chess.com — "Personality + funnel"

| Move | Why it worked | Our version |
|---|---|---|
| **Bot personalities** with faces, voice, taunts | Turned a boring engine into 30M+ paying users | We already have 9 bots — expand to 20, add short reaction video clips |
| **Daily Puzzle email** | Their single biggest retention lever (their own eng blog said so) | Cron a 09:00 local-time puzzle email via Resend |
| **Chess.com News** — full editorial team | Ranks in Google News, owns "chess news" queries | Our `/news` + `seo-content-generator` already prints; submit to Google News weekly |
| Influencer deals (Hikaru, Botez, Levy) | Twitch → signups | Sponsor 1-2 Balkan streamers with revenue-share affiliate codes |
| **Google Ads on "play chess online"** | €0.10 CPC in emerging markets | €5/day geo-fenced to Balkans on "besplatan šah online" |
| Account-wall on some content | Forced signups | We intentionally don't do this — but we can *offer* free premium week after 3 games |
| Coaches marketplace | Take rate 20%+ | `/coaches` route + Stripe Connect payout later |

## Immediate features to build (in priority order)

1. **MasterChess TV** (`/tv`) — highest-rated live game auto-picker + spectator chat.
2. **Studies** (`/study/:id`) — paste PGN → shareable board with move-by-move comments. Backlink magnet.
3. **Daily Puzzle Email + Streak** — resend-campaign cron at 09:00 UTC+1.
4. **Bot Video Reactions** — 3-second Framer Motion clip when a bot wins/loses.
5. **`/chess-in/:city`** city hubs (already scaffolded — publish 20 cities this week).

## Marketing channels — this week's checklist

- [ ] **Product Hunt launch** scheduled for Aug 12 (2 days after DB Cup for social proof)
- [ ] **Show HN: MasterChess TV** — post the day `/tv` ships
- [ ] **Reddit r/chess** soft post: "We ran a humanitarian blitz for [cause] — free platform" (story-first, not spammy)
- [ ] **Google Ads** €5/day, geo=RS/HR/BA/MK/SI, keywords: `besplatan šah online`, `šah turnir online`
- [ ] **YouTube Shorts** — auto-clip every DB Cup decisive game via `og-match-story`, post to DailyChess_12
- [ ] **Wikipedia SR** — stub article for Dragan Brakus citing our page (RS Wiki has looser notability)
- [ ] **GBP weekly posts** — cadence from `docs/GBP_WEEKLY_POSTS_CALENDAR.md`
- [ ] **IndexNow ping** on every `/news` and `/study` publish

## The one thing nobody else can copy

Neither Lichess nor Chess.com has a face. MasterChess has **Nikola**, 13, playing Niemann, streaming daily. That's the founder-story hook every article can lead with. Every AI-generated news post should reference him — that's the moat.
