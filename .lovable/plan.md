# Plan: Full site audit + viral "explode" boosters

## Part 1 — Audit (read-only checks, no code changes)

1. **Build & runtime health**
   - Check dev-server logs (sqlite daemon + `/tmp/dev-server-logs/dev-server.log`) for errors/warnings.
   - Run `supabase--linter` + `security--run_security_scan` to catch RLS / policy regressions after recent migrations (donations, battle pass, clans, voice chat).
   - `seo_chat--list_findings` to see open SEO issues.

2. **Critical user flows (browser preview)**
   - `/` homepage — SupporterCTA, DonationProgressBar, FounderNote, FAQ render OK on mobile (369px).
   - `/supporter` — 3 tiers + custom amount → `create-payment` returns Stripe URL (test mode).
   - `/play-guest`, `/vs/{code}`, `/puzzles`, `/beat/{botId}` — growth funnels load.
   - `/tournaments`, `/battle-royale`, `/battle-pass`, `/live`, `/community` — main loops.
   - Footer + SeoMegaFooter links resolve, no competitor brand leaks.

3. **Data sanity**
   - `get_donation_progress()` returns expected shape; active goal row exists.
   - `purchases` rows for completed donations increment the total.
   - No fake/ghost data leaked into matchmaking, leaderboards, clans.

4. **Report** — list what works, what's broken, what's risky. No fixes in this plan; fixes go in a follow-up after you approve.

## Part 2 — "Explode" growth boosters (proposed, pick what you want)

Ranked by viral impact ÷ effort. Each is small and isolated.

**A. Share-to-unlock & viral loops**
1. **Auto-generated post-game share card** (PNG) — final position + result + your handle + `masterchess.live/vs/{code}` watermark. One-click "Share to X / WhatsApp / IG story". Massive organic reach.
2. **Referral rewards** — `referrals` table already exists; wire it: inviter gets 100 coins + Battle Pass XP when invitee plays first ranked game. Show "Invite 3 friends → unlock Gold board" progress on profile.
3. **Daily streak push** — `push_subscriptions` exists; add a 9pm local cron via edge function: "Your streak ends in 3h 🔥".

**B. FOMO & live energy (fights ghost-town feel)**
4. **"Live now" ticker** on homepage — real online_games count + last 5 finished games scrolling (real data only, per your no-fake rule).
5. **Daily King spotlight** — top winner of last 24h pinned on `/` with crown animation; uses existing `daily_kings`.
6. **Spectate one-click** — featured live game embedded on homepage hero for logged-out users.

**C. Donation amplification**
7. **Donor wall** on `/supporter` — last 10 donors (handle or "Anonymous") + sparkle animation when new donation lands (realtime).
8. **Milestone unlocks** — at 25/50/75/100% of goal, unlock a sitewide cosmetic (e.g., gold particles in lobby) for everyone. Turns donating into a community event.
9. **"Buy me a move" micro-tip** in spectator mode — $1 tip to streamer's queue, uses existing `stream_donations`.

**D. SEO long-tail explosion**
10. **Programmatic opening pages** — `/openings/{eco-code}` generated from existing opening tree, each with explorer + "Play this opening vs bot" CTA. ~500 indexable pages.
11. **Programmatic puzzle pages** — `/puzzle/{id}` with og:image of the position; shareable + indexable.

**E. Stickiness**
12. **Weekly recap email** — uses existing email infra; "You played 23 games, +47 ELO, beat Magnus-bot once". Drives return visits.
13. **Cmd+K → "Challenge a friend"** shortcut that copies a `/vs/{code}` link to clipboard instantly.

## Technical scope (for the followups)

- Share card: Deno edge function with `@deno/satori` or canvas, returns PNG; `<meta property="og:image">` per game.
- Live ticker: Supabase Realtime channel on `online_games` (insert/update), no polling.
- Donor wall: Realtime on `purchases` filtered to `itemType='donation'` via SECURITY DEFINER view (don't expose emails).
- Milestone unlocks: extend `get_donation_progress` to return current milestone tier; gate CSS via a single class on `<body>`.
- Programmatic SEO: dynamic route + `sitemap.xml` generator script run at build.

## Deliverable of THIS plan

Approve → I run the audit, post findings, and you pick which boosters from A–E to build next. No code changes happen until you say which ones.
