# MasterChess "Explode" Launch Plan

Četiri faze. Svaka faza se može pustiti zasebno, ali ovaj plan obuhvata sve odjednom. Tehnički delovi su izdvojeni na dnu.

## Faza 1 — Viralni share & SEO boost

Cilj: svaka stranica deljiva, svaki link generiše preview, Google indeksira sve.

- **Dinamičke OG share kartice** za:
  - Profil igrača (`/player/:username`) — avatar, ELO, rank badge, win streak.
  - Otvaranje (`/openings/:slug`) — naziv, ECO kod, mini board sa ključnom pozicijom.
  - Daily Mate (`/daily-mate`) — datum, "Mate in N", mini board.
  - Završena partija (`/game/:id`) — rezultat, oba igrača, krunski potez.
- **JSON-LD rich snippets** po tipu stranice: `WebSite` + `SearchAction` sitewide, `VideoObject` na Stream Hub-u, `Person` na profilima, `BreadcrumbList` na svim podstranicama.
- **Helmet po ruti** (`react-helmet-async`) — jedinstven `<title>`, `<meta description>`, `<link canonical>`, `og:*`, `twitter:card=summary_large_image` za top 15 ruta.
- **Sitemap proširenje**: dinamički sitemap-i za profile, otvaranja, mate arhivu — automatska generacija pre build-a.
- **3 nove landing SEO stranice** ciljane na high-volume upite:
  - `/learn/chess-openings-for-beginners`
  - `/play/free-online-chess`
  - `/tools/elo-calculator`
- **"Share this game" dugme** posle svake partije — kopira link sa OG karticom + jedan klik na X/Reddit/WhatsApp.

## Faza 2 — Marketing landing reklama

Cilj: nov posetilac za 5 sekundi shvata zašto MasterChess.

- **Novi hero na `/`**: full-bleed video pozadina (latest DailyChess_12 highlight, muted autoplay), gradient overlay, krupna headline, dva CTA-a (Play Now / Watch Live).
- **Live social proof traka** ispod hero-a: `X igara u toku` · `Y igrača online` · `Z partija danas` (čita stvarne brojeve iz Supabase — bez fake-ova, u skladu sa Integrity rule).
- **"Why MasterChess" sekcija** sa 4 animirana stuba: No Ads, Pure Human Play, Streamer-First, Free Forever — ScrollReveal sa Framer Motion.
- **Testimonials karusel** iz pravog `site_ratings` table-a (5★ samo, sa username + komentar) — koristi već postojeću rating funkcionalnost.
- **Comparison strip**: MasterChess vs Chess.com vs Lichess — 5 tačaka, čista tabela, gold accent.
- **Sticky bottom CTA bar** za nove posetioce (skida se posle login-a).

## Faza 3 — Retencija & gamifikacija

Cilj: korisnik se vraća svaki dan.

- **Daily Login Streak**: kalendar sa 7/30/100 dana milestone-ima, XP boost svaki dan, vatreni badge u headeru.
- **Referral sistem**: jedinstven `?ref=username` link → kad prijatelj odigra prvu partiju, oba dobijaju 500 XP + ekskluzivni "Recruiter" badge. Stranica `/invite` sa share dugmićima i live brojem pozvanih.
- **Weekly Leaderboard sa nagradama**: top 10 nedeljno dobija privremene badge-ove (Gold/Silver/Bronze Crown) koji se prikazuju pored imena 7 dana. Reset svake nedelje, edge function cron.
- **Push & email notifikacije**:
  - "Turnir kreće za 10 minuta" (samo opt-in).
  - "Tvoj rival te je prešao u ratingu".
  - "Daily Mate je novi — reši ga za XP".
- **Achievement showcase** u profilu: vitrina za top 6 badge-ova koje korisnik bira.

## Faza 4 — Press kit + streamer alati

Cilj: kreatori i mediji pišu o vama bez da pitate.

- **`/press` stranica**: brand story (2 paragrafa), screenshot galerija, logo paket (PNG/SVG, light/dark), color tokens, font preuzimanja, factsheet (osnivač, datum launch-a, broj korisnika), press kontakt.
- **`/streamers` stranica**: alati za kreatore.
  - **Embed widget** (`/embed/rating/:username`) — transparentna stranica sa real-time rating + last game, copy-paste URL za OBS Browser Source.
  - **Stream overlay generator** — bira boju, layout, prikazuje preview, daje OBS URL.
  - **"Challenge the Streamer"** dugme aktivno kada je DailyChess_12 live (već imamo YouTube API integraciju) — gledaoci se ubacuju u red za partiju.
- **ProductHunt/Reddit launch paket** kao `/mnt/documents/launch-kit.zip`: 4 product shots (koristim product-shot skill sa različitim gradijentima), gotov copy za PH tagline + first comment, 3 varijante Reddit posta po sabredditu (r/chess, r/SideProject, r/InternetIsBeautiful).

---

## Tehnički delovi

**Nove tabele (Supabase):**

```text
referrals        — referrer_user_id, invited_user_id, status, reward_granted
login_streaks    — user_id, current_streak, longest_streak, last_login_date
weekly_rankings  — user_id, week_start, rank, points, badge_type
notification_prefs — user_id, push_enabled, email_enabled, turnir/rival/daily flags
```

Sve sa RLS (vlastiti redovi za pisanje; javno čitanje samo za `weekly_rankings`).

**Nove Edge funkcije:**

- `og-image` — generiše PNG OG kartice on-demand (Satori + Resvg), 30-dnevni edge cache po slug-u.
- `weekly-leaderboard-cron` — pondeljak 00:00 UTC, dodeljuje top 10 badge-ove i resetuje brojač.
- `send-notification` — slanje push + email (Resend) prema `notification_prefs`.
- `referral-grant` — trigger na završetku prve partije pozvanog korisnika.

**Nove rute (frontend):**

- `/invite`, `/press`, `/streamers`, `/embed/rating/:username`
- 3 SEO landinga (Phase 1)

**Postojeći fajlovi koji se diraju:**

- `src/main.tsx` — wrap u `<HelmetProvider>`.
- `src/pages/Index.tsx` — novi hero + social proof + testimonials + comparison + sticky CTA.
- `src/components/Header.tsx` — streak badge, notifikacioni zvonček.
- `src/pages/Profile.tsx` — achievement showcase, referral link.
- `scripts/generate-sitemap.ts` — dodavanje dinamičkih kolekcija.
- `index.html` — sitewide JSON-LD `WebSite` + `SearchAction`.

**Redosled isporuke** (preporučujem ovim redosledom da svaki branch može sam da se push-uje):

```text
1. Faza 1 (SEO temelj — bez nje viralni share ne radi)
2. Faza 2 (Marketing landing — konverzija novih)
3. Faza 4 (Press kit — pripremamo launch dan)
4. Faza 3 (Retencija — drži korisnike koji su došli iz Faze 2)
5. LAUNCH DAY: ProductHunt + Reddit + DailyChess_12 video
```

**Procena obima**: ~25 novih fajlova, ~12 izmena postojećih, 4 edge funkcije, 1 migracija sa 4 tabele. Svi delovi poštuju Core pravila iz memorije: nema fake brojeva, nema AI u human-vs-human, sve respektuje "Gold & Black 4D" identitet, max 2-4 opcije po redu, Merida default piece set.

Reci "implement" pa krećem faza po faza, ili reci tačno koju fazu prvo želiš.