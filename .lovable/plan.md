# MasterChess Mega Update — Phased Plan

This is a huge scope. To ship safely without breaking the live site, I'll split it into phases. **Phase 1 is what I'll build now** (entry, English-only sweep, home page polish). The rest are queued — confirm and I'll continue phase by phase.

---

## Phase 1 — Ship now

### 1. English-only across the entire site
- Force `I18nProvider` default to `en` and ignore stored non-en value unless the user re-picks it.
- Remove the language switcher from the navbar / settings entry points so every button label, tooltip, toast and page stays English.
- Sweep any remaining Serbian/Russian/Spanish strings I find in components (mostly toasts and a few labels).

### 2. Entry Screen — premium rebuild (`AppLaunchSplash.tsx`)
- Pure black background, centered MasterChess logo with soft gold glow.
- Smooth fade-in + gentle zoom-in (Framer Motion, ~600ms in, hold, ~500ms out).
- **No** loading bar, **no** percentages, **no** "Loading…", **no** counters.
- While splash is visible: prefetch home route chunk + warm key queries (profile, battle pass progress, daily missions, active season, coins) in parallel via `queryClient.prefetchQuery` / dynamic imports.
- Fixed 3.0s minimum so logo always feels intentional; dismiss only after prefetch settles (max 4.5s safety timeout).
- Cross-fade into Home so the page appears as one piece, no element pop-in.

### 3. Home Page anti-flicker pass (`Index.tsx`)
- Reserve space for hero, Play Now, card grid, and Daily Missions with skeletons sized to final layout (kills CLS).
- Convert staggered `motion` enters above the fold into a single coordinated fade so the page lands as one frame after splash.
- Keep section order: header strip → big **PLAY NOW** + time-control row → main cards (Battle Pass, Daily Missions, Tournaments, Spin, Shop, Friends, Live) → Daily Missions panel → **Rate this site** → Online Friends / Recent Games / Leaderboard / News.
- Mobile: tighten paddings, lazy-mount below-the-fold blocks with `content-visibility:auto` so first paint is instant.

---

## Phase 2 — Battle Pass full (Brawl-Stars style)
- 50 tiers + Bonus 51+, Free + Premium tracks, horizontal reward rail, claim animations, confetti.
- Season hub already exists — extend schema (`battle_pass_claims` track type, premium flag) and UI.

## Phase 3 — Spin The Wheel 2.0
- Server-authoritative result first, then animation locks to it. Daily / Weekly / Event / Legendary spins.

## Phase 4 — Shop 2.0, Titles, Friends polish, Chat, Clubs, Tournaments 2.0, Live Matches, Replays, Opening Mastery, Advanced Stats, Nikola Bot tuning, global performance pass.

---

## Technical notes (for reference)
- **Files Phase 1 touches:** `src/i18n/I18nProvider.tsx`, `src/components/AppLaunchSplash.tsx`, `src/pages/Index.tsx`, navbar component (remove lang switch), maybe `src/App.tsx` for prefetch hook.
- **No DB migration needed in Phase 1.** Phase 2 will need a small migration for premium battle-pass track.
- **No new dependencies.** Framer Motion + React Query are already in.

---

**Confirm to proceed with Phase 1.** After it ships and you've checked the entry + home feel right on your phone, I'll move into Phase 2 (Battle Pass) and continue down the list.
