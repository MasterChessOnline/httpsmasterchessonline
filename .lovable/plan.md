
# MasterChess — Design Perfection Plan

Cilj: zadržati prepoznatljivi **Gold & Black 4D** identitet, ali ga podići u ligu **Linear / Arc / Apple / Vercel** — manje "gaming reklama", više "premium product".

Ovaj plan je organizovan po fazama. Svaka faza je zasebna iteracija (može se pauzirati između).

---

## FAZA 1 — Visual Foundation (osnova svega)

### 1.1 Slojevita dark paleta
Trenutno: jedna skoro-crna boja svuda → ravno, bez dubine.

Promena u `src/index.css`:
```
--background:   24 10% 5%   (page — najtamnija)
--card:         28 9%  8%   (kartica — uzdiže se)
--popover:      30 10% 11%  (najsvetlija — najbliža korisniku)
--muted:        28 8%  14%
--border:       38 15% 16%  (suptilnije, manje gold-tinted)
```
Rezultat: dubina bez dodatnih shadow-a.

### 1.2 Smanjenje glow-a za 30–40%
- `--shadow-neon` opacity sa 0.15 → 0.08
- `--shadow-neon-lg` opacity sa 0.2 → 0.12
- `.btn-neon` glow samo na hover/focus, ne u idle stanju
- `.glass-neon` border opacity 0.12 → 0.06
- `.shimmer` animacija samo na hero/featured elementima, ne globalno

Rezultat: gold ostaje signature, ali kao **akcenat**, ne kao default stanje.

### 1.3 Tipografska hijerarhija
- H1, H2 → ostaju Orbitron (signature)
- H3, H4 → menjaju u Inter Bold (čitljivije)
- Brojevi (rating, ELO, timer, statistike) → dodajemo **JetBrains Mono** kao `--font-mono`
- Body line-height sa 1.5 → 1.6 (bolji ritam čitanja)

### 1.4 Border radius konzistentnost
- Cards: `rounded-xl` (12px) svuda
- Buttons: `rounded-lg` (10px)
- Inputs: `rounded-lg`
- Pill badges: `rounded-full`

---

## FAZA 2 — Command Palette (⌘K)

Najveći UX win za sajt sa 51 stranicom.

- Globalni shortcut: `Cmd/Ctrl + K`
- Iskače centrirani modal (glass-4d, blur backdrop)
- Fuzzy search kroz:
  - Sve stranice (Play, Learn, Profile, Settings, …)
  - Brze akcije ("Start bullet game", "Open Sicilian", "View leaderboard")
  - Korisnike (search po nicku)
  - Bot personalities
- Keyboard navigacija (↑↓ Enter Esc)
- Recent searches sačuvane u localStorage
- "?" tooltip u navbar-u koji podseća na shortcut

Komponenta: `src/components/CommandPalette.tsx` (koristi `cmdk` lib).

---

## FAZA 3 — Homepage Bento Grid

Trenutno: vertikalni stack sekcija → liči na blog.
Posle: **Bento dashboard** kao moderne premium app (Linear, Arc, Things 3).

Layout (12-col grid, desktop):

```text
┌─────────────────┬───────────┬───────────┐
│  HERO / Quick   │  Streak   │   Live    │
│  Play (6 col)   │  (3 col)  │  Stream   │
│                 │           │  (3 col)  │
├──────┬──────────┼───────────┴───────────┤
│ Last │  Daily   │   Top Rival (today)   │
│ Game │ Missions │      (6 col)          │
│ (3)  │   (3)    │                       │
├──────┴──────────┼───────────────────────┤
│   Leaderboard   │  Continue Lesson      │
│   Snapshot      │  (6 col)              │
│   (6 col)       │                       │
└─────────────────┴───────────────────────┘
```

- Svaka kartica: `glass-neon`, hover lift, klik vodi na full page
- Mobile: sve karte stack-uju (jedna ispod druge)
- Sve karte su **prave podatke driven** (nema fake brojeva — poštujemo postojeću politiku)

---

## FAZA 4 — Page Transitions & Micro-interactions

### 4.1 Page transitions
- Wrapper u `App.tsx` sa Framer Motion `AnimatePresence`
- Transition: `fade + 8px slide up`, 250ms, ease-out
- Daje SPA feel (kao Linear, Notion)

### 4.2 Button refinements
- Inner gradient: suptilan top-to-bottom (1% lighter → 1% darker)
- 1px gold top-edge highlight (samo na primary CTA)
- Ripple efekt ostaje, ali tiše (opacity 0.15 umesto 0.3)
- Active state: scale(0.97) + 50ms

### 4.3 Input/Form refinements
- Focus state: animirani gold underline (kao Stripe checkout)
- Floating label pattern za auth/signup forme
- Validation: ikona checkmark/X sa scale-in animacijom

### 4.4 Loading states
- Generic spinner → **rotirajući chess piece** (king ili knight SVG, 360° loop)
- Skeleton loaders: shimmer u gold tonu (umesto sivog)
- Empty states: kratka poruka + suggestion button (npr. "No games yet → Play your first game")

---

## FAZA 5 — Navigation Refinement

### 5.1 Navbar polish
- Visina: konzistentna 64px (umesto trenutne shrinking)
- Active state: gold underline ispod stavke (umesto background fill)
- Dropdown panels: smanjiti padding, bolji vertical rhythm
- Search ikona → otvara Command Palette (umesto posebnog search-a)

### 5.2 Footer redesign
- 3-kolona: Product / Community / Legal
- Mini logo + tagline
- Social linkovi (YouTube, Discord, X)
- Suptilan top border sa gold gradient

---

## FAZA 6 — Brand Touches

### 6.1 Logo system
- Animirani crown logo u navbar-u (suptilan shimmer svakih 8s)
- Loading screen: centriran logo + thin progress ring

### 6.2 Iconography konzistentnost
- Sve lucide ikone: `strokeWidth={1.5}` (umesto default 2)
- Custom chess piece ikone (king, queen, knight) za chess-specific akcije
- Veličine: 16px (inline), 20px (buttons), 24px (cards), 32px (hero)

### 6.3 Color accent system po sekciji
Ostaje postojeći (Play=blue, Learn=purple, Compete=gold, Community=green) ali:
- Smanjiti zasićenost za 20%
- Koristi se samo na badges, active states, accent borders — ne na pozadinama

---

## Tehnički detalji (za implementaciju)

**Fajlovi koji se menjaju:**
- `src/index.css` — paleta, glow tokens, tipografija, radius
- `tailwind.config.ts` — `fontFamily.mono`, color tokens
- `src/App.tsx` — `AnimatePresence` wrapper, CommandPalette mount
- `src/pages/Index.tsx` — Bento grid layout
- `src/components/Navbar.tsx` — active state, search → Cmd+K
- `src/components/Footer.tsx` — 3-kolona redesign
- `src/components/ui/button.tsx` — inner gradient + edge highlight
- `src/components/ui/input.tsx` — focus underline

**Nove komponente:**
- `src/components/CommandPalette.tsx`
- `src/components/PageTransition.tsx`
- `src/components/ChessLoader.tsx` (rotirajući piece)
- `src/components/EmptyState.tsx` (reusable)

**Nova zavisnost:**
- `cmdk` (za Command Palette — već u shadcn)

**Šta se NE menja:**
- Gold & Black brand identitet
- Orbitron za H1/H2
- 4D parallax / cursor glow
- Glassmorphism filozofija
- Sva postojeća funkcionalnost (samo vizuelno polish)

---

## Predloženi redosled iteracija

| Iter | Sadržaj | Zašto |
|------|---------|-------|
| **1** | FAZA 1 + FAZA 2 | Najveća vizuelna promena + UX win za 51 stranicu |
| **2** | FAZA 3 (Bento) | Homepage je prva stvar koju nove posetioci vide |
| **3** | FAZA 4 (transitions + micro) | Polishing — pretvara "dobro" u "premium" |
| **4** | FAZA 5 + 6 | Final brand touches |

---

## Pitanje pre starta

Da li želiš:

**A)** Sve faze redom (4 iteracije, najtemeljitije)
**B)** Samo Iteracija 1 (FAZA 1+2 — najveći ROI, vidiš odmah razliku)
**C)** Custom kombinacija — reci koje faze biraš

Preporučujem **B** — krenemo sa fundamentom + Command Palette. Ako se svidi, nastavljamo na Bento i dalje.
