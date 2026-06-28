## Cilj ovog build-a

DB Chess Cup pretvoriti u event koji izgleda **realno** (prave nagrade, prave notifikacije, pravi share), i sajtu dati **20 brutalnih dodataka** za rast i retention.

---

## 1. Prave nagrade (Real Prizes) — ne samo Master Coins

Trenutno `tournament_prizes` ima samo "Master Coins". Dodajem realne stvari koje stvarno mogu da se dostave:

- **1. mesto** — Cosmo gold cash equivalent (50€ PayPal/Revolut) + 5000 MC + zlatni "DB Cup Champion 2026" trofej-badge na profilu (animiran) + Captain title doživotno + 1h 1-on-1 lesson sa Nikolom (video poziv) + featured profile na homepage 7 dana.
- **2. mesto** — 25€ + 3000 MC + srebrni badge + 30min lesson + featured 3 dana.
- **3. mesto** — 15€ + 2000 MC + bronzani badge + featured 1 dan.
- **4–10.** — 1000 MC + "Top 10 DB Cup" badge.
- **Best U18 / Best Female / Best Unrated / Biggest upset (najveći rejting jaz pobeda)** — po 500 MC + custom badge.
- **Lucky draw** za sve koji odigraju svih 9 kola — 1 nasumičan dobija 20€.
- Sve prize tier-ovi vidljivi na `/dragan-brakus` u novoj "Prizes" sekciji sa ikonama + Schema.org `Offer` JSON-LD.

Tehnički: izmena `tournament_prizes` seed-a + nova kolona `payout_method` (`cash` / `coins` / `badge` / `experience`) + admin handoff list u `tournament-export`.

---

## 2. Notifikacije svakom igraču — automatski

Trenutno postoji `push_subscriptions` i `push-send`, ali nije ulinkovan na tournament events. Pravim potpuni notifikacijski pipeline:

- **Pri registraciji** — email "You're in! DB Cup starts in X days" + dodavanje u `email_send_queue`.
- **24h pre** — push + email "DB Cup tomorrow at 17:00 CEST — check in opens at 16:30".
- **30 min pre** — push "Check in NOW or lose your spot" + in-app modal sa countdown.
- **1 min pre svake runde** — push "Round X pairings live — your board is #Y vs Z".
- **Posle svake partije** — push sa rezultatom + delta rejtinga + share dugmetom.
- **Posle turnira** — email "Final standings + your prize claim link".

Tehnički:
- Nova edge funkcija `tournament-notify` koja se zove iz `manage-tournament` na key event-ima.
- Postojeći `push-send` + `process-email-queue` se ulinkuju.
- Cron `tournament-reminder-2h` se proširuje na `T-24h`, `T-30min`, `per-round`.
- In-app toast preko Supabase Realtime na `tournament_registrations` kanalu.

---

## 3. Boje — provera i pojačanje

Trenutno svaka top-level ruta ima `data-zone`, ali user kaže da sajt deluje crno. Provera i pojačanje:

- Audit `src/index.css` `data-site-theme="live"` blok — proveriti da li 5-bojni radial blobs imaju dovoljno alpha (trenutno verovatno <8%, gore na 14–18%).
- Po-rutni accent: trenutno samo tanka linija ispod navbar; **dodajem obojen halo iza Hero header-a po zoni** + obojeni top-border na svakoj Card komponenti po zoni.
- **Footer**: 5 vertikalnih kolona, svaka sa zonalnom bojom na vrhu (vizuelni potpis "5 boja").
- **Buttons**: secondary varianta dobija subtle obojen ring po zoni.
- **Badge-ovi i Tabs**: koriste zonalnu boju automatski.
- Headless test preko Playwright screenshot-a /, /play, /learn, /tournaments, /community, /news — verifikacija da svaka stranica ima drugačiju dominantnu boju.

---

## 4. Share na Viber / Instagram / WhatsApp / X

Postojeći `InviteShareCard` ima WhatsApp/Telegram/X/FB. Dodajem:

- **Viber** — `viber://forward?text=...` (radi i na desktop i mobile sa Viber instaliranim).
- **Instagram Story PNG generator** — Canvas API u browseru pravi 1080×1920 PNG sa user-ovim imenom, kodom, QR-om, datumom turnira, brendiranim background-om. Dugme "Download for IG Story" → snima fajl, user-u kaže "Open Instagram → Story → Upload from gallery".
- **Instagram bio link** — `/i/CODE?utm_source=ig` (već postoji `affiliate_clicks`), dodajem dugme "Copy IG Bio Link" koje radi clipboard + toast "Paste this in your Instagram bio".
- **Web Share API** — native `navigator.share()` na mobile (jedno dugme "Share" otvara OS share sheet sa svim app-ovima uključujući Viber).
- **Discord webhook** — već postoji `discord-webhook-publish`, dodajem hook "Player X just registered — current count: Y/500" da puca u DB Cup kanal.

---

## 5. Google Search Console — submit svega

Koristim postojeći GSC connector (curl gateway) da:

- Submit-ujem `https://masterchess.live/dragan-brakus`, `/dragan-brakus/live`, `/ig/db-cup`, `/i/*` šablon, `/tournaments`, `/news`, `/nikola` preko URL Inspection API.
- Verifikujem da je `Event` JSON-LD validan (URL Inspection vraća rich-result status).
- Submit-ujem sve sitemap-e (`sitemap_index.xml`, `sitemap-news.xml`, `sitemap-landings.xml`, novi `sitemap-tournaments.xml`).
- Pravim novi `sitemap-tournaments.xml` sa svim aktivnim + završenim turnirima.
- IndexNow ping na 15 ključnih URL-ova.
- Dokumentujem rezultate u `docs/GSC_SUBMIT_LOG.md`.

---

## 6. 20 Brutalnih Ideja za sajt i turnir

**Turnir (DB Cup specifično):**
1. **Live "Who just registered" ticker** na `/dragan-brakus` — Supabase Realtime, poslednjih 8 avatara klizi sleva nadesno.
2. **Predict the winner** — pre turnira svi glasaju za top 3, tačan pogodak = 500 MC.
3. **Sweepstakes-style countdown** — "Registracija se zatvara za 02:14:33" tikta na svakoj stranici (top ribbon).
4. **Captain leaderboard** — javna tabela "ko je doveo najviše igrača"; top 3 captain-a dobijaju nagrade.
5. **Live boards "Wall"** tokom turnira — već postoji `/tournaments/wall`, ulinkovati prominento na DB Cup landing.
6. **Spectator betting** (već postoji `spectator_bets`) — ulinkovati na svaku DB Cup partiju, ulog u MC.
7. **Auto-stream na YouTube** — top board svakog kola se prikazuje u embed na `/live`.
8. **Post-game share card** — posle svake partije, auto-generisan PNG "Ja sam dobio X u DB Cup-u" sa pozicijom.
9. **Quick rematch invite** — posle partije, "Pošalji link prijatelju da igra istu poziciju".
10. **DB Cup playlist** — Spotify embed sa "Music to play blitz to" na live stranici.

**Rast / Retention (sajt globalno):**
11. **Daily challenge from Nikola** — Nikolin glas + jedna pozicija dnevno, "reši za XP".
12. **Streak insurance** — 1 freeze dan nedeljno besplatno; 2. košta 100 MC.
13. **Friend referral with chain bonus** — A pozove B pozove C → A dobija 25% od C-ove MC zarade prvih 30 dana.
14. **Profile share OG image** — auto `/u/:username/og.png` sa rejtingom, badge-ovima, vinratom — za IG/X share.
15. **"Beat Nikola" weekly** — Nikola igra 1 partiju nedeljno protiv random pretplatnika; pobeda = Captain badge + 5000 MC.
16. **Achievement unlock toast** + native push istovremeno — dvostruka satisfakcija.
17. **Cross-promo widget** — mali "DB Cup ⏱ 02:14:33" sticky badge na svim stranicama dok je turnir aktivan.
18. **Anti-ghost-town**: prikaz "X igrača trenutno online" u realnom vremenu na home heru.
19. **One-tap "Continue from where you left off"** modal pri svakom povratku na sajt.
20. **Onboarding čarobnjak** — 60s wizard pri prvom login-u: cilj (učenje/play/turnir), nivo, IG/Discord opt-in, prvi free turnir entry.

---

## Tehnički sažetak (fajlovi koji se diraju)

- `src/pages/DraganBrakus.tsx` — nove Prizes, Ticker, Countdown, Predictions sekcije.
- `src/pages/IgDbCup.tsx` — već postoji, dodaje IG Story PNG generator dugme.
- `src/components/db-cup/InviteShareCard.tsx` — Viber, Web Share API, IG Story PNG.
- `src/lib/og-board-image.ts` — extend za 1080×1920 invite card + post-game share card.
- `src/index.css` — pojačan polychrome u `data-site-theme="live"`, footer pillar boje.
- `src/components/Footer.tsx` — 5 obojenih kolona.
- `supabase/functions/tournament-notify/index.ts` — NOVA, orchestrira push+email po event-u.
- `supabase/functions/manage-tournament/index.ts` — poziva `tournament-notify` na join/checkin/round_start/finish.
- `supabase/functions/tournament-reminder-2h/index.ts` — proširuje se na T-24h i T-30min i per-round.
- Migracija: `tournament_prizes` dodaje `payout_method`, seed real prizes za DB Cup.
- Migracija: `tournament_predictions` nova tabela za predict-the-winner.
- `public/sitemap-tournaments.xml` + `scripts/generate-sitemap.ts` update.
- `docs/GSC_SUBMIT_LOG.md` — log šta je submit-ovano.
- GSC: curl pozivi za URL Inspection + sitemap submit (čisto runtime, bez koda u repo).

---

## Pitanje pre nego što krenem

Cash nagrade (50€ / 25€ / 15€) — da li hoćeš da pišem da postoje **kao zvanične nagrade na landingu**, ili **da napišem "MasterChess loot + experience" bez €-iznosa** (sigurnije za marketing dok ne potvrdiš da možeš da isplatiš PayPalom/Revolutom)?

- **(A) Cash nagrade napisane otvoreno** — agresivnije za marketing, povlači više igrača, ali ti se obavezuješ na isplatu.
- **(B) "Coins + experience + lesson sa Nikolom + featured profile"** — bez cash-a, bezbednije, manje agresivno.
- **(C) Hibrid** — landing kaže "MasterChess prizes + surprise grand prize" (cash je tajni bonus koji objaviš tokom turnira) — kreira hype bez fiksne obaveze.
