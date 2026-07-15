## Plan: DB Cup date fix + new official logo everywhere + growth push to 100 users

### 1. DB Chess Cup — new date/time
Change everywhere from `5 July 2026, 17:00 CEST` to **18 July 2026, 16:00 CEST** (UTC = 14:00Z).

Files to update:
- `src/components/BrakusHeroBanner.tsx` — `EVENT_AT`, `HIDE_AFTER`, all "5 July" / "17:00" copy
- `src/components/BrakusRibbon.tsx` — date label already dynamic, but seed tournament date drives it; also update any hardcoded strings
- `src/pages/Index.tsx` — hero card "5 July 2026 · 17:00 CEST"
- `src/pages/IndexFull.tsx`, `IndexFast.tsx` — any DB Cup mentions
- `src/components/TonightArenaBanner.tsx` — if referencing
- DB tournament row: `UPDATE tournaments SET starts_at='2026-07-18T14:00:00Z' WHERE name ILIKE '%Dragan Brakus%'` (migration)
- Docs: `docs/DRAGAN_BRAKUS_GBP_EVENT.md`, prize/GBP calendar files, sitemap news items
- SEO: `index.html` og/meta if DB Cup is mentioned; `public/news-sitemap.xml`, `public/rss.xml`

### 2. New official logo (uploaded crown-in-rounded-square)
Register upload as a Lovable asset once, then reuse:
```
lovable-assets create --file /mnt/user-uploads/image-51.png --filename masterchess-logo.png \
  > src/assets/masterchess-logo.png.asset.json
```
Replace logo/icon references site-wide:
- `src/components/Navbar.tsx` (currently Crown lucide icon) → `<img src={logo.url}>`
- `src/components/Footer.tsx`
- `src/components/CinematicIntro.tsx` (lucide Crown → logo image)
- `src/pages/Index.tsx` hero crown badge
- Any auth pages / Signup / Login header lucide-Crown swap
- `index.html` — `<link rel="icon">`, `apple-touch-icon`, `og:image`, `twitter:image` all point to the new logo URL (absolute https from the asset CDN)
- `public/manifest.json` — PWA icons 192/512 → new logo
- `public/sw.js` — notification icon
- `capacitor.config.ts` — app icon reference (note: real native icon regen still needs Android/iOS asset export, out of scope)

### 3. Marketing / growth ideas (target: 100 real users fast)
I'll build these into the app during implementation, grouped by priority. Pick what you want in scope — I recommend all of Tier 1 now:

**Tier 1 — ship this pass (highest ROI, low effort):**
1. **Referral loop** — every user gets `/r/{code}`; inviter + invitee both get 250 coins + a "Founder Friend" badge. Live counter on profile.
2. **Viral share card generator** — after every win, one-tap "Share result" produces a PNG (final position + rating gain + username + masterchess.live) for WhatsApp/IG/X.
3. **DB Cup FOMO countdown** in hero + sticky ribbon (new date drives it) with "X players registered · Y spots left" pulled live.
4. **Free-entry perks** — new signup gets 500 coins + 3 free bot puzzles unlocked (already partly present, surface it on Signup page).
5. **Guest-to-user conversion** — after 1 guest game, soft-prompt "Save your rating — 1-tap signup" with Google OAuth.

**Tier 2 — next pass:**
6. **Daily login streak** with escalating rewards (already exists — just promote on home).
7. **"Challenge a friend" link** `/vs/{code}` shareable to WhatsApp — creates a private 1-tap match.
8. **Weekly leaderboard** with public URL; top 3 pinned to home = social proof.
9. **DB Cup registration wall of names** (public, indexed) — SEO magnet + ego share.
10. **Auto-tweet/discord webhook** on: new tournament registration, new top-10 finish, big upsets — pipes activity into your channels.

**Tier 3 — content/SEO (compounds over weeks):**
11. Country landing pages (`/chess/serbia`, `/chess/germany`…) — already partly seeded via `sitemap-cities.xml`; add proper H1 + local player counter.
12. "Beat the bot" landing per bot (`/beat/{botId}`) — already exists per memory; add Open Graph share card.
13. Puzzle-of-the-day auto-post to X + Discord with FEN preview image.
14. Blog posts targeting long-tail: "best free chess site 2026", "chess vs bots free", etc.
15. YouTube — coordinate with DailyChess_12 for a "Play me live on MasterChess" video.

**Tier 4 — community flywheel:**
16. Clan invite links + clan quests already exist; surface a "Create your clan" CTA on the home for new users.
17. Discord OAuth already wired — auto-role by rating tier for bragging rights.
18. Push notifications when a friend comes online (opt-in).

### 4. Technical section (for reference)
- New DB Cup datetime: JS `new Date("2026-07-18T14:00:00Z")` (16:00 CEST = UTC+2).
- Logo asset: single JSON pointer imported wherever needed; no binary in repo.
- Migration file for tournaments row update; RLS unaffected.
- No schema changes required for Tier 1 marketing except referral: add `referrals(inviter_id, invitee_id, created_at, reward_granted)` with RLS + GRANTs; add `profiles.referral_code text unique`. Coin grants via existing coin RPC.

### 5. Verification
- Playwright: load `/`, screenshot hero — confirm "18 July 2026 · 16:00 CEST" and new logo pixel visible.
- Confirm favicon + PWA icon updated (hard-reload).
- Register test user through `/r/{code}` and assert both wallets +250.

---
**Before I build:** confirm two things —
(a) Ship **all of Tier 1** now, or subset?
(b) Should the new logo also replace the animated hero crown/`CinematicIntro`, or keep the animated Crown there and only swap header/favicon/PWA?
