
# MasterChess Full Ecosystem — Phased Plan

Big scope. Built in 4 phases so each ships working, not half-broken. After every phase you can play/test before moving to the next.

---

## Phase 1 — Turnir jezgro (gameplay + leaderboard)

Goal: every tournament format works end-to-end with real-time leaderboard.

- **Formati**: dopuniti `tournaments` šemu sa `format` enum (`swiss`, `knockout`, `ladder`, `king_of_the_hill`, `puzzle_rush`).
  - Swiss već radi (`manage-tournament` edge fn).
  - Dodati Knockout bracket generator u istoj edge funkciji (single-elim, bye za neparan broj).
  - King of the Hill: novi `koth_throne` tabela (current_king_id, defended_count). Izazov dugme u lobby.
  - Puzzle Tournament: koristi `daily_puzzles` izvor, svi rešavaju iste pozicije N min, skor = tačnost × brzina.
- **Time control presets** već postoje — dodaj UI filter na `/tournaments` po bullet/blitz/rapid.
- **Tournament flow polish**:
  - Waiting lobby countdown (već postoji `use-tournament-reminder`) — dodaj live "X players joined" pulse.
  - Auto-pairing trigger 30s pre start ako ima ≥2 igrača.
  - Disconnect = loss: `online-game-watchdog` edge fn već detektuje, dodaj forfeit u pairing.
- **Leaderboard bonusi** (novo u `tournament_registrations`):
  - `fast_win_bonus` (mat < 10 poteza → +1).
  - `no_mistake_bonus` (post-game stockfish review, blunder count = 0 → +1).
  - Računa se u `recalc_tournament_tiebreaks` RPC.

---

## Phase 2 — Nagrade + Status sistem

Goal: pobeda nešto znači — badge, skin, naslov.

- **Nove tabele**:
  - `tournament_titles` (user_id, title_key, season, awarded_at) — "Weekly Champion", "Season King", "Unbeaten Player", "Tactical Genius", "Checkmate Killer".
  - Skinovi/board teme već imamo (`user_inventory` + Shop). Dodaj nove SKU:
    - Piece sets: Neon, Fire & Ice, Cyberpunk, Gold Royal (4 nova SVG seta u `public/pieces/`).
    - Board themes: Space, Dark Void, Ancient Stone, Neon Arena (CSS u `board-themes.ts`).
  - Effects (CSS/Framer): checkmate explosion, electric trail, freeze. Toggleable u Settings.
- **Distribucija**:
  - End-of-tournament edge fn dodeljuje title + odgovarajući kozmetik 1./2./3. mestu.
  - Cron `weekly-champion-cron` nedeljno (ponedeljak 00:00 UTC) — top XP gainer prošle nedelje.
- **Rare flex**:
  - "1 of 1 Champion badge" — `unique_badges` tabela, samo jedan owner aktivan.
  - Animated golden username — flag `profiles.username_style ∈ ('default','gold_animated','legendary_frame')`.
  - Hall of Fame: `/hall-of-fame` stranica, top finali ever, replay-link.
- **Skill rewards** (retention):
  - 7-day AI Coach Pro pass — `profiles.coach_pro_until timestamptz`.
  - "See best move after game" — već postoji u Game Review, gate iza pass-a.
  - Opening trainer unlock — dodaj `unlocked_courses` jsonb.
- **Access tier** (`profiles.access_tier ∈ ('standard','beta','vip')`):
  - Beta test sekcija `/beta` skrivena iza tier ≥ beta.
  - "Vote on next feature" — nova `feature_votes` tabela.

---

## Phase 3 — Viral + SEO + Landing

Goal: novi useri dolaze sami.

- **Auto highlight sistem**:
  - Posle svake online partije, edge fn `generate-highlight` označi best move / blunder / mate moment (već imamo `move-classifier`).
  - Frontend: posle game-over, modal "Share this moment" → renderuje 1080×1920 PNG/MP4 (canvas → mp4 via `videogen` ili statički PNG za TikTok).
  - `/share/:gameId/:ply` javna stranica sa OG board image.
- **Landing pages (SEO)**:
  - `/play` — "Play chess online free multiplayer" (H1, CTA, live player count).
  - `/tournaments` — već postoji; dodaj SEO copy "Join online chess tournaments every week".
  - `/puzzles` — "Daily chess puzzles & leaderboard" copy refresh.
  - `/ranked` (nova) — "Competitive chess ranking system" + live ELO ladder snippet.
  - Sve preko `<Helmet>` (već koristimo).
- **Blog (`/blog` već postoji)**: dodaj 3 evergreen SEO članka:
  - "How to improve at chess fast"
  - "Best chess openings for beginners"
  - "What is ELO system explained"
- **Hype hooks** (UI copy varijante u lobby):
  - "Only 1 survives" (Knockout), "0 mistakes challenge" (Puzzle), "Beat the champion or lose forever" (KOTH).
- **Sitemap**: dopuni `scripts/generate-sitemap.ts` sa novim ruteama + dynamic tournament/blog stranicama. Već imamo sitemap_index — dodaj `sitemap-tournaments.xml`.
- **Google Search Console** (uputstva u finalnoj poruci, ne kod):
  - Submit `sitemap_index.xml`, prati impressions/CTR za ciljne ključne reči.

---

## Phase 4 — Discord bot + Google Maps (uputstva + scaffolding)

Goal: zajednica i lokalni SEO. Mostly dokumentovano + minimalni kod.

- **Discord integracija** (zahteva tvoj Discord nalog):
  - Edge fn `discord-webhook-publish` — kad turnir krene/završi, post u Discord channel via webhook URL (ti ga paste-uješ kao secret `DISCORD_WEBHOOK_URL`).
  - Bot komande (`!join`, `!stats`, `!rank`, `!challenge`) — poseban Node bot proces (ne deploya se u sandbox). Plan uključuje:
    - README sekcija sa setup koracima (DISCORD_BOT_TOKEN, OAuth invite link, host opcije).
    - REST endpoints na sajtu koje bot poziva: `GET /api/public/stats/:username`, `GET /api/public/rank/:username` (preko edge fn-a).
- **Google Business Profile** (manuelno, korak po korak u poruci):
  - Naziv: "MasterChess Online Club", kategorija Game/Entertainment.
  - Verifikacija (poštanska kartica ili telefon).
  - Opis + link + screenshots.
- **Lokalni SEO stranice** (auto-generišu se):
  - `/play-chess-from/:city` šablon — već imamo `PlayFromCity.tsx` i `seo-cities.ts`. Dodaj nove gradove i targetiraj "Chess tournaments Serbia", "Online chess club Balkan", "Free chess games Europe" kao H1 varijante.

---

## Technical Details

- **DB migracije**: 6 novih tabela (`koth_throne`, `tournament_titles`, `unique_badges`, `feature_votes`, `puzzle_tournament_attempts`, `tournament_highlights`). Svaka sa GRANT + RLS.
- **Edge funkcije**: izmena `manage-tournament` (knockout, koth, puzzle handlers), nova `generate-highlight`, `discord-webhook-publish`, `award-tournament-titles`, cron `weekly-champion-cron`.
- **Frontend nove rute**: `/ranked`, `/hall-of-fame`, `/beta`, `/share/:gameId/:ply`. Update `/tournaments`, `/play`, `/puzzles` copy.
- **Cron**: 3 nova `pg_cron` job-a (weekly champion, koth cleanup, highlight prune).
- **Sitemap**: novi shard `sitemap-tournaments.xml` + update index.
- **Stockfish**: ostavi tekući depth-18 repair pipeline da završi posao (background) — paralelno sa ovim radom.

---

## Što NEĆE biti u planu

- Stvarni novac/payments za turnire (user je rekao "bez para").
- Migracija na drugi framework.
- Mobile native app izmene (Capacitor već postoji, ne diramo).
- Auto-objavljivanje na TikTok (samo generišemo share-ready klipove; user objavljuje).

---

Reci "Implement plan" da krenem sa **Phase 1**. Posle svake faze ću stati i potvrditi pre nego što krenem na sledeću.
