## Šta menjam

### 1. Learn sekcija
- **Fundamentals**: trajno brišem `Openings` kategoriju (već uklonjeno iz UI, sad i iz `categories` izvora i bilo kakvih ostataka u `Learn.tsx` / `courses-data.ts`).
- **Training tab u Learn**: ostaju SAMO training zadaci (Lichess puzzle engine) — uklanjam sve lekcije/kurseve iz tog taba i vodim direktno u `/training` stream.
- **MasterKursevi (svih 7)**: prepravljam tako da svaka varijanta radi kao Jobava London — interaktivna tabla, potezi se prikazuju jedan po jedan, korisnik povlači potez na tabli i tabla je 1:1 sinhronizovana sa SAN listom (kao mini-partija). Otklanjam bagove sa drag-input u Guided modu.

> Napomena: za 5 preostalih kurseva (Najdorf, Caro-Kann, Queen's Gambit, Ruy Lopez, King's Indian) trenutno koristim AI-generisane linije jer mi nisi poslao tvoje varijante za njih. Mehanika će raditi identično kao Jobava — čim mi pošalješ varijante, samo ih ubacim u `courses-data.ts` (jl-1…jl-100 format).

### 2. Welcome intro (forsirano login/signup)
- Brišem stari `WelcomeIntroPopup` (koji se pojavljivao samo posle login-a).
- Novi **AuthGate**: čim neko otvori sajt bez sesije, prikazuje se full-screen welcome sa dva CTA: **Sign up** ili **Log in**. Bez prijave ne mogu se otvoriti glavne stranice (osim `/login`, `/signup`, `/about`, `/privacy`, `/terms`).
- **Continue with Google flow**: pre OAuth poziva otvara se mali modal koji traži:
  1. **Country** (dropdown sa zastavama iz `countries.ts`)
  2. **Profile name**
  Tek nakon submit-a poziva se `lovable.auth.signInWithOAuth("google")`. Country + display_name se snimaju u `pending` localStorage ključ i upisuju u `profiles` tabelu odmah po povratku iz OAuth-a.

### 3. Training (homepage CTA + nova /training mehanika)
Tri moda u `/training`:
- **Classic** (postojeći stream)
- **Time Attack**: 5 minuta, max 3 greške → stop, prikaz score-a, dugme Restart.
- **Survival**: neograničeno vreme, max 3 greške → stop.

Dodajem:
- Streak counter + **Best score** vidljivi u headeru (već postoji `useTrainingStreak`, dodajem `bestScore` po modu).
- **"New Record!"** achievement toast (full-screen overlay sa konfetama) kad oboriš best.
- **Achievement toast sistem** koji se okida i na drugim milestone-ima (5/10/25/50 streak, prvi mate-in-3, itd.).

Dodatne teške puzle: ubacujem novi shard **`lichess-puzzles-hard.json`** sa Lichess puzzle API filterom `rating>=2400` + theme `mate`/`endgame` (~200 dodatnih). Loader spaja oba fajla.

### 4. Sajt prebačen na "play-first" ton
- Homepage hero menja CTA hijerarhiju: **"Play vs Bots"** i **"Play Online"** kao primarni gold gradient dugmadi, **"Learn"** sekundarno (manje, niže).
- `FeaturesSection` reordering: bot personalities + online multiplayer prvi, edukacija ispod.
- `WhyChooseUsSection` copy update — naglasak na "real games, real ratings" umesto na lekcije.

### 5. Mobile polish
- MasterKurs interaktivna tabla: tap-to-move radi, board scale `min(100vw-24px, 480px)`.
- Welcome AuthGate na mobilnom: full-bleed sa stack-ovanim dugmadima.
- Training mode selector: horizontalno scroll-uje na <420px.

## Tehnički koraci
1. `src/components/AuthGate.tsx` (novo) + integracija u `App.tsx` (zamenjuje `WelcomeIntroPopup`).
2. `src/components/auth/GoogleCountryNameModal.tsx` (novo) — koristi se na Login i Signup stranicama.
3. `src/pages/Learn.tsx` — Training tab čisti (samo puzzle CTA), Fundamentals izvor bez Openings.
4. `src/components/learn/InteractiveBoard.tsx` — popravka drag/tap u Guided modu, board orientation = boja kursa (već delom radi).
5. `src/pages/Training.tsx` — mode selector (Classic / Time Attack / Survival), best score per-mode u localStorage, achievement toast.
6. `src/components/training/AchievementToast.tsx` (novo) + `src/lib/training-achievements.ts`.
7. `public/data/lichess-puzzles-hard.json` (novo, ~200 pozicija) + update `lichess-puzzles.ts` loader-a.
8. `src/components/HeroSection.tsx` + `FeaturesSection.tsx` — play-first reordering.
9. Profile insert posle Google OAuth — handler u `Login.tsx` proverava `pending` ključ i radi `profiles.update`.

## Šta NE diram
- Postojeći Jobava London i Kalashnikov sadržaj (već 1:1 tvoje varijante).
- Auth provider konfiguracija (Google već radi preko Lovable Cloud).
- Edge funkcije, Supabase šema (osim `profiles.country` koje verovatno već postoji — proverim).
