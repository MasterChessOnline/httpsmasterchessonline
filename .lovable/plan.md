# MasterChess — "Nešto potpuno novo" + Brutalni Growth Plan

Cilj: MasterChess prestaje da bude "još jedan šah sajt" i postaje **kulturni fenomen za šahiste** — sa mehanikama kojih nema na Chess.com/Lichess-u i agresivnim distribucionim planom. Podeljeno u **4 talasa** koji se puštaju kroz sprintove.

---

## TALAS 1 — 12 originalnih koncepata (product diferencijacija)

Nijedan ne postoji na Chess.com/Lichess-u. Svaki je share-worthy sam po sebi.

1. **World Chess Map (Live Globe)** — 3D globus, tačke svetle kad se igra partija, klik na državu = najjači aktivni igrač + živi turniri. Embed widget za blogove.
2. **Live Chess TV** — homepage bez logina prikazuje 3-4 najzanimljivije partije u toku (heuristika: rating, tenzija, vreme), auto-komentari.
3. **Chess Time Machine** — "Ti si Kasparov 1985, potez 23. Šta igraš?" Poznate istorijske pozicije, poredi se sa originalom.
4. **Global Club Wars** — sezonska liga klubova, weekly points, promocija/degradacija, live standings.
5. **Hall of Fame** — auto-kurirane najbolje partije dana/nedelje/meseca (algoritam: brilliants + upset + drama).
6. **Instant Tournament** — jedan klik → javni turnir za 10 min, deljivi link, auto-oglašen u lobiju.
7. **Chess DNA** — nakon 20 partija dobiješ "DNA otisak": stil, boje, otvaranja, slabosti — kao Spotify Wrapped, share slika.
8. **Rivalry Mode** — sistem automatski predlaže "nemesise" (slični rating, više partija), posebna tabela H2H sa dramom.
9. **Predict-the-Move** — dok gledaš tuđu partiju pogađaš sledeći potez, dobijaš XP za pogotke (bez engine spoilera).
10. **Blunder Museum** — javna galerija najgorih blundera nedelje (opt-in), reakcije, komentari — samoironija.
11. **Chess Confessions** — anonimni feed ("Izgubio sam od 800 elo bota jer sam bio pijan"), like/comment, viralno.
12. **Streamer Duel Nights** — zakazani eventi gde streameri (DailyChess_12 + gosti) igraju protiv publike sa lobby chatom.

## TALAS 2 — 12 "growth-native" koncepata (svaki je distribucioni kanal)

Feature = ujedno i akvizicioni kanal.

13. **Challenge Card Generator** — posle svake partije, jedan klik generiše 1080x1350 sliku (pozicija + rezultat + rating change + QR) — spremno za IG/X/TikTok. Watermark = link.
14. **Embed Board Widget** — bloggeri/YouTuberi ubacuju `<iframe>` sa mini-boardom + "Play on MasterChess" CTA. Backlink farma.
15. **/vs/{code} Viral Links** — igraj protiv prijatelja bez registracije, registracija se traži tek posle 3. partije.
16. **Chess Meme Studio** — template-i za memove sa šahovskih pozicija, share direktno na Reddit/X.
17. **Daily Puzzle Battle** — svi rešavaju isti puzzle u isto vreme (20:00), live leaderboard, retweet-friendly.
18. **Coach Marketplace (free)** — bilo ko iznad 1800 može ponuditi 15min konsultacije, profil = SEO landing page.
19. **Chess Bounties** — "Nagrada 500 coina onome ko me pobedi u Sicilijanci" — post na feed, prihvati, igraj.
20. **Country Leaderboards** — top 100 po državi/gradu, SEO landing (`/leaderboard/serbia/belgrade`).
21. **Opening Trend Reports** — nedeljni auto-report "Najpopularnija otvaranja ove nedelje" → objavljuje se kao blog + tweet.
22. **Player Cards (Trading-card style)** — svaki profil ima kolekcionarsku kartu, kolekcioniraj karte igrača koje si pobedio.
23. **Time-Attack League** — 60-sekundni matčevi, non-stop 24/7 queue, viralno na TikToku.
24. **Chess Roulette** — spin → dobijaš random handicap (bez damе, obrnut sat, itd.), kratke smešne partije.

## TALAS 3 — 8 "retention/depth" koncepata

Da se ljudi VRAĆAJU svakog dana.

25. **Season Storyline** — svaka sezona (3 meseca) ima priču/temu (npr. "Rat Škola"), progresija, sezonske nagrade.
26. **Chess Journal** — auto-generisan lični dnevnik ("Danas si dobio 3 protiv Karo-Kana, tvoj win rate skočio na 62%").
27. **Skill Tree Public** — javno stablo veština koje se otključavaju kroz igru (ne uči — dokazuje).
28. **Mentor Chain** — ako te neko pozove i on te nauči → dobija % tvog XP zauvek (Ponzi na dobar način).
29. **Weekly Boss Fight** — svake nedelje jedan custom bot sa jedinstvenim stilom, ko ga pobedi = badge na profilu.
30. **Guild Chat Rooms** — trajne sobe po interesovanjima (Sicilijana lovers, endgame nerds), non-modaman.
31. **Comeback Streaks** — ako gubiš 3 zaredom pa dobiješ 3 zaredom = "Phoenix" badge + XP bonus.
32. **Silent Mode Tournaments** — turniri bez chat-a, bez rating prikaza — samo šah, za purists.

## TALAS 4 — GROWTH & DISTRIBUCIJA (paralelno sa Talasima 1-3)

### A. Product Hunt Launch (jednokratna eksplozija)
- **Priprema (2 nedelje pre):** teaser page `/ph-launch`, email lista, "Hunter" outreach (top 20 huntera u gaming/dev prostoru), gif demo (World Map + Live TV + Instant Tournament), 5 screenshotova, 60s video.
- **Launch dan (utorak 00:01 PST):** koordinisani push preko Discord/Twitter/Reddit/email liste, DailyChess_12 YouTube shoutout, live "launch tournament" sa nagradama.
- **Cilj:** Top 5 dana, 500+ upvotes, 50+ komentara.

### B. Reddit Blitz (kontinuirano)
- Edge function `reddit-comment-scout` (već planirana) proširena na 8 subreddita: r/chess, r/AnarchyChess, r/chessbeginners, r/ChessPuzzles, r/tournamentchess, r/SideProject, r/InternetIsBeautiful, r/webdev.
- **Content angles:**
  - r/AnarchyChess: memovi iz Meme Studio, Blunder Museum posts
  - r/chess: Opening Trend Reports, Country Leaderboards za njihovu državu
  - r/SideProject + r/InternetIsBeautiful: World Chess Map showcase
  - r/webdev: "Kako smo napravili real-time šah sa Supabase Realtime" tech blog
- Manual queue u `/admin/reddit-queue`, cilj **20 kvalitetnih postova/nedeljno**.

### C. Backlink Farm (50+ direktorijuma)
- `directory-submitter` edge function (već planirana) šalje na:
  - **Startup:** BetaList, Product Hunt, Indie Hackers, SaaSHub, ToolFinder, Launching Next, Startup Stash, StartupBase, AlternativeTo, Slant.
  - **Gaming/Chess-specific:** BoardGameGeek forum, ChessPub, chess subreddit wiki, r/chess sidebar submission, Chess Federation portali (FIDE nacionalni), lokalni klubovi.
  - **Wiki:** Wikidata entry za "MasterChess", Wikipedia draft (posle 6 meseci trafika), OpenStreetMap za World Map data.
  - **SEO/Tool direktorijumi:** G2, Capterra (free tier), SourceForge, Softpedia.
  - **Aggregator feeds:** RSS na 20 chess/gaming aggregatora, IndexNow ping.

### D. Content Marketing (kontinuirano — nadovezuje se na već pokrenuti SEO Content Farm)
- **`daily-news-writer` edge function:** svakog dana auto-generiše news post o šahovskom svetu (turniri, GM partije, otvaranja u trendu) → objavljuje na `/news/{slug}` + submit na Google News.
- **Weekly blog series:**
  - "MasterChess Weekly Trends" (podaci iz naše platforme)
  - "Anatomy of a Brilliant" (razlaga najbolju partiju nedelje)
  - "Country Spotlight" (šah u datoj državi + poziv lokalnim igračima)
- **YouTube:** DailyChess_12 dobija exclusive access na Weekly Boss Fight rezultate → sadržaj za video.

### E. Social Loops (auto)
- `social-post-generator` (već planirana) svakog dana pravi:
  - X: 3 posta (najbolji potez dana, meme, stats update)
  - IG: 1 reel iz Challenge Card highlights
  - TikTok: Time-Attack montaža
- Cross-post preko Buffer/Zapier (BYO webhook) ili manual queue.

### F. Partnership Outreach
- **Chess streameri:** 20 srednjih (10-100k subs) — free premium + revshare od donacija.
- **Chess klubovi:** lokalni klubovi u Srbiji + Balkan → free Club Wars, oni promovišu među članovima.
- **Škole:** free "school edition" (bez chat/social) za nastavnike → SEO landing `/for-schools`.

---

## Redosled sprintova (posle trenutnog Sprint 2 SEO Content Farm)

- **Sprint 3:** Challenge Card Generator (#13) + Embed Board Widget (#14) + Chess DNA (#7) — sve tri su viral loopovi sa najvišim ROI.
- **Sprint 4:** World Chess Map (#1) + Live Chess TV (#2) — flagship "wow" featureovi za Product Hunt launch.
- **Sprint 5:** Instant Tournament (#6) + Global Club Wars (#4) + Hall of Fame (#5) — retention/community core.
- **Sprint 6:** Product Hunt launch prep + `directory-submitter` + `daily-news-writer` + Reddit content pipeline.
- **Sprint 7:** Product Hunt launch dan + koordinisani Reddit/X/YouTube push.
- **Sprint 8+:** Ostali koncepti iz Talasa 1-3 po prioritetu na osnovu launch podataka.

## Tehnički detalji (za developere)

- **Nove tabele:** `world_map_presence` (heartbeat po državi), `hall_of_fame_entries`, `instant_tournaments`, `club_wars_seasons`, `club_wars_matches`, `chess_dna_snapshots`, `rivalries` (već postoji, proširiti), `predict_move_attempts`, `blunder_museum_submissions`, `confessions` (već postoji), `challenge_cards`, `embed_widgets_analytics`, `player_trading_cards`, `weekly_boss_defeats`, `guilds`, `season_storylines`.
- **Nove edge funkcije:** `world-map-aggregator` (cron 30s), `live-tv-curator` (cron 60s), `hall-of-fame-selector` (cron daily), `instant-tournament-launcher`, `club-wars-scheduler`, `chess-dna-generator`, `challenge-card-renderer` (Satori/canvas → PNG), `daily-news-writer`, `directory-submitter`, `reddit-scout-v2`, `social-post-generator`.
- **Frontend:** `/world` (3D globus preko `react-globe.gl`), `/live` (Live TV grid), `/hall-of-fame`, `/instant`, `/club-wars`, `/dna/:userId`, `/museum`, `/confessions` (već postoji), `/predict/:gameId`, embed HTML: `/embed/board?fen=...`.
- **Vanjske biblioteke:** `react-globe.gl` (World Map), `satori` (card rendering), `resend` (news outreach), Reddit API (read-only za scout).

## Šta ovaj plan NAMERNO ne radi

- Ne redizajnira Home (user veto).
- Ne dodaje AI u human-vs-human partije.
- Ne linkuje i ne pominje Chess.com/Lichess-a u UI-u.
- Ne pravi fake engagement, ghost igrače, ni bot-fill u matchmaking-u.

---

**Sledeći korak posle odobrenja:** kreni sa Sprint 3 (Challenge Card + Embed Widget + Chess DNA) jer su ta tri feature-a najbrža za implementaciju i odmah proizvode share-ovan sadržaj koji hrani Talas 4 growth kanale.
