# MasterChess — "Zašto ljudi ne signupuju" Fix Plan

Dijagnoza po tvojim odgovorima:
- Sajt je **pretrpan** → casual igrač ne zna gde da klikne
- **5s rule fail** → hero ne vrišti "klikni i igraj odmah"
- **Signup deluje kao obaveza** → modal sa "500 coins + Founder badge" + countdown iskače pre nego što je čovek išta odigrao (vidi se u session replay)
- **Mobilni lag** → 4D efekti, Framer Motion, video embed, parallax — sve se mountuje na home

Strategija: **Casual igrač mora da odigra partiju za <10s bez signup-a. Signup tek POSLE prve pobede, kao reward, ne kao gate.**

---

## Sprint 1 — "5 Second Test" Home (cleanup + hook)

**Cilj:** Telefon korisnik vidi home → za 5s zna šta sajt radi → klikne i igra.

1. **Novi hero (above-fold, mobile-first):**
   - Jedna brutalna headline: *"Play Chess. Right Now. No Signup."*
   - Sub: *"Real humans. Live games. 10 seconds to your first move."*
   - **JEDNO** džinovsko CTA dugme: **▶ PLAY NOW** (vodi na `/play-guest`, već postoji)
   - Ispod, mali secondary link: "Login if you have account"
   - Live broj: *"X people playing right now"* (real, iz `online_games`/`presence`)
   - NIŠTA drugo above fold. Ni 4D pieces, ni FounderNote, ni video, ni Daily King banner.

2. **Skloni / spusti niže / lazy-load:**
   - Daily King banner → niže (posle fold)
   - DailyChess_12 video embed → posle fold, lazy mount (IntersectionObserver)
   - 4D floating pieces → **isključi na mobile** (<768px) i `prefers-reduced-motion`
   - HumanMargin scribbles → samo desktop
   - Stream Hub preview → posle fold, lazy
   - FounderNote → premestiti na `/about`, ne na home

3. **Navbar diet (mobile):**
   - Trenutno: previše stavki, color-coded submeniji
   - Novo (mobile burger): **Play / Learn / Profile / More** (samo 4)
   - "More" otvara sve ostalo (Tournaments, Battle Royale, Shop, Clubs, Stats, itd)
   - Desktop ostaje bogatiji ali sa max 5 top-level itema, ostalo u dropdownu

4. **Ubij intruzivni signup modal:**
   - "500 coins + Founder badge" countdown modal se sada otvara odmah — to BLOKIRA casual igrača
   - Pravilo: **NIKAD ne prikazivati signup modal pre nego što gost odigra bar 1 partiju**
   - Trigger: posle prve pobede gosta → "Save your win + claim 500 coins" (kontekstualno, ne random)

---

## Sprint 2 — Guest → User Funnel (0 friction signup)

**Cilj:** Od "klik na Play Now" do prvog poteza < 10s. Signup posle 1. pobede, ne pre.

1. **`/play-guest` flow refresh:**
   - Klik na PLAY NOW → odmah matchmaking sa botom (400-800 ELO, casual)
   - Bez ekrana za izbor time control, bez color picker — samo igra počne (10+0 default)
   - Gornji desni ugao: mali "Settings" za napredne

2. **Post-game signup reward (kontekstualno):**
   - Posle 1. pobede gosta: **fullscreen takeover** *"You won! Save this win to your profile + claim 500 coins"*
   - Jedno dugme: **Continue with Google** (1 click, već imaš handler)
   - Tiny link: "or email"
   - Bez "country" / "username" / "display name" — sve to se popunjava posle, progressive profile

3. **Signup forma diet (kad MORA email):**
   - Trenutna forma: email + password + country + username (+ Google country modal)
   - Novo: **samo email + password**. Username = auto generated (`Player_xxxxx`), country = auto iz IP, sve menjivo kasnije u Settings
   - Magic link kao primarna opcija (već postoji), password kao secondary

4. **Sidebar wall za zaključane feature:**
   - Umesto "moraš da se signupuješ" gate-a, gost vidi sve, ali zaključano sa *"Sign up free to unlock"* — ne blokira eksploraciju

---

## Sprint 3 — Mobile Perf (LCP < 2.5s, INP < 200ms)

1. **Baseline profile** sa `browser--performance_profile` na `/` u mobile viewport
2. **Code-split & lazy:**
   - 4D pieces, parallax, FounderNote, HumanMargin, Stream Hub, DailyChess_12 embed, Daily King banner → `React.lazy` + IntersectionObserver mount
   - Stockfish worker ne sme da se importuje na home (samo `/play/*`)
3. **`use-device-capability` hook (već postoji):** isključi sve dekorativne animacije na low-end / mobile / reduced-motion
4. **Image pipeline:** hero kao AVIF + WebP preko `vite-imagetools`, `<link rel="preload" as="image" fetchpriority="high">` za LCP
5. **Framer Motion diet:** dekorativne animacije (shimmer, glow) → CSS keyframes
6. **Realtime/presence:** subscribe odložiti za "user interacted" (scroll/click), ne na mount
7. **Fix React warning:** `fetchPriority` → `fetchpriority` na `<img>` (videim u console logs)
8. **Re-profile** posle svake izmene, dokaži brojkama

---

## Šta NE menjamo

- Sve postojeće feature i podstranice ostaju (samo se sklanjaju iz fokusa home-a)
- Nema brisanja koda, samo lazy/sakrij/spusti niže
- Brand identitet (Gold & Black, Nikola, Caveat font) ostaje — ali ne above fold

---

## Tehnički sažetak (FYI)

```text
src/pages/Index.tsx          → potpuni rewrite hero-a, lazy mount svega ispod fold
src/components/Navbar.tsx    → mobile burger: 4 itema + More
src/pages/PlayGuest.tsx      → instant matchmaking, bez setup ekrana
src/components/PostWinSignupTakeover.tsx (new) → trigger posle 1. win-a
src/pages/Signup.tsx         → samo email+password, auto username/country
+ ukloni/odloži:
  - WelcomeOfferModal (founder badge countdown) → trigger samo posle 1 game-a
  - 4D / parallax / FounderNote / HumanMargin → desktop only ili lazy
```

---

## Šta sledi

Reci samo "kreni" → idemo Sprint 1 prvo (cleanup + hero rewrite), zatim Sprint 2 (funnel), zatim Sprint 3 (perf). Možeš i da kažeš "uradi sve odmah" — biće veliki commit ali sve odjednom.
