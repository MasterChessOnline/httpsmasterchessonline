## Cilj
Završiti sve preostalo iz prethodnog plana + dodati Chrome ekstenziju, Yandex, i još kanala.

---

## Sprint 1 — Yandex + IndexNow + Bing (SVE search engine-e pokriti)

- **Yandex Webmaster**: dodati `<meta name="yandex-verification">` u `index.html` (placeholder token) + `docs/YANDEX_SETUP.md` sa koracima
- **Yandex Turbo Pages feed** (`/turbo.xml` — samo skelet, popunjava se news postovima)
- **Bing verification**: dokument `docs/BING_SETUP.md` (import iz GSC, IndexNow već postoji ključ)
- **IndexNow proširenje**: već ima `indexnow-ping` funkcija — dodati auto-ping svakog novog SEO fajla iz `seo_pages` tabele
- **Seznam** (CZ), **Naver** (KR), **Baidu** (CN — ali blocked territories caveat): kratki docs

---

## Sprint 2 — Chrome ekstenzija "MasterChess Quick Play"

Mala ekstenzija (V3) koja daje 3 stvari:
1. **Popup** — dnevni puzzle + "Play Now" dugme koje otvara `/play-guest`
2. **New Tab override** (opciono) — MasterChess kao početna stranica (mini board + live activity)
3. **Right-click context menu** — "Analyze this FEN on MasterChess" (selektuješ FEN string, otvara `/analysis?fen=...`)

Fajlovi u `/dev-server/extension/`:
- `manifest.json` (MV3, permissions: `activeTab`, `contextMenus`, `storage`)
- `popup.html` + `popup.js` (fetches daily puzzle from public API)
- `background.js` (context menu handler)
- `newtab.html` (opciono override)
- `icon-48.png`, `icon-128.png` (koristim postojeći `logo-crown.png`)

Pakuje se u `public/masterchess-extension.zip` (preko `nix run nixpkgs#zip`).

Landing stranica `/extension`:
- Instrukcije za instalaciju (Load unpacked)
- Download link (fetch+blob pattern jer preview blokira direct download)
- Screenshot ekstenzije
- CTA za Chrome Web Store submission

**Chrome Web Store submission** — dokument `docs/CHROME_STORE_SUBMISSION.md` sa: developer account setup ($5 one-time), asset requirements (440×280 tile, 1280×800 screenshots, opis), review vremena (2-7 dana).

---

## Sprint 3 — Jos linkova (backlink blitz — 100+ novih)

Prošli doc imao 50 direktorijuma. Sada dodajem još 50+ **niche + regionalnih**:

**Chess-specific (30):**
- Chess.com forums/community blog (može se linkovati)
- ChessStack Overflow
- ChessBase India news submit
- Chess24 forum
- New in Chess magazine tips
- FIDE trainers association
- Chess Federation web pages (Serbia, Croatia, BiH, SLO, MK, MNE) — direct email
- ChessClub.com Discord list
- ICC (Internet Chess Club) forums
- Awesome Chess GitHub lists (5+)
- Chess coding subreddits
- Lichess forum (ne kao spam, kao "check out my project")
- ChessTempo forum
- ChessBomb submit
- Chessgames.com submit

**Dev/Tech (25):**
- Awesome React, Awesome Vite, Awesome Supabase (GitHub lists)
- Vercel showcase (nije Lovable, ali showcase)
- Dev.to organizations tag
- CodePen (post board demo)
- Hashnode publication
- Read.cv profile
- Polywork
- Peerlist (with launch)
- Weekly newsletters submit (JavaScript Weekly, React Newsletter, Node Weekly)
- Product Advisor
- Uneed weekly launch
- MicroLaunch
- LaunchStack
- Fazier
- IndieHackers milestones (post each)
- WIP.chat (indie hacker community)
- Nomad List (as founder profile)
- Reflio, PostHog case studies

**Regional Serbian (15):**
- eKapija
- Naslovi.net
- MondoTech
- B92 Tehnologija tips
- SEEbiz
- Blic Tehno
- Novosti IT
- Politika Nauka
- 021.rs Novi Sad
- InfoStud
- HelloWorld.rs
- Preduzetnik.rs
- Podnesi vest (Startup Ekosistem)
- SEE Digital Summit submit
- LinkedIn Serbian Startups group

**Educational/School (15):**
- Common Sense Education review submit
- EdTech directories (edSurge, Educaplay)
- Belgrade schools direct outreach template
- ChessKid mention (kids audience)
- Scholastic Chess US
- ECU (European Chess Union) news
- Rotary Club chess sponsorships
- Public library digital resources submit

**AI/Tools directories (15):** TheresAnAIForThat, Toolify.ai, FuturePedia, AI Tools Club, AITool.report, InsanelyCoolTools, itd.

Sve u `docs/BACKLINKS_100_PLUS.md` sa checkbox tabelom.

---

## Sprint 4 — Još ideja (30+ novih rasta/features)

**Growth mehanike:**
- **Refer-a-friend leaderboard** — najvise pozvanih u mesecu = zlatna značka + Cup wildcard
- **Chess Streak Contests** — ko drži najduži streak nedeljno, npr. 7-day = 5000 coins
- **Blogger Program** — daj free "Pro" badge svakom ko napravi blog post o MC
- **Streamer Kit** — download page `/streamer-kit` sa overlay-om, logo pack, coin codes za viewere
- **Wikipedia stub** — Nikola Sakotic entry draft (Wikidata prvo, pa jednom kad ima 3+ press coverage → Wikipedia)
- **Podcast pitches** — 10 chess podcast lista sa email templates
- **HARO / Qwoted** — daily journalist queries, odgovori kao "13yo chess founder"
- **Guest posts** — pitch 5 chess blogova
- **Chess Discord partnerships** — 20 velikih chess Discord servera, ponuda "co-hosted tournament"
- **Schools outreach kit** — PDF pitch deck za škole
- **Chess opening trend heatmap** — javna daily grafika, viralna na Twitter chess community
- **"Guess the ELO" viral game** — pokaži partiju, gadaj ELO, share result
- **Chess personality quiz** — 10 pitanja → aggressive/positional/tactical (share card)
- **Weekly Twitter Space** — "MasterChess Talk" sa gostima
- **YouTube automation** — Shorts iz best partija sedmice (koristi `og-match-story`)
- **TikTok automation** — isti pipeline, drugi output
- **Instagram carousel poster** — auto-generated iz `challenge_cards`
- **Threads/Bluesky mirror** — cross-post svih Twitter objava
- **Mastodon chess.social** — pisati tamo
- **Discord bot** (već ima) — proširiti: `/challenge @user` = kreira MC challenge link

**Retention/product ideje:**
- **Onboarding tour** — 4 slajda za prve posetioce (Play, Puzzle, Cup, Community)
- **Skeleton empty states** — nikad prazan ekran; uvek nešto ("odigraj puzzle dok čekaš")
- **In-app "What's New" changelog** — pokazi svake nedelje
- **Trophy case** na profilu — sve značke lepo prikazane
- **Weekly "Player of the Week"** — spotlight jednog usera na Home + email
- **Chess Roulette** — random handicap za smeh
- **Speedrun modovi** — "Sicilian speedrun to 1500 ELO"
- **Daily lesson email** (5 min lekcija)

Sve u `docs/GROWTH_IDEAS_50_PLUS.md`.

---

## Sprint 5 — Auto-cron za sve

Cron edge functions (pg_cron + net.http_post):
- `indexnow-daily` — svaki dan pinguje sve nove URL-ove iz `seo_pages`
- `gsc-daily-report` — GSC top 20 upita → čuva u `seo_query_opportunities`
- `gbp-weekly-post` — objavi post iz `gbp_posts` (već postoji funkcija, samo dodati cron)
- `social-post-cron` — svaki dan iz `challenge_cards` random 3 = objava za X/Threads

---

## Tehnički detalji

**Novi fajlovi:**
- `extension/manifest.json`, `extension/popup.html`, `extension/popup.js`, `extension/background.js`, `extension/icons/`
- `src/pages/Extension.tsx` — landing sa download dugmetom
- `public/masterchess-extension.zip` — pakovani ZIP
- `docs/YANDEX_SETUP.md`, `docs/BING_SETUP.md`, `docs/CHROME_STORE_SUBMISSION.md`
- `docs/BACKLINKS_100_PLUS.md`, `docs/GROWTH_IDEAS_50_PLUS.md`
- `src/App.tsx` — dodati `/extension` rutu

**Frontend izmene:**
- `index.html` — dodati Yandex verification meta tag (placeholder)
- Navbar → dodati "Extension" link u footer

**Bez izmena:** Home dizajn (user veto), matchmaking, competitor brand policy.

---

## Redosled izvršavanja
1. Yandex + Bing setup (10 min)
2. Chrome ekstenzija (build + pakovanje + `/extension` landing)
3. 3 nova docs fajla (backlinks 100+, growth ideas 50+, Chrome store)
4. Auto-cron edge funkcije za IndexNow/GSC/GBP
5. Sitemap regeneracija (auto na build)

Pitanje: da li se slažeš sa OVIM redom ili prvo želiš samo Chrome ekstenziju (pa ostalo posle)?
