
# Plan — 3 velike izmene

## 1) MasterKurs — 7 kurseva, svaki ≥30 varijanti, chapter listanje

**Sadržaj (7 MasterKurseva):**
1. Najdorf Sicilian (Black)
2. Caro-Kann Defense (Black)
3. Queen's Gambit (White)
4. Ruy Lopez (White)
5. King's Indian Defense (Black)
6. Jobava London (White)
7. Kalashnikov Sicilian (Black)

Svaki dobija **≥30 varijanti** sa po 8–18 poteza. Stablo se generiše skriptom (`scripts/build-masterkurs.ts`) iz Lichess Opening Explorer API-ja: za svaku roditeljsku liniju uzimamo top N nastavaka, validiramo svaki SAN sa `chess.js`, i pišemo u `src/lib/openings-data.ts`.

**Chapter navigation u InteractiveBoard:**
- Sidebar lista "Variation 1 / 30 — Najdorf English Attack" sa search
- Klik na varijantu → tabla resetuje na startFen i prikazuje liniju
- Strelice ←/→ ili dugmad **Prev/Next move** — board prati potez po potez
- Slider sa rednim brojem poteza ("Move 5 / 14")
- Auto-play toggle (1 potez/sek)
- Postojeći Engine toggle (eval bar + arrow) ostaje

## 2) Training — 500+ Stockfish-vetted puzzles, mate-to-end, streak

**Brojevi:**
- Powerujemo iz Lichess puzzles DB (već imamo `lichess-puzzles.json`)
- Skriptom (`scripts/build-puzzles.ts`) generišemo **500+ jedinstvenih** (deduped po `id` i po FEN+solution hash)
- Distribucija: 150 mate-in-1, 150 mate-in-2, 100 mate-in-3, 100 taktike (fork/pin/skewer/sacrifice)

**Mate-to-end logika:**
- Trenutno samo prvi potez se proverava. Promenljivo: čuvamo punu UCI sekvenciju u `solution[]`.
- Igrač igra korisnikov potez → engine automatski odigra opp reply iz solution → igrač sledeći → … sve do mata.
- Ako pogrešan potez bilo kada u sekvenci → fail (whyWrong, retry).

**Streak:**
- Počinje od 0, +1 za svaki kompletno rešen puzzle
- Reset na fail
- Best streak persistuje u localStorage (`mc:training:bestStreak`)
- Visible badge: "🔥 Streak: 7 (Best: 23)"

**Routing:**
- Homepage "Training" tile → `/training` ✓ (već urađeno)
- Learn page: dodaj veliki "Solve Puzzles" CTA card koji vodi na `/training`
- Ukloni stare "glupe" practice pozicije iz `training-positions.ts` (zadržati samo Lichess set)

## 3) Drag & Drop — default + Settings toggle

**Settings:**
- Novi toggle: **Move input mode** = `Drag & Drop` (default) | `Click to Move` | `Both`
- Persist u `user-settings.ts` localStorage key `mc:settings:moveInput`
- React context ili hook `useMoveInputMode()`

**Bug fixes na drag&drop:**
- Pravilno ignoriši drag start ako je piece-not-yours
- Premove drag tokom protivnikovog vremena
- Promotion dialog se otvara nakon drop-a na 8./1. red
- Drop na istu polje = no-op (neće da deselektuje)
- `dragend` cleanup (npr. drop van table)
- Touch (mobilni): koristi pointer events fallback ili HTML5 touch polyfill

**Mode behavior:**
- `Drag & Drop` only: klik na figuru ne radi ništa (samo highlight)
- `Click to Move` only: figure nisu draggable
- `Both`: trenutno ponašanje

---

## Tehnički koraci

1. **Build skripte** (`scripts/`):
   - `build-masterkurs.ts` — za svaki kurs, fetchuj Lichess Explorer top-moves rekurzivno do depth 8, validiraj sa chess.js, pisi u TS modul
   - `build-puzzles.ts` — proširuje `lichess-puzzles.json` na 500+, čuva punu UCI sekvencu

2. **Komponente:**
   - `src/components/learn/VariationSidebar.tsx` (novo) — lista 30+ varijanti
   - `src/components/learn/MoveStepper.tsx` (novo) — Prev/Next/Slider/Autoplay
   - `InteractiveBoard.tsx` — integracija sidebar + stepper, chapter mode
   - `Training.tsx` — multi-step solve, streak UI, autoplay opp moves
   - `lichess-puzzles.ts` — vrati `solution: string[]` umesto samo prvog
   - `Settings.tsx` — novi toggle Move input mode
   - `ChessBoard.tsx`, `OpeningBoard.tsx`, `InteractiveBoard.tsx` — poštuj `useMoveInputMode()`
   - `Learn.tsx` — Solve Puzzles CTA card

3. **Hookovi:**
   - `useMoveInputMode()` u `user-settings.ts`
   - `useTrainingStreak()` u `hooks/`

---

## Redosled implementacije

A. Build skripte → generišu data
B. Drag&drop toggle + bug fix (najmanji obim, vidljivo odmah)
C. Training mate-to-end + streak + Learn CTA
D. MasterKurs chapter navigation + 30+ varijanti

Krećem A→B→C→D u jednom paketu kao ranije. Reci OK pa idemo.
