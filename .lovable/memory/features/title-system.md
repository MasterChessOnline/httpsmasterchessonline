---
name: title-system
description: MasterChess title thresholds (Chess Soldier → MC-Legend) and how titles never downgrade
type: feature
---
Title thresholds (defined in src/lib/titles.ts):
- 1000 Chess Soldier · 1400 Tactical Fighter · 1700 Position Master
- 1900 MC-CM 🟤 · 2100 MC-FM 🔵 · 2300 MC-IM 🟣
- 2500 MC-GM 👑 · 2600 MC-Super GM 🔥 · 2800 MC-Legend 💎 (prestigious = animated glow)

Rules:
- Titles NEVER get removed once earned. Persisted in `profiles.highest_title_key`.
- TitleBadge component prefers `titleKey` (highest-ever) over `rating` so a player who drops below 2300 still shows MC-IM.
- useTitleUnlock hook + TitleUnlockGate at root render the cinematic popup automatically when a player crosses a new threshold.
- Always render TitleBadge next to username on profile, leaderboard, bot profile pages.
