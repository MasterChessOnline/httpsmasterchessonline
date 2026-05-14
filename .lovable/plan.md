
# Plan: Make MasterChess Explode — Daily Retention + AI Coach + Trust

Goal: give people a real reason to open the site **every single day**, fix the AI Coach so it actually works, and add trust signals so new visitors convert instead of bouncing.

---

## 1. Daily Retention Engine (the "why come back every day" loop)

**a) Daily Puzzle Replacement — "Daily Challenge"**
Since the project policy forbids static puzzles, build a daily *play* challenge instead:
- "Daily Bot" — a different bot personality each day with a unique theme (e.g. Monday: aggressive gambit bot, Tuesday: defensive wall bot).
- "Daily Opening Mission" — play 1 game using today's featured opening, earn XP bonus.
- "Daily Time Control" — rotates bullet/blitz/rapid daily; finishing 1 game = streak credit.

**b) Streak System (real, server-side)**
- Table `daily_streaks` (user_id, current_streak, longest_streak, last_active_date, freezes_remaining).
- Edge function `check-streak` runs on first login of the day, increments or resets.
- 2 "streak freeze" tokens per month so a missed day doesn't kill motivation.
- Streak fire icon in navbar with count; 7/30/100-day milestone rewards (XP, badges, profile flair).

**c) Daily Login Rewards**
- Day 1: +50 XP → Day 7: rare badge → Day 30: profile aura/title.
- Pop-up "claim today's reward" modal on first daily visit.

**d) Daily Leaderboards (reset every 24h)**
- "Today's Top 10" for: most games won, longest win streak today, biggest rating gain today.
- Resets at 00:00 UTC. Creates fresh competition daily.

**e) Push notifications + email**
- Browser push: "Your streak ends in 4 hours" / "Daily bot is waiting".
- Optional email digest: weekly recap of rating change, games played, streak.

---

## 2. Make AI Coach Actually Work

Current AI Coach likely exists but isn't fully wired. Plan:
- Audit current `AICoach` component / edge function.
- Build/repair edge function `ai-coach` using Lovable AI Gateway (`google/gemini-3-flash-preview`) — no user API key needed.
- Inputs: current PGN + last move + player rating.
- Outputs: short natural-language coaching tip ("You're overextending the queen — try Nf3 to develop"), shown in a side panel during/after games.
- Post-game: "Coach Review" — narrative summary of 3 key moments (no engine eval bar, just verbal analysis per project policy).
- Cache per-position responses in `coach_cache` table to control cost.
- Rate-limit: 20 coach requests/user/day on free tier.

---

## 3. Trust Signals (so first-time visitors don't bounce)

**a) Homepage trust strip**
- "X games played today" (real count from DB)
- "X players online right now" (real presence count)
- "X countries represented" (from profile country field)
- Testimonials carousel (real quotes once we have them; until then, hide instead of faking — project rule: zero fake data).

**b) Safety & fairness page** `/fair-play`
- Explain anti-cheat, no-engine-during-human-play policy, manual review, reporting flow.
- Visible link in footer + during signup.

**c) Transparency page** `/about`
- Who built it, the no-puzzle / authentic-play philosophy, contact email.
- Link to public roadmap.

**d) Social proof**
- Embed real DailyChess_12 YouTube subscriber count via YouTube Data API.
- Show recent featured games on homepage (real games from DB).
- "As featured in" — only add real mentions; leave empty if none.

**e) Security badges**
- "Encrypted accounts", "GDPR-friendly", "No ads, no tracking" badges in footer.

---

## 4. Growth Boosters (explode mode)

**a) Viral share moments**
- After every win, auto-generate a shareable PNG card (final position + rating change + bot/player name + masterchess.live watermark). One-click "Share on X / Reddit / WhatsApp".
- "Year in chess" wrapped recap for returning users.

**b) Referral program**
- Unique invite link per user. Both inviter and invitee get a "Pioneer" badge + XP boost when invitee plays 3 games.
- Public referrer leaderboard.

**c) Embeddable mini-board widget**
- `<iframe src="masterchess.live/embed/...">` for streamers and bloggers to embed a live board → free backlinks.

**d) Public profile = SEO surface**
- Make `/players/:username` indexable with real stats, recent games, badges. Each active user = one more Google-indexed page.

**e) "Beat the bot in 60s" no-signup hook on homepage**
- Hero board where a fresh visitor can immediately play a 60-second game vs an easy bot without account. Conversion to signup after the game ends.

---

## Technical scope

```text
DB (new tables)
├── daily_streaks
├── daily_rewards_claimed
├── daily_challenges (today's bot/opening/time control)
├── daily_leaderboard_snapshots
├── coach_cache
└── referrals

Edge functions
├── check-streak           (idempotent daily streak update)
├── ai-coach               (Lovable AI Gateway, cached)
├── daily-challenge-gen    (cron 00:00 UTC — picks today's bot/opening)
├── leaderboard-reset      (cron 00:00 UTC)
└── share-card             (generates PNG via @vercel/og style)

Frontend
├── components/StreakBadge.tsx
├── components/DailyRewardModal.tsx
├── components/DailyChallengeCard.tsx (homepage hero block)
├── components/AICoachPanel.tsx (in-game side panel)
├── components/ShareWinCard.tsx
├── components/TrustStrip.tsx
├── pages/FairPlay.tsx
├── pages/About.tsx
└── pages/Referrals.tsx
```

All values must be **real** — no ghost numbers, no fake testimonials, no simulated activity (project Core rule).

---

## Build order (so it ships fast, not all at once)

**Phase 1 — Retention spine (highest ROI):**
1. Streak system + navbar badge
2. Daily challenge card on homepage
3. Daily login reward modal

**Phase 2 — AI Coach working end-to-end:**
4. Audit + repair `ai-coach` edge function with Lovable AI
5. Side-panel UI + post-game coach review

**Phase 3 — Trust + viral:**
6. Trust strip + `/fair-play` + `/about`
7. Share win card + referral system
8. Daily leaderboards + push notifications

Reply with **"go phase 1"** (or which phase you want first) and I'll start building.
