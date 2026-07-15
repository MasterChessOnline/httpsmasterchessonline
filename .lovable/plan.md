## Plan: bigger polished logo + full marketing / ads playbook

### Part A — Logo polish (make it bigger + premium)

The current navbar logo is 44–48 px inside a plain border. Fix:

1. **Navbar logo (`src/components/Navbar.tsx`)**
   - Grow to **56 px mobile / 64 px desktop** (was 44/48).
   - Wrap in a "gold ring" plate: outer amber gradient border, inner black bevel, soft outer glow — matches the crown-square logo aesthetic.
   - Add subtle idle animation: slow gold shimmer sweep every ~6 s + hover tilt (already there, keep).
   - Increase the "MasterChess" wordmark size from `text-lg/2xl` to `text-xl/3xl` so the logo + wordmark feel balanced.
   - Same treatment on mobile bar (currently a separate size class).

2. **Footer** — swap Crown lucide → `<img src="/app-icon-192.png">` at 40 px with the same gold ring.

3. **Auth pages** (`Login`, `Signup`, `AuthCallback` headers) — replace lucide crown with the new logo image, 72 px, centered.

4. **CinematicIntro splash** — replace the animated lucide `<Crown>` with the actual logo image (140 px, same gold-glow aura).

5. **Homepage hero badge** (`src/pages/Index.tsx`) — swap the 64 px crown-in-box for the real logo at 96 px with the gold-ring plate.

6. **Loading spinners / route loader** — small 32 px logo replaces the plain `Loader2` where the brand crown is expected.

7. Add a shared `<BrandLogo size="sm|md|lg|xl" />` component in `src/components/BrandLogo.tsx` so every future use points at one source (single place to restyle later).

### Part B — Growth & marketing (huge idea pack)

Split into 4 buckets. I'll write everything into `docs/GROWTH_TO_100_USERS.md` (already exists — extend it) and build the highest-ROI **in-app** hooks the ads will click into.

**1. Google Ads (paid search + display)**
- **Search campaigns** — target long-tail buyer intent, cheap CPC:
  `play chess online free`, `chess vs bots free`, `chess tournament 2026`,
  `free chess site no ads`, `chess for kids online`, `učenje šaha online` (SR),
  `šah online besplatno`, `chess Serbia tournament`, `blitz turnir online`.
- **Brand campaign** — bid on `masterchess`, `master chess live` (1¢ CPC, defends from competitors).
- **Performance Max** for the DB Chess Cup — auto-formats across YouTube + Discover + Gmail.
- **Landing page per ad group** — send `chess vs bots` traffic to `/beat/{botId}`, `tournament` traffic to `/dragan-brakus`, generic `play chess` to `/play-guest` (skip login → instant board).
- **Conversion tracking** — fire GA4 event on `signup_completed`, `game_started`, `tournament_registered`. Add gtag stub to `index.html` (user needs to paste GA4 ID + Ads conversion ID).
- **Budget**: start €5/day, scale winners.

**2. Meta / Instagram / TikTok Ads**
- **Reels-first creative**: 9:16 vertical, 15 s hook — "I built a chess site alone at 13" (uses Nikola's story = high CTR).
- **Retargeting pixel** on the site → warm audience for people who played a guest game but didn't sign up.
- **Lookalike audiences** from DB Cup registrants and top-rated players once you have 100+ conversions.
- **Ad variants** (auto-generate share-card style creatives):
  - "Beat this position or lose your rating" (interactive puzzle preview)
  - "You vs a Grandmaster bot — 3+2 blitz. Free."
  - "500 free coins for your first game."

**3. Google Business Profile + Local SEO (Belgrade / Serbia)**
- Verify GBP entry (docs already exist in `docs/GBP_*`).
- Weekly GBP post (auto-scheduled via existing `publish-gbp-posts` edge function) — tournament recap, top-player of week, new lesson.
- Add GBP category: "Chess club" + "Software company" + "E-sports team".
- Photos: upload the new logo as profile pic, tournament screenshots, board photos, Nikola portrait.
- Reviews playbook already in docs — trigger a signed-in-user modal after 3 wins: "Enjoying MasterChess? Leave a Google review" (deep link to GBP).
- **Local citations** — submit to Serbian directories (Šahovski Savez Srbije, sportski portali, gradski katalozi).
- **Google Maps pin** — physical/mailing address for verification (already documented).

**4. Organic + Content + Community explosion**
- **Reddit blitz** — one post per week to `/r/chess`, `/r/chessbeginners` (title format: "I built a free chess site — trying to hit 100 users, would love feedback"). Serbian: `/r/serbia`, `/r/beograd`.
- **YouTube collab** — DailyChess_12 dedicated stream "Play me on MasterChess" — viewers who join get a "Streamer's Guest" badge.
- **TikTok automation** — 3 short videos per week:
  1. Speedrun of a bot demolition
  2. "Top comment picks my next move" live game
  3. Blunder-of-the-week from Community feed
- **Referral loop** — inviter + invitee both get 250 coins + Founder Friend badge, `/r/{code}` link.
- **Post-game share card** — one-tap PNG (final board + rating gain + username + URL) to WhatsApp/IG/X.
- **DB Cup FOMO ticker** in nav — "🔴 DB Cup starts in 3d 4h · 42/500 registered".
- **First-100 badge** — permanent "Founder 100" badge on profile for the first 100 accounts, publicly visible on leaderboard.
- **Weekly leaderboard email** — cheap engagement loop; sent via existing email queue.
- **Discord auto-role by rating tier** — bragging rights → sharing.
- **PWA install prompt** — smart trigger after game 3 (already exists — surface it harder).
- **Long-tail SEO pages**:
  `/free-chess-online`, `/play-chess-with-friends`, `/chess-for-beginners`,
  `/šah-online-besplatno`, `/chess-serbia`, `/chess-tournaments-2026`,
  `/how-to-play-chess-online`. Each carries proper H1, FAQ JSON-LD, internal links.
- **Semrush check** — run `keyword_research` on the top 5 SR/EN terms before writing the pages so we target the ones with real volume + low KDI (Semrush is an SEO data service the platform integrates with).
- **Email capture** — "Get notified when DB Cup starts" popup for guests, plug into email queue.
- **Nikola's story angle** — 13-year-old solo founder = press hook. Pitch to: Blic, Politika, Kurir, RTS (SR); Chess.com news desk; TechCrunch "young founder" desk; local gaming sites.

**5. Referral / viral primitives (in-app builds this pass)**
Building these now unlocks all of the above (ads have nowhere to convert to without them). Ship in this order:

1. **`/r/{code}` referral link** — reads code from URL, stores in localStorage, applies on signup, triggers 250-coin grant via existing coin RPC. Needs a `referrals` table (already exists per project schema — reuse).
2. **DB Cup countdown ticker** — thin bar under navbar showing live seconds to 2026-07-18T14:00Z + registered/max count.
3. **"Founder 100" badge** — auto-award to first 100 confirmed accounts, show on profile + leaderboard.
4. **Post-game share PNG** — generate via canvas, use existing InviteShareCard as template, add "Share to WhatsApp/X" buttons.
5. **GA4 + Meta Pixel stubs** in `index.html` (behind env vars) so ads can start tracking on day one.

### Technical section

- `BrandLogo` React component: props `size`, `withRing`, `glow`; uses `/app-icon-192.png` (already the new crown logo).
- Ring styling: `bg-gradient-to-br from-amber-300/80 via-amber-500/60 to-amber-800/80`, inner `bg-black/80`, `shadow-[0_0_40px_-8px_rgba(212,175,55,0.6)]`.
- Referral: use existing `referrals` table (see supabase-tables), add trigger to grant coins on first inviteeconversion.
- GA4: `<script async src="https://www.googletagmanager.com/gtag/js?id=${env}">` gated on `VITE_GA4_ID` env var.
- Meta Pixel: gated on `VITE_META_PIXEL_ID` env var.

### Verification

- Playwright: load `/`, screenshot navbar — logo visibly 56/64 px with gold ring, wordmark balanced.
- Load `/signup?r=TESTCODE` — check localStorage has the code, complete signup → confirm coins granted on both accounts.
- Load `/dragan-brakus` — countdown ticks in real time, shows registered/max.

---

**Confirm before I build:**

(a) Ship **all of the "5 in-app builds"** now (logo polish + referral + countdown + Founder 100 + share PNG + analytics stubs), or subset?
(b) Do you have a **GA4 measurement ID** and **Meta Pixel ID** ready, or should I add the stubs and you'll paste the IDs later?
(c) Should I set up a **Semrush keyword research pass** for the Serbian + English long-tail landing pages so we target the terms with real search volume?
