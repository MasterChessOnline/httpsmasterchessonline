# Plan — Šta još dodati da sajt eksplodira od popularnosti

Imaš već: 156+ indexed URL-ova, GA4, IndexNow, OG slike po openingu, ShareBar svuda, FAQ schema, admin dashboard. Sledeći nivo je **viralnost + retencija + vidljivost**.

## 1. Viralni "Chess Card" generator (najveći ROI)
Stranica `/card/:username` koja generiše **personalizovanu sliku 1200×630** sa: avatar, ELO, win rate, najjači opening, "play personality" badge, QR kod ka profilu.
- Dugme "Share my chess card" na profilu, posle svake pobede, na kraju turnira
- Auto-tweet template: "Just hit 1500 ELO on @masterchess ♟️ [card image]"
- Svaka deljena karta = backlink + slika u Google Images sa keyword "chess rating"
- **Zašto radi:** ljudi vole da deli postignuća. Chess.com/Lichess nemaju ovo lepo rešeno.

## 2. "Daily Position" — viralna kuka koja vraća ljude
Svaki dan jedna pozicija na `/daily` sa countdown-om do sledeće.
- Email + push notifikacija u 9h ujutru
- Globalni leaderboard ko je rešio najbrže
- Auto-share rezultat ("Solved today's position in 12s — can you?")
- Streak counter (gamifikacija + retention)
- **Zašto radi:** Wordle-efekat. Daily ritual = svakodnevni traffic + viralno deljenje.

## 3. Public player profili (`/u/:username`) indexable
Trenutno profili nisu javno indexovani. Otvoriti top 500 igrača kao public stranice:
- SEO title: "Marko Petrović — 1847 ELO chess player | MasterChess"
- Recent games, openings repertoire, achievements
- Dodati u `sitemap-players.xml` (auto-generated)
- **Zašto radi:** ljudi guglaju svoje ime → nalaze profil → dele ga. +500 indexed stranica preko noći.

## 4. Embed widgets za druge sajtove (backlink magnet)
Već imaš `/embed-tools` — proširiti sa:
- **PGN viewer iframe** (svaki chess blogger će ga embed-ovati)
- **Live tournament widget** (klubovi staviti na svoj sajt)
- **Mini puzzle widget** za blogere
- "Powered by MasterChess" footer = automatski backlink sa svakog embed-a
- **Zašto radi:** Lichess je tako narastao. Free tools = stotine backlink-ova mesečno.

## 5. Referral program sa nagradama
`/referrals` već postoji — aktivirati sa konkretnim:
- 3 prijave = "Recruiter" badge + besplatan custom piece set
- 10 prijava = "Ambassador" + ime na hall of fame
- Personalizovan link `masterchess.live/r/marko123`
- **Zašto radi:** najjeftiniji rast po user-u. K-faktor > 1 = exponential.

## 6. SEO content engine (50 novih članaka automatski)
Imaš 23 learn članaka — dodati 50 dugog repa:
- "Best chess opening for [rating]" (×10 rejtinga)
- "How to beat [opening] as [color]" (×20 openinga)
- "Chess tips for [age group]" (×5)
- Svaki članak: 1500+ reči, FAQ schema, internal linkovi, ShareBar
- **Zašto radi:** dugi rep nosi 70% organskog trafika. Niska konkurencija.

## 7. Reddit/Discord launch kampanja
- Post na **r/chess, r/chessbeginners, r/AnarchyChess** (3.5M kombinovano)
- Naslov: "I built a free chess site with X feature [Lichess/Chess.com] doesn't have"
- Pin "Show & tell" thread-ovi na chess Discord serverima
- AMA na r/chess
- **Zašto radi:** jedan dobar Reddit post = 50,000 poseta za 24h.

## 8. PWA + push notifikacije
`manifest.json` već postoji. Dodati:
- "Add to home screen" prompt
- Push notifikacije: daily puzzle, "opponent moved", turnir starta za 5min
- Offline mod (cache poslednje partije)
- **Zašto radi:** retention 3× viši kad je PWA instaliran. Push = recurring traffic.

---

## Preporučeni redosled (od najvećeg ROI)

1. **Chess Card generator** (1 dan) — odmah viralno
2. **Daily Position** (2 dana) — kreira retention loop
3. **Public profili + sitemap** (1 dan) — +500 indexed stranica
4. **Reddit launch** (1 dan, posle gornjeg) — burst trafik
5. **50 SEO članaka** (3-5 dana, AI-assisted) — long tail
6. **Embed widgets** (2 dana) — dugoročni backlinks
7. **Referral aktivacija** (1 dan)
8. **PWA push** (2 dana)

## Tehnički plan (ukratko)

- **Chess Card:** edge funkcija `chess-card-image` (Satori PNG render), nova `/card/:username` stranica, dugme u Profile.tsx i posle game-a
- **Daily Position:** nova tabela `daily_positions` (admin posts dnevno ili cron iz Lichess puzzle DB), `/daily` stranica, Resend email cron, FCM push
- **Public profili:** otkloniti `Disallow: /profile` u robots.txt za public flag, `/u/:username` ruta, scripts/generate-sitemap.ts dodaje top 500 by ELO
- **Embed widgets:** proširiti `EmbedBoard.tsx` sa `?mode=pgn`, `?mode=puzzle`, `?mode=tournament`
- **Push:** service worker već postoji u PWA, dodati FCM ili Web Push API + tabela `push_subscriptions`

---

**Reci broj (npr. "1, 2 i 3") ili "sve redom" da krenem.** Preporučujem **1 + 2 + 3 + 4** — to je realno 5 dana rada i može da donese 10× više trafika za mesec dana.
