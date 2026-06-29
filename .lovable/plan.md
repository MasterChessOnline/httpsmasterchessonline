## DB Chess Cup — Full Production Wave + 20 New Ideas

Goal: ship the remaining waves of the tournament engine so the Cup runs end-to-end with zero manual babysitting, then layer in high-impact "wow" features and a fresh prize structure that makes people actually show up.

---

### PART A — Finish the Engine (Waves 2–5)

**Wave 2 — Live Standings & Tiebreaks**
- Materialised `tournament_standings` view: points, Buchholz, Buchholz Cut-1, Sonneborn–Berger, Direct Encounter, # of wins, performance rating.
- Realtime channel `tournament:{id}:standings` so `/dragan-brakus/live` updates without refresh.
- Top-3 podium animation, "biggest upset of the round" card, "longest win streak" card.

**Wave 3 — Anti-Cheat Queue**
- Edge function `tournament-anticheat-scan`: per move, compare to Stockfish top-3 via `stockfish_eval_cache`; flag >85% match rate, sudden ACPL drop, tab-blur events from `online_game_presence`.
- Writes to `tournament_anti_cheat_flags` (already exists) with severity.
- Admin panel tab "Fair Play" with one-click Warn / Forfeit Game / Disqualify + auto-recompute pairings.

**Wave 4 — Pro Exports**
- Upgrade `tournament-export`: TRF16 (FIDE), full PGN bundle, XLSX standings with formulas (uses xlsx skill), printable PDF crosstable + certificates per player (PDF skill).
- One-click "Submit to Chess-Results" payload generator.

**Wave 5 — 512-Bot Dry Run Harness**
- Extend `TournamentTestHarness`: seed 512, auto-play all 9 rounds with Stockfish-lite, assert no pairing collisions, no color imbalance >1, no duplicate opponents, all standings consistent. Green check before opening real registration.

---

### PART B — 20 New Ideas to Make the Cup Actually Pop

**Prize layer (real + interesting, not just cash)**
1. **Master Coins prize ladder** — 1st 50k / 2nd 25k / 3rd 15k + top-10 all get 2k (already infra, just wire payouts table).
2. **"Brakus Bishop" unique badge** — permanent profile NFT-style badge for top 3, animated gold.
3. **1-year MasterChess Pro** for winner (unlock all themes, piece sets, AI review).
4. **Custom title prefix** ("DB-Cup Champion 2026") shown next to username site-wide for a year.
5. **Founder 1-on-1** — winner gets a recorded analysis session with Nikola, published on /news.
6. **Brilliancy Prize** (best game, voted by community) — 10k coins + featured on homepage.
7. **Upset of the Tournament** — biggest rating-diff win → 5k coins + badge.
8. **Fighting Spirit Prize** — fewest draws among top 50 → 5k coins.
9. **Junior Prize** (U16) and **Veteran Prize** (50+) — separate sub-podiums.
10. **Country Cup** — top 3 countries by sum-of-top-5 points → team badge for all members.

**Engagement / virality**
11. **Live "On the Board Now" ticker** on /dragan-brakus/live showing top-board moves in real time.
12. **Per-round share cards** auto-generated PNG ("I scored 4½/5 in DB Cup — join me") for Viber/IG/X.
13. **Predictions market** — users spend Master Coins to predict champion; winners split a pot.
14. **Spectator chat + emoji rain** on top 3 boards during live rounds.
15. **Round recap auto-post** — edge function summarises each round into a /news article with crosstable.
16. **Streamer overlay** — `/dragan-brakus/overlay?player={id}` transparent OBS widget with score, opponent, board.
17. **Invite leaderboard** — most referrals to the Cup wins 10k coins + "Brakus Ambassador" badge.

**Reliability / fairness**
18. **Auto-bye recovery** — if a player disconnects, 60s reconnect grace + auto-forfeit timer with notification.
19. **Pre-round readiness check** ("Click READY in next 2 min") to filter no-shows before pairings lock.
20. **Post-tournament hall of fame** page `/dragan-brakus/hall-of-fame` — permanent record, JSON-LD `SportsEvent` + `Person` for SEO long-tail ("Dragan Brakus Cup 2026 winner").

---

### Files to add / change

```text
supabase/migrations/<ts>_tournament_engine_wave2.sql    standings view, prize ladders, predictions, hall_of_fame
supabase/functions/tournament-anticheat-scan/index.ts   anti-cheat worker
supabase/functions/tournament-round-recap/index.ts      auto news post per round
supabase/functions/tournament-export/index.ts           TRF16 + PGN + XLSX + PDF upgrade
supabase/functions/tournament-engine/index.ts           readiness check + auto-bye recovery hooks
src/pages/DraganBrakusLive.tsx                          ticker, top-board chat, podium
src/pages/DraganBrakusHallOfFame.tsx                    new
src/pages/DraganBrakusOverlay.tsx                       OBS streamer widget
src/components/tournament/ShareCard.tsx                 per-round PNG share
src/components/tournament/PredictionsMarket.tsx
src/components/admin/TournamentFairPlay.tsx             new admin tab
src/components/admin/TournamentTestHarness.tsx          512-bot dry run extension
src/pages/AdminTournament.tsx                           wire Fair Play tab + prize ladder editor
src/pages/DraganBrakus.tsx                              new prize section + ambassador CTA
docs/DB_CUP_PRIZE_STRUCTURE.md                          single source of truth
```

No schema changes touch `auth/storage/realtime`. All new public tables get GRANTs + RLS in the same migration.

---

### Order of execution
1. Migration (standings view, prize ladders, predictions, hall_of_fame, readiness flag).
2. Engine waves 2 → 3 → 4 → 5 (anti-cheat, exports, dry-run).
3. Prize ladder UI + payouts wiring.
4. Live ticker, share cards, overlay, predictions, recap function.
5. Hall of Fame + ambassador leaderboard.
6. Run 512-bot dry run end-to-end and post the green-check report.

Reply **continue** to ship.
