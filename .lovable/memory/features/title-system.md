---
name: title-system
description: MasterChess MC-titles tied to BOT rating (1800/2000/2200/2400) + signup level picker
type: feature
---
Title thresholds (defined in src/lib/titles.ts) — DRIVEN BY `bot_rating`, not online rating:
- 1000 Chess Soldier · 1400 Tactical Fighter · 1700 Position Master
- **1800 MC-CM 🟤 · 2000 MC-FM 🔵 · 2200 MC-IM 🟣 · 2400 MC-GM 👑**
- 2600 MC-Super GM 🔥 · 2800 MC-Legend 💎 (prestigious = animated glow)

Rules:
- Titles are derived from BOT rating (the competitive ladder vs bots), NOT online rating.
- Titles NEVER get removed once earned. Persisted in `profiles.highest_title_key`.
- TitleBadge prefers `titleKey` (highest-ever) so a player who drops below 2200 still shows MC-IM.
- useTitleUnlock hook watches `profile.bot_rating` and fires the cinematic popup at threshold crossings.
- Profile header progress bar shows progress toward the next MC title using bot_rating.
- Leaderboard default sort is `bot_rating` (the MasterChess title ladder); rows show MC titles next to usernames.

Signup starting-level picker (src/lib/starting-levels.ts):
- L1 Beginner 800 · L2 Intermediate 1200 · L3 Advanced 1600 · L4 Expert 2000 · L5 Master 2200
- Choice on signup seeds `profiles.bot_rating` + `profiles.bot_peak_rating`.
- Existing users are NOT migrated — they keep their current bot_rating.
