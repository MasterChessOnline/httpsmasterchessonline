
# MasterChess — Brutal Ideas Pack + Mobile Perf Pass

Dve faze. Faza A je glavna — biraš koje ideje gradimo iz svakog koša (preporuka: top 1–2 po košu za prvi sprint). Faza B sređuje lag na mobilnoj početnoj posle toga.

---

## FAZA A — 16 brutalnih ideja (4 koša × 4)

### 🔥 Koš 1 — Viral / Social Hooks
1. **Auto-replay highlight reel (15s MP4)** — posle svake pobede, server-side render kratkog klipa partije: tvoja avatar+ELO, ključni potez (clutch moment iz `turning-points`), end-board sa "Checkmate!" overlay-em, MasterChess vodeni žig. Dugme **"Share to IG / TikTok / WhatsApp"**. Svaki share = jedan dolazni klik = viral loop.
2. **"Brag Card" generator** — svaki igrač dobija deljivu sliku 1080×1350 sa: avatar, rank, win-streak vatra, top-3 opening, "Beat me at masterchess.live/@username". OG image isto se renderuje za link preview u DM-ovima.
3. **Streak Flex Mode** — kad pređeš 5/10/25/50 wina u nizu, full-screen takeover sa konfetama + auto-share modal. Pozadina menja boju sa rastom streak-a (bronza → ametist → sun).
4. **Public roast feed (`/roast`)** — javna lista najgorih blunder-a dana (anonimno opcionalno), sa "react" emojima. Tvoj blunder može da postane meme. Nikola komentariše top-3 dnevno.

### ⚔️ Koš 2 — Kompetitivni mod
5. **Weekly Ladder Season (7-day reset)** — svake nedelje rating se zamrzava u "Season ELO". Top 100 vidi se na `/season`, top 10 dobija profile glow + permanent badge. Brutalno za vraćanje korisnika nedeljom.
6. **Rivalry System** — kad izgubiš od istog igrača 2x, automatski ti se otvara "Rivalry" kartica: head-to-head skor, last 5 partija, dugme **"Demand Rematch"** koje šalje notifikaciju. Stvara lične priče.
7. **Daily King (24h champion)** — igrač sa najviše net-rating gain-a u zadnja 24h dobija krunu pored imena svuda na sajtu sutradan. Jedan kralj, ceo sajt zna ko je.
8. **Draft Arena** — pre meča oba igrača "ban-uju" po 1 otvaranje (Sicilian, Italian, itd). Filtruje opening explorer. Brutalno za sadržaj — niko drugi to nema.

### 💰 Koš 3 — Monetizacija
9. **MasterChess Pro (€4.99/mo)** — bez reklama, dual-rating history grafovi, neograničeno AI review partija, ekskluzivne piece-sets/board-themes, profil sa "PRO" goldom, Pro-only ladder.
10. **Coin Shop 2.0 — Animated Avatars** — kupuješ Lottie/WebM avatar koji se vrti, vatra oko avatara, holographic frame. Najjača kozmetika u chess svetu.
11. **Gifted Pro** — ti plaćaš Pro za prijatelja, oboje dobijete "Patron" badge na profilima 30 dana. Twitch-style social monetizacija.
12. **Tournament Entry Tiers** — Free turniri ostaju, plus dodaj 100/500/1000 coin entry turnire sa prize pulom (winner uzima 70% pula). Coins se kupuju ili zarađuju.

### 🤖 Koš 4 — AI Nikola layer
13. **Nikola's Move-of-the-Day** — svako jutro AI generiše kratak (Nikolinim glasom, 13 god, ENG) komentar najboljeg poteza iz juče odigranih partija na sajtu. Pojavljuje se na home + push notifikacija.
14. **Post-Game Voice Recap (15–20s)** — posle partije, jedan klik → AI generiše tekstualni recap u Nikolinom glasu ("Yo, that bishop sac was insane but you missed Nf6+ on move 22"). Opciono TTS (ElevenLabs) sa Nikolinim klonom.
15. **AI Coach Chat (Pro feature)** — chat sa "AI Nikola" iz pozicije bilo koje partije iz tvoje istorije. Pita te "zašto si igrao Qd2?", objašnjava planove. Lovable AI Gateway, Gemini Flash.
16. **Personalized "Style Twin"** — AI analizira tvojih 20 zadnjih partija i kaže "Igraš kao Tal" / "Igraš kao Karpov", sa procentom. Deljiva kartica (loop nazad u Koš 1).

---

## FAZA B — Mobile homepage perf pass (posle Faze A)

Cilj: LCP < 2.5s, INP < 200ms na mid-range Android (4G). Plan koraka:

1. **Profile pre fix** — `browser--performance_profile` na `/` u mobilnoj rezoluciji, snimi pravi LCP/INP/long-task baseline.
2. **Lazy + code-split heavy components** na home:
   - 4D floating pieces (CSS 3D), mouse-parallax, FounderNote, HumanMargin scribbles, DailyChess_12 video embed, Stream Hub preview.
   - Sve ispod fold-a → `React.lazy` + IntersectionObserver mount.
3. **Disable parallax/3D na mobilnom** ispod 768px ili kad `matchMedia('(prefers-reduced-motion)')` ili low-end device (`navigator.deviceMemory <= 4`). Hook `use-device-capability` već postoji — koristi ga.
4. **Image pipeline** — konvertuj hero/splash u AVIF+WebP preko `vite-imagetools`, dodaj `<link rel="preload" as="image" fetchpriority="high">` za LCP sliku, `loading="lazy"` + `decoding="async"` na sve ostale.
5. **Framer Motion diet** — zameni `motion.div` sa pure CSS keyframes za dekorativne animacije (zlatni shimmer, glow). Motion ostaje samo za stateful tranzicije.
6. **Stockfish worker** — NE učitavati na home. Loaduje se tek na `/play/*`. Provera + fix ako se importuje eagerly.
7. **Realtime/presence subscribe** — odloži za "user interacted" (scroll/click), ne na mount.
8. **Bundle audit** — `rollup-plugin-visualizer`, identifikuj top-10 najtežih chunk-ova, dynamic import gde god ima smisla.
9. **Re-profile** posle svake izmene, dokaži poboljšanje brojkama (ne osećajem).

---

## Tehnički okvir (FYI, ne moraš čitati)

- Sve AI funkcije iz Koša 4 → Supabase Edge Functions + Lovable AI Gateway (Gemini Flash default), bez API ključeva za tebe.
- Pro tier → Stripe (managed payments), tax handling po pravilima.
- MP4 render za highlight reel → server-side preko `canvas` + `ffmpeg` u edge runtime ili u dedicated render function.
- Sezone, ladder, rivalry, daily king → nove tabele + RPC + cron edge func (već imaš pattern iz tournament auto-start).
- Sve nove tabele dobijaju RLS + GRANT po projektnom standardu.

---

## Šta sledi

Reci mi **koje ideje hoćeš za prvi sprint** (preporuka: 1 iz svakog koša, npr. **1 + 5 + 9 + 14**) i odmah ulazimo u build. Faza B (perf) ide odmah posle toga.
