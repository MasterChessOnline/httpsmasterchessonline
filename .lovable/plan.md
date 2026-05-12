# MasterChess — Kompletan Update Plan

Veliki scope, pa cu raditi u jasnim fazama. Svaka faza je samostalna i ne lomi prethodne.

## Faza 1 — Learn sekcija (najveci deo)

**Cilj:** Learn ima 3 jasna taba: Openings / Master Courses / Training. Training BEZ kurseva.

### 1.1 `src/pages/Learn.tsx` rewrite
- Tri taba na vrhu: **Openings**, **Master Courses**, **Training**
- **Training tab** = samo CTA kartice ka: Puzzles, Tactics, Pattern, Calculation, Mate-in-1/2/3, Endgame Drills, Streak, Combo. Bez ijednog kursa.
- **Openings tab** = lista openings kurseva (filtrirano `category: "openings"` + masterclass openings)
- **Master Courses tab** = svih 7 masterklasa
- Svaki kurs renderovan istom `CourseCard` komponentom (cover, difficulty, name, progress bar, chapters count, variations count, est. time, favorite ⭐, "Continue learning" dugme, "Last played" timestamp)

### 1.2 Unified Course Player — `src/components/learn/CoursePlayer.tsx` (novo)
Zameni postojeci interaktivni view za sve kurseve (Openings + Master). Layout:

```
┌─────────────────────┬──────────────────────┐
│                     │  Chapter / Variation │
│      CHESSBOARD     │  selector            │
│   (drag + click)    │                      │
│                     │  Move list (SAN)     │
│                     │  -> highlight current│
│                     │                      │
│  ◀◀ ◀ ▶ ▶▶  ▶auto  │  Notation panel      │
│  Start End Pause    │  Engine comment      │
└─────────────────────┴──────────────────────┘
```

Funkcije:
- `chess.js` instanca + `history` array
- **NEXT** / **PREVIOUS** / **START** / **END** dugmad
- **Autoplay** (1.2s/move) + **Pause**
- Keyboard: ←/→/Home/End/Space
- Smooth piece animacija (Framer Motion `layout`)
- Highlighted from/to squares
- Arrow overlay za "best move" (kada postoji u podacima)
- Engine comment panel ispod move liste
- "Practice vs Computer from this position" dugme → otvara `/play?fen=...`

### 1.3 Progress persistence — `src/hooks/use-course-progress.ts` (novo)
localStorage ključ `mc:course-progress:<courseId>`:
```ts
{ lastChapterId, lastVariationId, lastMoveIndex, completedChapters: [], percent, updatedAt }
```
- "Continue learning" čita ovo
- Course card prikazuje progress bar i "Last played"

### 1.4 Course data uniformity
`src/lib/courses-data.ts` — proveri da svi kursevi imaju: `coverImage, difficulty, totalChapters, totalVariations, estMinutes`. Dopuni gde fali.

## Faza 2 — Welcome Intro / Onboarding

`src/components/AuthGate.tsx` — pretvori postojeci u **cinematic intro**:
- 2.5s intro sekvenca: floating chess pieces (Framer Motion), gold glow, logo reveal
- Posle intro: 3 velika CTA — **Play Your First Game**, **Challenge The AI**, **Start Training**, plus diskretnije Sign Up / Log In
- Ako user nije ulogovan a klikne CTA → vodi na Signup
- Smooth gradient pozadina, dark gaming feel

## Faza 3 — Board UX (drag/drop, premove)

**Audit `src/components/chess/`** — pronaći glavni board komponent. Popraviti:
- Drag: piece prati kursor 1:1, shadow + lift (scale 1.1, drop-shadow)
- Bez teleportovanja: koristi pointer events + `setPointerCapture`
- Click-to-move + drag rade istovremeno
- **Premove**: kada nije tvoj red, sledeći legal-na-trenutnoj-poziciji potez se snima i prikazuje poluprovidno (opacity 0.5, žuta ivica). Kada dođe red, automatski izvrši ako je i dalje legal.

## Faza 4 — Chess pravila (verifikacija)

Provera da chess.js već pokriva: 3-fold rep, 50-move, stalemate, insufficient material, en passant, castling, promotion. Dodaj ako fali:
- **Auto-offer draw** kad `chess.isThreefoldRepetition()` (toast sa "Claim Draw" dugmetom)
- Repetition counter u game info panelu
- Captured pieces tray (verovatno postoji, proveriti)

## Faza 5 — Sound system

`src/lib/chess-sounds.ts` već ima: move, capture, check, gameOver, start. Dodaj:
- `playPremoveSound`, `playIllegalSound`, `playPromotionSound`, `playCountdownSound`, `playCheckmateDramatic` (ducked + dramatic)
- Mali sample fajlovi (sintetisano kroz postojeci `playToneSequence` ako nema mp3-a)

## Faza 6 — Training Streak System

Već postoji `useTrainingStreak`. Nadograditi `src/pages/Training.tsx`:
- 🔥 **Animated fire icon** (Framer Motion scale + glow) — veličina raste sa streak (1-5 small, 5-15 medium, 15+ huge sa particles)
- **Combo multiplier** prikaz (x2 posle 5 u nizu, x3 posle 10, itd.)
- XP gain toast posle svakog tačnog
- Daily mission widget (već postoji `DailyMissions` komponenta — uvezi)

## Faza 7 — Polish

- Homepage: veliki board preview u hero-u (već postoji `HeroSection`, dotjerati)
- Smooth hover/glow na svim primary dugmadima (utility klasa u `index.css`)
- Mobile pass — sve nove komponente

## Šta NE diram
- Supabase šemu, Edge funkcije, auth providers
- Tournaments, Stream Hub, Community
- Postojeći Jobava London / Kalashnikov SADRŽAJ (samo player UI postaje uniforman)

## Redosled isporuke
Idem fazama 1 → 2 → 3 → 6 → 4 → 5 → 7. Faza 1 je najveca i najvrednija (zatrazena prva). Posle svake faze proverim build i mobile viewport.

## Tehnicke note
- Sve nove komponente koriste design tokens iz `index.css` (gold/black tema)
- `chess.js` već u projektu
- `framer-motion` već u projektu
- Bez novih dependency-ja
