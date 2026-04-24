
# Interactive Boards for Every Lesson — Plan

Cilj: **Svaka lekcija u Learn sekciji** dobija interaktivnu tablu (`InteractiveBoard`) sa primerom koji je **direktno povezan sa temom** te lekcije.
- Endgame lekcija → endgame pozicija (npr. K+P vs K za "King + Pawn")
- Opening lekcija → konkretne opening linije sa varijacijama
- Tactics lekcija → primer pozicije sa fork/pin/skewer-om
- Strategy/middlegame → karakteristična pozicija (slabi pioni, otvorene linije...)
- Basics → demonstracija samog pravila/koncepta

## Trenutno stanje

- **625 lekcija ukupno** u 31 kursu (`src/lib/courses-data.ts`)
- **Samo 95 (15%)** trenutno ima board u `LESSON_MOVES` (`src/lib/lesson-moves.ts`)
- **530 lekcija fali board** — uključujući celokupne kurseve poput `core-beginner`, `core-intermediate`, `core-advanced`, `strategy-masterclass`, svi opening deep-dives (London, English, Caro-Kann, Sicilian itd.)

Detaljni gap (top deficiti):
- Beginner / Intermediate / Advanced core kursevi: 0/50 imaju tablu
- Strategy: 5/106
- Openings: 25/173 (Sicilian Deep Dive, Caro-Kann, London, English, Nimzo, Scandinavian, Dutch — svi 0)
- Endgame: 8/80
- Middlegame: 4/80
- Tactics: 38/78 (najbolja pokrivenost)

## Šta će biti urađeno

### 1. Generisanje board entries za svih 530 nepokrivenih lekcija
Za svaku lekciju biće dodan `LESSON_MOVES[lessonId]` zapis sa:
- **`startFen`** (po potrebi) — startna pozicija relevantna za temu
- **`moves`** — niz od 4–10 poteza sa edukativnim objašnjenjima
- **`variations`** (za opening lekcije) — više linija ako postoji glavna teorija

### 2. Strategija po kategoriji

**OPENINGS (148 nepokrivenih)** — najveći prioritet, korisnik ovo eksplicitno traži.
Svaka opening lekcija dobija glavne linije te varijacije.
Primer: "Sicilian Najdorf — 6.Be3 English Attack" → board počinje sa Najdorf pozicijom, igra se 6.Be3 e6 7.f3 b5 8.Qd2... sa objašnjenjima.

**ENDGAMES (72 nepokrivenih)** — drugi prioritet.
Svaka lekcija počinje sa relevantnom endgame pozicijom (FEN sa malo figura), korak po korak demonstracija tehnike.
Primer: "Lucena Position" → klasičan Lucena FEN, sekvenca poteza koja vodi do pobede.

**BASICS (38 nepokrivenih)** — beginner core.
Demonstracije: kako se pomera figura, šta je šah, šta je rokada, opozicija itd.

**TACTICS (40 nepokrivenih)** — pozicije sa konkretnim taktikama.
Primer: "Removing the Defender" → pozicija gde je odbrana figura ključ, demonstracija kako se ona ukloni.

**STRATEGY (101 nepokrivenih) i MIDDLEGAME (76 nepokrivenih)**.
Karakteristične pozicije iz partija velikana koje ilustruju koncept (slabi pioni, izolovani pion, manjinski napad, prostorna prednost).

### 3. Tehnička realizacija

Pošto je 530 lekcija previše za ručno pisanje u jednoj iteraciji (~25,000 linija koda), radimo ovako:

**Pristup: Generator script + ručna kuracija ključnih lekcija**

a) **Skripta `scripts/generate-lesson-boards.ts`** koja:
   - Čita sve lekcije iz `courses-data.ts`
   - Za svaku lekciju koja **fali** u `LESSON_MOVES`, generiše entry koristeći:
     - **Opening lekcije** → ECO knjiga sa standardnim linijama (lokalna mapa naziv → SAN sekvenca)
     - **Endgame lekcije** → katalog kanonskih FEN pozicija (Lucena, Philidor, Vančura, K+P opozicija, K+R vs K, K+B+N vs K, itd.)
     - **Basics/Tactics/Strategy** → smart matching po ključnim rečima u naslovu/sadržaju lekcije ka biblioteci od ~80 reference pozicija

b) **Output** se generiše direktno u `src/lib/lesson-moves.ts` (append novih entries).

c) **Validacija**: skripta proverava da li je svaka SAN sekvenca legalna preko `chess.js` pre upisivanja. Nelegalni potezi se preskaču i loguju za ručni pregled.

d) **Ručna kuracija** najbitnijih 30–50 lekcija (najpopularniji openings: Sicilian Najdorf, Caro-Kann main lines, London, Italian Giuoco) — gde generator nije dovoljan, pišu se direktno sa varijacijama.

### 4. UI promene (Learn.tsx)

Vrlo male — InteractiveBoard se već renderuje uslovno. Posle ovoga, **svaka** lekcija će imati board.

- **Default mode = "explore"** za lekcije bez sekvence poteza (slobodno pomeranje figura iz date pozicije) — već postoji u InteractiveBoard.
- **"guided" mode** ostaje za lekcije sa sekvencom (klikneš ▶ i prolaziš potez po potez sa objašnjenjima).
- Dodaje se mali **"Free Explore" toggle** ako korisnik želi da pomera figure umesto da samo gleda demonstraciju.

### 5. Šta ostaje na korisniku

Zbog obima (530 lekcija), preporučujem **fazni rollout**:

| Faza | Sadržaj | Lekcije |
|------|---------|---------|
| **1** | Svi opening kursevi (Sicilian, Caro-Kann, London, English, Nimzo, French, Scandinavian, Dutch, KID) | ~148 |
| **2** | Svi endgame kursevi (rook, pawn, mastery) | ~72 |
| **3** | Core curriculum (beginner / intermediate / advanced) | ~50 |
| **4** | Tactics + Strategy + Middlegame ostatak | ~260 |

Svaka faza je jedna iteracija. Posle svake, sajt se može testirati pre sledeće.

---

## Tehnički detalji

**Fajlovi koji se menjaju:**
- `src/lib/lesson-moves.ts` — masivno proširenje (sa ~95 na 625 entries)
- `src/components/learn/InteractiveBoard.tsx` — sitno: default mode "explore" za lekcije bez sekvence; "Free Explore" toggle
- `src/pages/Learn.tsx` — uklanja se uslovno renderovanje board-a (sad uvek se prikazuje)

**Novi fajlovi:**
- `scripts/generate-lesson-boards.ts` — generator (jednokratno se pokreće, output ide u lesson-moves.ts)
- `src/lib/board-positions-library.ts` — katalog kanonskih FEN pozicija (Lucena, Philidor, opening main lines, klasični middlegame primeri)

**Bez novih dependency-ja** — koristimo postojeći `chess.js` i `react-chessboard`/custom board.

**Validacija:** generator validira sve SAN sekvence pre nego što ih ubaci. Lekcije gde generator ne uspe da napravi smislen board su markirane i izlistane na kraju za ručnu reviziju.

---

## Pitanje pre starta

**A)** Idemo sa FAZA 1 (Openings — najbitnije, korisnik ovo eksplicitno traži). 148 lekcija dobija punu opening teoriju sa varijacijama.

**B)** Idemo redom kroz sve 4 faze u jednoj iteraciji (rizik: jedna velika izmena, više šanse za greške).

**C)** Custom — biraš koje kategorije prve.

**Preporuka: A** — Openings su najveća korist (korisnik je to spomenuo prvo: "pogotovo za opening"), 148 lekcija, jedna iteracija, sajt ostaje stabilan.
