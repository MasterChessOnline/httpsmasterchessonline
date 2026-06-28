# DB Chess Cup — Growth & Integration Plan

Goal: get DB Chess Cup to 50+ registered players with friction-free signup, third-party pairing bridge (chesshost.app), shareable invite link, instant email confirmation, and a visible prize ladder.

## 1. ChessHost.app pairing bridge

ChessHost.app does not expose a public REST pairing API, so we integrate at the data-exchange layer (same way arbiters use Swiss-Manager).

- New edge function `chesshost-export`:
  - Output the tournament in **TRF(x)** format (FIDE standard, what ChessHost imports).
  - Output a JSON manifest (players, round, pairings, results) for re-import.
- New edge function `chesshost-import-results`:
  - Accepts pasted TRF/JSON from ChessHost after each round.
  - Writes results back into `tournament_pairings` and recomputes standings/tiebreaks.
- Admin UI on `/dragan-brakus` (arbiter-only):
  - "Open in ChessHost" button → downloads TRF and opens https://chesshost.app in a new tab with copy-paste instructions.
  - "Import round results" textarea.
- Public note on landing page: "Pairings powered by FIDE Dutch Swiss · mirrored to ChessHost.app".

## 2. Invite link system

- New table `tournament_invites` (code, tournament_id, created_by, uses, max_uses, reward_coins).
- Route `/i/:code` → resolves to tournament register page, auto-fills referrer.
- Each registered player gets a personal invite link from their profile; +50 Master Coins per successful registration (capped 10).
- Share buttons: WhatsApp, Telegram, X, Facebook, copy link, QR code (using existing `qrcode` lib).

## 3. Open registration + email confirmation

- Registration form on `/dragan-brakus`:
  - Email required, name required, FIDE ID optional (auto-fill via existing `fide-lookup`).
  - Works for guests (no login wall) — creates a pending registration tied to email; converts to account on first login.
- Trigger send via existing `send-transactional-email`:
  - New template `db-cup-registration-confirmed.tsx` (start time, venue, what to bring, calendar .ics link, invite link).
  - Idempotency key `db-cup-confirm-{registration_id}`.
- Existing 2h reminder cron already covers pre-tournament email.
- Add `db-cup-24h-reminder` template + cron filter.

## 4. Prize ladder (visible on landing)

Non-cash, MasterChess-native (per existing memory: no cash prizes):
- 1st: Grandmaster Crown badge + 10,000 Master Coins + custom board skin + featured Founder interview
- 2nd: Master badge + 5,000 coins + premium piece set
- 3rd: 3,000 coins + bronze badge
- Top 10: "DB Cup Finalist" profile flair
- Best U1600 / U1200 / Junior (U14) / Female / Senior (50+): 1,000 coins each
- Biggest upset: "Giant Slayer" unique badge
- Every finisher: participation NFT-style badge + 200 coins
- Sponsor spot: small Dragan Brakus tribute banner

Stored in existing `tournament_prizes`.

## 5. Growth pack to hit 50+ players

- **Public registrant counter** on landing ("32 / 50 seats filled") with progress bar — social proof.
- **Early-bird perk**: first 20 registrants get exclusive "Founder's Knight" badge.
- **Team captain mode**: anyone who brings 3 friends gets free entry to next event + Captain badge.
- **Country/city leaderboard** on landing (who has most signups from Belgrade, Novi Sad, etc.).
- **Auto-post to /news** when milestones hit (10, 25, 40, 50 registrants) + IndexNow ping.
- **Homepage countdown ribbon** (already exists) — extend with live registrant count.
- **Cross-promo banners** on `/play`, `/puzzles`, `/lessons` for logged-in users with one-click register.
- **Push notification** to all opted-in users 48h, 24h, 2h before start.
- **Embed widget** (`/embed/db-cup`) so partner sites/blogs can paste a live counter iframe.
- **Affiliate codes** for chess coaches/clubs to track sign-ups (uses existing `affiliates`).
- **Post-registration share prompt** ("You're in! Share to unlock bonus coins").

## 6. Technical sections

### DB
- `tournament_invites` table + GRANTs + RLS (read public, insert authenticated, update via RPC).
- Add `referrer_invite_code`, `confirmation_sent_at` columns to `tournament_registrations`.
- RPC `redeem_invite(code)` — atomic uses++.

### Edge functions
- `chesshost-export` (GET, TRF + JSON).
- `chesshost-import-results` (POST, arbiter only).
- `db-cup-register` (POST, public; creates registration, sends confirmation, awards invite bonus).
- Extend `tournament-reminder-2h` with 24h variant.

### Frontend
- `src/pages/DraganBrakusCup.tsx` — registrant counter, share/invite block, prize ladder grid, early-bird badge.
- `src/pages/InviteRedirect.tsx` at `/i/:code`.
- `src/components/db-cup/InviteShareCard.tsx` (QR + socials).
- `src/components/db-cup/PrizeLadder.tsx`.
- Admin pairing bridge panel (arbiter role only).

### Email
- New template `db-cup-registration-confirmed.tsx` with .ics attachment-link.
- New template `db-cup-24h-reminder.tsx`.

## Out of scope (will not do this round)
- Real-time chesshost.app API streaming (no public API exists).
- Cash payouts (project policy).
- Redesigning the homepage.
