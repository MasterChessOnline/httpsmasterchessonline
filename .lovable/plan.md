# Plan: Završetak Growth Wave 3

Implementiram preostale stavke iz growth plana u jednoj rundi.

## Šta se gradi

### 1. Share Card PNG (post-game)
- `src/lib/shareCard.ts` — canvas generator (1200×630), brand Gold & Black, prikazuje rezultat, ELO delta, ime
- Dugme "Podeli kao sliku" u `GameReview.tsx` → download PNG + Web Share API ako postoji

### 2. Spectate Hero (homepage boost)
- `src/components/home/SpectateHero.tsx` — live mini-board najgledanije partije (čita `online_games` gde je `spectator_count > 0`)
- Ubacuje se u `Index.tsx` ispod hero-a, samo kad postoji live partija (nema fake fallback)

### 3. Referral wiring
- Aktivirati postojeću `referrals` tabelu: capture `?ref=USERNAME` u `App.tsx` → localStorage → na signup confirm upisuje red
- Dodati "Tvoj referral link" blok u `Profile.tsx` sa copy dugmetom i brojem dovedenih

### 4. Streak cron (daily)
- Edge function `daily-streak-tick` koja u 00:05 UTC resetuje `user_daily_streaks` ako nije bilo aktivnosti
- pg_cron job (via insert tool, ne migration — sadrži anon key)

### 5. Programmatic opening pages (long-tail SEO)
- `src/pages/OpeningSEO.tsx` na ruti `/opening/:slug`
- Statički seed: 20 najpopularnijih otvaranja (Sicilian, Italian, Ruy Lopez, French, Caro-Kann, …)
- Per-stranica: H1, meta, PGN viewer, "Train this opening" CTA → `/openings?train=:slug`
- Sitemap update u `public/sitemap.xml`

### 6. Weekly Recap (in-app, ne email)
- `src/components/WeeklyRecapModal.tsx` — pokazuje se nedeljom: games played, win%, best move, najbolji protivnik
- Trigger iz `App.tsx` jednom nedeljno (localStorage `last_recap_week`)

### 7. Soul Replay (lightweight, ne MP4)
- `src/components/game/SoulReplay.tsx` u GameReview — auto-play ključnih poteza sa Caveat captionima ("ovde sam se uplašio…", "ovo je bio plan")
- Bez video render-a, čisto DOM animacija → može da se snimi screen-om

### 8. Cleanup & polish
- Dodati `OpeningSEO` rutu u `App.tsx`
- Dodati Spectate Hero i Weekly Recap mount
- Footer link na `/opening/sicilian-defense` (jedan primer za SEO crawl)

## Tehnički detalji

- **Migracije**: nema novih tabela; `referrals` i `user_daily_streaks` već postoje
- **Edge function**: 1 nova (`daily-streak-tick`)
- **pg_cron**: 1 schedule, kroz `supabase--insert` (ne migration)
- **Brand policy**: nigde nema konkurenata; sve SEO copy je original
- **Integrity**: Spectate Hero NE renderuje fake partije — sakriva se ako nema live

## Šta NIJE u planu (već urađeno ili odbijeno)
- Monetizacija (samo donacije, potvrđeno)
- Email recap (zamenjeno in-app modalom — brže, bez infra)
- MP4 export (zamenjeno DOM replay-em)

Reci "ok" pa krećem.