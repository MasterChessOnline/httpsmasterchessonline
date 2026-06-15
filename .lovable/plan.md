## Šta menjam

### 1. Skidam "Knock / Door" dugme
`TheDoorButton` simulira pronalaženje sagovornika sa `setTimeout` i lažnim imenom (`ChessFriend_###`) — to je čista fejk-engagement što krši core pravilo projekta (zero fake activity). Pored toga je vizuelno suvišan plutajući bottom-right element.

- Uklanjam `<TheDoorButton />` mount iz `src/App.tsx` (linija 348) i import (linija 150).
- Brišem fajl `src/components/TheDoorButton.tsx`.

### 2. Donation traka na vrh homepage-a
Pravim novu kompaktnu komponentu `src/components/HomeDonationTopStrip.tsx` koja se montira u `src/pages/Index.tsx` **iznad** `<Navbar />` i hero sekcije (tj. iznad "MasterChess" naslova). Postoji samo na `/`, ne globalno — da ne smeta na ostalim stranicama.

**Sadržaj trake** (jedan red, gold akcenat):
- 💛 Mini progress bar (koristi postojeći `useDonationProgress` hook → `$X od $100`).
- Kratak tekst: "Support MasterChess" + procenat.
- Primary CTA dugme "Donate" → vodi na `/supporter`.
- Mali ✕ za sklanjanje na 7 dana (localStorage `mc:donate-top:dismissed-until`).

**Responsive ponašanje:**
- Desktop (≥640px): jedan red — tekst levo, progress u sredini, dugme desno.
- Mobile (<640px): kompaktan layout — `[💛 38% • $38/100]  [Donate →]` u jednom redu, bez wrap; tekst se skraćuje.
- Visina ≤ 44px na mobilu, ≤ 40px na desktopu — neće gurati hero.
- Sticky? Ne. Statičan na vrhu da bude "iznad natpisa" kako je traženo. Navbar ostaje sticky kao i do sad.

**Stil:** crno staklo + zlatna ivica/akcenat (koristim postojeće `--primary` tokene i `border-primary/30 bg-card/60 backdrop-blur`) — uklapa se u Gold & Black 4D bez novih boja.

### 3. Bez backend / business logic promena
- Stripe, RPC `get_donation_progress`, donation flow — ništa se ne dira.
- Nema novih ruta, edge funkcija, ni migracija.

## Tehnički detalji

**Files:**
- ✏️ `src/App.tsx` — ukloniti import + mount `TheDoorButton`.
- 🗑️ `src/components/TheDoorButton.tsx` — obrisati.
- ➕ `src/components/HomeDonationTopStrip.tsx` — nova komponenta.
- ✏️ `src/pages/Index.tsx` — montirati `<HomeDonationTopStrip />` kao prvi child u root fragmentu, pre `<Navbar />`.

**Dismiss logika:**
```ts
const KEY = "mc:donate-top:dismissed-until";
const until = Number(localStorage.getItem(KEY) || 0);
if (Date.now() < until) return null;
// on dismiss: localStorage.setItem(KEY, String(Date.now() + 7*864e5));
```

**Hide kad je cilj ispunjen:** ako `pct >= 100`, sakrij traku (cilj postignut → ne davimo posetioca).
