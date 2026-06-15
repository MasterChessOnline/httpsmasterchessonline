# Plan: Mobile fix + "Beat Nikola" viralna kuka

Dva paralelna pravca, jedan posle drugog (perf prvo, hook posle — jer hook bez perf-a ne radi).

---

## Deo 1 — Mobile Perf Fix (merljivo, ne nagađanje)

**Cilj:** LCP < 2.5s, INP < 200ms, nema dropova ispod 30fps pri scrollu na 375px viewport.

### 1.1 Baseline merenje
- Pustiti `browser--performance_profile` na `/` u mobile viewport (375x812)
- Snimiti: LCP, INP, CLS, JS heap, najteže resurse, najduže taskove
- To je baseline brojka — sve dalje merimo protiv nje

### 1.2 Konkretne intervencije (po prioritetu impacta)

**a) `backdrop-blur` kill na mobile**
- Trenutno: 136 `backdrop-blur` klasa u `src/components` + `src/pages`
- Svaki blur = GPU re-sample svakog frame-a → glavni krivac za scroll lag
- Dodati globalni CSS guard: na `@media (max-width: 768px)` → `backdrop-filter: none !important` za sve dekorativne klase (`.glass-4d`, generic `.backdrop-blur-*`)
- Solid bg zamena (npr. `bg-card/85`) gde je čitljivost ugrožena

**b) Framer Motion diet na home-u**
- Trenutno: 50 `motion.*` instanci samo u `Index.tsx`
- Dekorativne animacije (hover scale, whileInView fade-in na sekcijama koje su uvek vidljive) → zameniti CSS keyframes ili obrisati
- Zadržati samo: hero CTA tap, glavni headline reveal
- Bot icon "wiggle" u Quick Match-u radi `repeat: Infinity` na 5 dugmadi paralelno — ubiti na mobile

**c) Realtime / subscriptions defer**
- `LivePlayerCounter`, `LiveActivityFeed`, `ActivityPulse` — konektuju Supabase channel na mount
- Promeniti: konektuju se tek posle prvog user interakcije (scroll/click) ili posle 3s idle
- Na mobile sa 3G to znači manje request-a u prvih 3s = brži LCP

**d) Slike → AVIF/WebP**
- Hero `hero-chess.jpg`, `masterchess-poster.jpg`, `nikola-bot-avatar.jpg`
- Konvertovati preko `sharp` skripte u `public/` (ili `vite-imagetools` ako već postoji)
- Trenutno hero verovatno 300-600KB jpg → očekivano 50-100KB webp

**e) Bundle audit**
- Pokrenuti production build, analizirati top 10 chunkova
- Ako Stockfish/chess.js leak-uju na home (verovatno preko nekog import lanca) — dynamic import-ovati ih samo iz `/play/*` route-a

### 1.3 Re-merenje
- Posle svake intervencije pustiti `performance_profile` ponovo
- Dokazati brojkama, ne osećajem

---

## Deo 2 — "Beat Nikola" viralna kuka

**Cilj:** Jedna feature stvar koju gosti screenshot-uju i šalju drugaru. Leverage tvoje lične priče (13yo, 3500, founder).

### 2.1 Šta već postoji
- Bot `nikola-sakotic` (uncapped Stockfish, najjači bot)
- Hero već ima "Challenge me" card sa tvojim avatarom
- Bot games se beleže u `bot_games` tabelu

### 2.2 Šta dodajemo

**a) Nova ruta `/beat-nikola`**
- Hero: tvoj avatar, "I'm 13. I'm 3500. Nobody has beaten me on this site yet. You think you can?"
- Live counter: *"X people tried. Y have won."* (real iz `bot_games` filter `bot_id=nikola-sakotic`)
- JEDNO dugme: **▶ Try me now** → odmah pokrene partiju protiv nikola-sakotic bota (10+0 default)

**b) Wall of Fame (public leaderboard)**
- Tabela svih ko je pobedio Nikola bota
- Kolone: avatar, ime, datum, broj poteza, mali "Watch replay" link
- Pull live iz `bot_games WHERE bot_id='nikola-sakotic' AND result='player_won'`
- Sortirano po datumu, top 50

**c) Share card (auto-generated)**
- Posle svake pobede protiv Nikole → fullscreen takeover
- "You beat the 13yo founder in X moves" + tvoj avatar + njihov avatar + final position mini-board
- Dugmad: "Download image" (canvas-to-png) + "Share on X/IG/WhatsApp" (Web Share API)
- Ovo je viralni mehanizam — slika sa MasterChess brendiranjem koja se širi sama

**d) Loss screen (counter-hook)**
- Ako izgube → "You lost. So did 99% of others. Try again — your rating is now tracked."
- Soft signup nudge: "Save your progress" (1-click Google)

### 2.3 Integracija
- Hero CTA na `/` dobija drugu dugmad red: malo *"Or: try to beat the founder →"* link na `/beat-nikola`
- U Navbar "More" submenu dodati "Beat Nikola"
- OG image za `/beat-nikola` (custom za bolji preview na share-ovima)

---

## Tehnički detalji

```text
Deo 1:
  src/index.css                      → mobile blur-kill media query
  src/pages/Index.tsx                → motion diet, gate animacija po allowHeavy
  src/components/LivePlayerCounter   → defer subscribe (interaction-trigger)
  src/components/LiveActivityFeed    → defer subscribe
  src/components/ActivityPulse       → defer subscribe
  scripts/optimize-images.mjs (new)  → sharp → AVIF/WebP za 3 hero slike
  vite.config                        → manualChunks za chess.js / stockfish

Deo 2:
  src/pages/BeatNikola.tsx (new)     → hero + leaderboard + start-game CTA
  src/components/beat-nikola/
    LeaderboardWall.tsx (new)        → real-time pull iz bot_games
    ShareWinCard.tsx (new)           → canvas image generator + Web Share API
    TriedCounter.tsx (new)           → live counter (pokušaja vs pobeda)
  src/App.tsx                        → route /beat-nikola
  src/pages/Play.tsx                 → post-game hook: ako bot=nikola-sakotic & player won → trigger ShareWinCard
  public/og-beat-nikola.jpg (new)    → OG share image
```

**Bez DB izmena:** sve podatke vučemo iz već postojeće `bot_games` tabele.

---

## Redosled izvršenja

1. **Profile baseline** (5 min, čisto merenje)
2. **Mobile fix a→e** (najveći impact prvo: blur kill → motion diet)
3. **Re-profile, dokazati brojkama**
4. **Beat Nikola: ruta + leaderboard + start CTA** (MVP)
5. **Share card + loss screen** (viralni layer)
6. **Hero link sa `/` + Navbar entry**

---

## Šta NE radimo

- Ne diramo postojeće feature, samo dodajemo
- Ne menjamo brend, fontove, color palette
- Ne dodajemo nove backend tabele (sve iz `bot_games`)
- Ne pravimo PWA / offline / push (osim ako tražiš)
- Ne ubacujemo "fake counters" — Wall of Fame i Tried/Won counter su 100% real query
