## Cilj
1) Pomeriti Dragan Brakus Cup na **23. jul 2026, 16:00 CET**
2) Napraviti **retention + acquisition sistem** (da ljudi dolaze i OSTAJU)
3) **Google Maps + Search Console + Business Profile** — sve što se može automatizovati

---

## Deo A — Pomeranje Dragan Brakus Cup (23. jul 16:00 CET)

Update svih mesta gde je datum hardkodovan ili u bazi:
- `docs/DRAGAN_BRAKUS_GBP_EVENT.md` — datumi + copy
- Landing page `/dragan-brakus` (SEO meta, JSON-LD `Event` startDate/endDate)
- Countdown komponenta (ako čita iz konstante, ne iz baze)
- Tabela `tournaments` — UPDATE reda za DB Cup #1 (start_time, registration_deadline)
- `public/sitemap-tournaments.xml` lastmod
- GBP post copy u `docs/GBP_WEEKLY_POSTS_CALENDAR.md`

---

## Deo B — Retention Engine (da ljudi OSTANU na sajtu)

Većina odlazi za <30s. Napadamo tri momenta:

### B1. Prvih 10 sekundi — "Instant Value"
- **Live Activity Bar** na Home: "47 partija u toku · 3 turnira · Sledeći start za 14min" (real data iz `online_games` + `tournaments`)
- **One-click Play** (bez logina) — već postoji `/play-guest`, iznesi ga kao primarni CTA
- **Auto-redirect novih posetilaca** sa `?ref=*` na `/vs/{code}` demo partiju umesto Home

### B2. Prvih 5 minuta — "Hook Loop"
- **Post-game moment**: posle SVAKE partije → auto share card (`challenge_cards` tabela već postoji) + "Reci osveti" dugme
- **Micro-quests**: 3 lagana zadatka pri prvoj poseti ("odigraj 1 potez", "reši 1 puzzle", "pogledaj live") — svaki daje coin animaciju
- **Streamer live indikator** ako `DailyChess_12` uživo → banner "🔴 UŽIVO"

### B3. Prvih 7 dana — "Return Triggers"
- **Web Push** već ima infrastrukturu → aktivirati 3 default triggera:
  - "Tvoj rival je online" (koristi `rivalries` tabelu)
  - "Turnir za 2h — 47 registrovano"
  - "Novi dnevni zadatak"
- **Email digest** (nedeljno) preko postojećeg `process-email-queue`: rating delta, best game, next event
- **Streak recovery**: ako streak padne → "Vrati streak jednom partijom" email/push

### B4. Session extension
- **"Next up" widget** na kraju svake partije (kao YouTube autoplay): Puzzle → Bot → Live game
- **Chess DNA teaser** posle 5 partija: "Otključaj svoj Chess DNA" (koristi već napravljeni `/dna/:userId`)
- **Live TV embed** na Home (koristi `/live` podatke)

---

## Deo C — Acquisition (dovođenje NOVIH)

### C1. Programmatic SEO — dodatne rute
- `/vs-bot/{botId}/{eloTier}` — 9 botova × 6 tier = 54 nove stranice
- `/chess-in-{country}` — top 30 zemalja
- `/how-to-beat/{opening}` — top 20 otvaranja
- Sve auto-generisano preko postojećeg `seo-content-generator` edge function

### C2. Viral loops
- **Auto-Tweet card** posle "brilliant" poteza → automatski generiše sliku + tekst preko `og-match-story`
- **Embed widget** (već postoji `/embed`) → dodati "Get code" dugme na Home footer
- **Referral 2×**: obojica dobijaju 500 coins + Phoenix badge (proširiti `referrals` tabelu)

### C3. Distribucija (dokumenti + skripte)
- `docs/REDDIT_LAUNCH_23JUL.md` — 8 subredita, gotovi postovi za Cup dan
- `docs/PRODUCT_HUNT_LAUNCH.md` — checklist + copy + tajming
- `docs/DIRECTORY_SUBMISSIONS.md` — 50 kataloga (BetaList, IndieHackers, StartupBase, itd.)

---

## Deo D — Google ekosistem (Maps + Search Console + Business)

### D1. Google Search Console — automatizovano
Konektor je već povezan. Dodati edge function `gsc-daily-report`:
- Svaki dan pulls top 20 upita → čuva u `seo_query_opportunities`
- Auto-submit sitemap-a
- Auto URL inspection za nove `/news/*` postove
- IndexNow ping (već postoji) za sve nove SEO stranice

### D2. Google Business Profile — publish automation
- Edge function `gbp-auto-publish` (proširiti postojeći `publish-gbp-posts`)
- Cron: nedeljno objavi post iz `gbp_posts` tabele
- **Event post za Cup 23. jul** — pripremljen copy pack
- Q&A seed (5 pitanja) — dokument sa gotovim odgovorima

### D3. Google Maps
- Već postoji connector setup dokumentacija
- Dodati `/chess-clubs-near-me` — Maps embed + Places API nearby search preko konektora
- City landing pages (`/chess/:city`) — dodati Maps embed (ako korisnik ima billing)

### D4. Ostalo (Bing, Yandex, Apple)
- Bing Webmaster: import iz GSC (jedan klik dokument)
- Yandex Webmaster: meta tag setup
- Apple Business Connect: dokument
- Wikidata entry za Nikola Šakotić (draft dokument)

---

## Redosled izvršavanja

1. **Sprint A (odmah)**: pomeri Cup na 23. jul + update landing/JSON-LD/sitemap/baza
2. **Sprint B1+B2**: Live Activity Bar, Post-game share, Micro-quests, Next-up widget
3. **Sprint B3**: aktiviranje 3 push trigera + weekly email digest
4. **Sprint C1**: programmatic SEO rute (54 + 30 + 20 novih stranica)
5. **Sprint D1+D2**: GSC daily report + GBP auto-publish + Event post za Cup
6. **Sprint C2+C3+D3+D4**: viral loops, distribucija docs, Maps embed, Bing/Yandex/Apple

## Tehnički detalji

**Nove tabele** (male): `retention_events` (track user drop-off points), `push_trigger_log` (dedupe)
**Nove edge funkcije**: `gsc-daily-report`, `gbp-auto-publish` (proširenje), `retention-tracker`
**Frontend**: `LiveActivityBar.tsx`, `PostGameShareModal.tsx`, `NextUpWidget.tsx`, `MicroQuests.tsx`, `StreakRecoveryBanner.tsx`
**Cron**: nedeljni GBP post, dnevni GSC pull, dnevni push reminder (postoji)

**Šta se NE dira**: Home dizajn (user veto), matchmaking (bez bot-fill pravila), competitor brand policy.

---

## Pitanje pre kretanja
Radim SVE ovo redom (može trajati više sprintova), ili prvo **Sprint A + B1+B2** (Cup pomeranje + retention core) da vidiš efekat pa ideš dalje? Predlažem drugo — brže vidiš rezultat.
