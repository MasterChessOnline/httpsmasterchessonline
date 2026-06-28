## Dragan Brakus Cup — Pairings, Chess-Results & Marketing Wave

### 1. Swiss Pairings Engine (Chess-Pairings compatible)

Build a real FIDE Swiss pairing system inside MasterChess so the tournament doesn't depend on any external site at run time, but its exports drop straight into Chess-Pairings / Swiss-Manager / Chess-Results.

- New edge function `tournament-pair-round` — implements Dutch Swiss (FIDE 04.1):
  - Sort by score → rating, split into score groups, top-half vs bottom-half pairing, color balancing, no repeat pairings, floaters, bye to lowest-rated unpaired.
  - Writes into existing `tournament_pairings` (board, white_id, black_id, round, result).
- Admin button on `/admin/tournaments/:id` → "Generate Round N" + "Publish round" + "Close round" (auto 1-0 / 0-1 / ½-½ from `online_games`, manual override).
- After each round, auto-run `recalc_tournament_tiebreaks` (already exists).

### 2. Chess-Results / Swiss-Manager export bridge

Extend the existing `tournament-export` function with the formats Chess-Results actually ingests:

- **TRF16** (FIDE official) — already partially there, complete header (Tournament Name, Federation, Chief Arbiter Nikola Šakotić, Time Control 3+2, Date, City Belgrade, Type Swiss, Rounds 9, FIDE Rated yes).
- **Swiss-Manager TUR** export (zipped TRF + crosstable).
- **PGN bundle** per round, named `R{n}_{white}-{black}.pgn`.
- One-click "Push to Chess-Results" panel in `/admin/tournaments/:id`: generates a `.zip` with TRF + crosstable + PGN and copies the upload URL `https://chess-results.com/AdminUpload.aspx`. (No public Chess-Results API exists — file upload is the only path.)

### 3. Tournament registration UX upgrade

`/tournaments/dragan-brakus-cup/register` already exists; harden it:

- Real-time **player counter** ("47 / 500"), starts-in countdown, "Check-in opens in …".
- Auto-create `online_game` rooms when round is published, redirect players from `/tournament/:id/live` straight into their board with clock 3+2 pre-loaded.
- Pairing display: bracket-style table + "My next game" card with opponent name, rating, board #, color.
- Withdrawal & bye request buttons (half-point bye if requested before round start).
- Anti-cheat hooks: tab-switch counter, paste blocker, already-flagged via `tournament_anti_cheat_flags`.

### 4. Google Maps event marketing

- Extend `gbp_posts` seed with **9 scheduled GBP posts** — one per round, plus pre-event teaser, check-in reminder, winner announcement.
- Update `/dragan-brakus` with `Event` JSON-LD `eventStatus`, `eventAttendanceMode: OnlineEventAttendanceMode`, `organizer.location` linked to the GBP place ID → makes the event eligible to show in Google Maps "Upcoming events" panel.
- Add `OG:image` (1200×630) generator for the event — used by GBP post + WhatsApp/Telegram shares.
- New page `/dragan-brakus/live` — public live standings page, no login, indexable, with auto-refresh; the kind of page chess journalists screenshot.

### 5. "Brutal" marketing ideas to ship now

- **Prize escalator**: every 50 registrations unlocks +€X to prize fund — shown live on landing page → creates FOMO + share loop.
- **Referral leaderboard for the Cup**: each player gets `/dragan-brakus?ref={code}`; top 3 referrers get free entry to next event + badge. Uses existing `referrals` table.
- **Press kit page** `/dragan-brakus/press` — high-res logos, founder photo, one-line/one-paragraph/full bio, downloadable ZIP. Email-pitchable to Politika, B92, RTS, Šahovski glasnik.
- **Founder angle**: every news article and GBP post leads with "13-year-old founder organizes 500-player FIDE-rated charity Swiss" — same angle that worked on `/nikola`.
- **WhatsApp/Telegram share buttons** with pre-filled Serbian + English copy on the landing page (today the page has none).
- **Auto-tweet/X post** edge function `tournament-broadcast` posts round results to an X account (requires user to add an X API token later — not blocking).
- **Daily countdown email** to all registered players (T-7, T-3, T-1, day-of) via existing email infra.
- **Embed widget** `/embed/dragan-brakus` (iframe) — clubs can paste it on their own sites, every embed is a backlink.

### Technical section

- New file: `supabase/functions/tournament-pair-round/index.ts` (Dutch Swiss).
- Extend: `supabase/functions/tournament-export/index.ts` (add `trf16`, `swiss-manager-zip`, `pgn-bundle`).
- New pages: `src/pages/DraganBrakusLive.tsx`, `src/pages/DraganBrakusPress.tsx`, `src/pages/EmbedTournament.tsx`.
- Update: `src/pages/DraganBrakusCup.tsx` (counter, share buttons, prize escalator, JSON-LD upgrade).
- DB migration: add `prize_pool_eur`, `prize_escalator_step`, `referral_count` to `tournaments`; add `withdrew_at`, `bye_rounds` to `tournament_registrations`.
- Seed: 9 additional `gbp_posts` rows for the Cup.
- Sitemap: add `/dragan-brakus/live`, `/dragan-brakus/press`, IndexNow ping.

### Out of scope (flag, don't build)

- Live Chess-Results API push — site has no public API, only file upload; covered by the export bridge.
- X/Twitter auto-broadcast actual posting — needs user-provided API token (request later via `add_secret`).

---

Ship all of it in one wave, or split (Pairings + Export first, marketing second)? And is the prize fund a fixed amount or fully escalator-based?
