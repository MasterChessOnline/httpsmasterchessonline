## Dijagnoza — zašto 10k poseta = 0 prijava

Instagram saobraćaj je 95%+ mobilni, brzo skroluje, dolazi "u prolazu". Trenutni MasterChess landing traži od posetioca da **odluči, klikne CTA, otvori signup, popuni email + password + display name + starting level** pre nego što išta vidi. To je 5+ koraka friction. Drugi problemi koje sam našao:

1. **Nema "Play instantly" guest moda** — posetilac mora da napravi nalog da bi probao igru. Konkurencija (chess.com, lichess) pušta gosta odmah na šahovsku tablu.
2. **Hero ne pokazuje proizvod** — slika + tekst, ali nema žive table ili 5-sekundnog demoa. Mobilni korisnik ne razume šta dobija.
3. **Signup forma traži 4 polja** (email, password, ime, level) — svaki dodatni field obara conversion ~7%. Google login postoji ali nije dovoljno istaknut.
4. **IG-specific landing ne postoji** — svi linkovi vode na `/` koji je pretrpan (DailyMissions, SpinWheel, LiveActivityFeed, TestimonialsCarousel, Manifesto, WallOfReasons, FounderNote, StickyJoinBar). Mobilno = spor, težak za parsiranje.
5. **Nema mernih signala** — ne znamo gde tačno odustaju (hero, scroll, signup forma). Bez funela letimo na slepo.
6. **`?ref=` tracker postoji** ali nema link-in-bio sa eksplicitnim incentivom ("100 coins + special badge ako se registruješ preko @dailychess_12").

## Plan — 6 ciljanih popravki

### 1. Guest "Play Now" mod (najveći impact)
Dodaj **`/play-guest` rutu**: posetilac odmah pada na šahovsku tablu protiv bota (Easy 800). Posle prve pobede/poraza appear soft prompt: *"Sačuvaj progress i osvoji 200 coins → 1-click Google signup"*. Nema email forme.

- Reuse `BotProfile.tsx` / `bot-engine` logiku, samo bez auth wrappera.
- Posle 1 odigrane partije: modal sa **jednim** Google dugmetom + "Continue as guest".
- localStorage čuva guest rating dok se ne uloguje, onda merge u profil.

### 2. Mobile-first IG landing `/ig` (ili `/start`)
Posebna minimalna stranica za Instagram bio link:

```text
┌──────────────────────────┐
│  [Live mini šah board]   │  ← animira poslednje 3 partije
│                          │
│  Play chess. No ads.     │  ← H1, 6 reči
│  100% human players.     │
│                          │
│  [▶ PLAY NOW] ← big      │  ← vodi na /play-guest
│  [G] Continue with Google│
│                          │
│  ★★★★★ 1,247 igrača      │
└──────────────────────────┘
```

Bez Navbara, bez Footera, bez Daily Missions — samo jedan ekran, jedan CTA. Cilj: <2s LCP, 1 odluka.

### 3. Skrati signup formu na 1 polje
Trenutno: email, password, displayName, startingLevel = 4 polja.
Novo:
- **Default**: samo Google dugme (veliko, prvo).
- "Or email" toggle otkriva **samo email + password** (display_name auto-generisan iz emaila, level postavljen na default 1200, kasnije menja u Settings).
- Starting level slider premešten u onboarding posle prve partije.

### 4. Hero sa živim demoom umesto static slike
Zameni `heroImage` sa **autoplay loop** poslednje brze partije iz `online_games` (PGN replay, 1 potez/sec). Pokazuje da je sajt živ. Format: ~300px visine, ispod odmah CTA.

### 5. Analytics funel za IG saobraćaj
Doda 4 event-tracking tačke u `referrals` ili novu `funnel_events` tabelu:
- `landing_view` (sa ref kodom)
- `cta_click` (Play Now / Sign Up)
- `signup_start` (otvorio formu)
- `signup_complete`

Onda imaš pravu sliku — možda 9000 odlazi na heru, možda 800 klikne CTA i odustane na signup formi. Bez ovog popravljamo na slepo.

### 6. IG-specific incentive
Generiši **link `masterchess.live/?ref=IG&bonus=ig100`** koji:
- Pokazuje banner: *"@dailychess_12 te poklanja 100 coins + Instagram Founder badge"*
- Auto-aplicira bonus na prvi signup (kroz postojeći referral RPC, doda se badge insert)
- Stavi taj link u IG bio sa "swipe up" pričom

## Tehnički detalji

- **`/play-guest`**: nova ruta, lazy-loaded, koristi postojeći `bot-engine.ts`. Bez `useAuth` poziva.
- **`/ig` landing**: jedna komponenta, ne učitava DailyMissions/SpinWheel/Manifesto chunk. Vite lazy import samo neophodnog.
- **Signup form refactor**: postojeća `Signup.tsx`, sakrij naprednu sekciju iza `<details>` accordion.
- **Funnel tabela**: `funnel_events (id, event_type, ref_code, session_fp, user_id nullable, created_at)`, owner-only INSERT preko RPC-a. Anon write dozvoljen jer prati anonimne posete.
- **Hero replay**: SSR-friendly, učitava 1 partiju iz `online_games` (već ima RLS public read jer su online_games čisto za gledanje preko Spectate).
- **IG badge**: dodaje se u `player_badges` kao `instagram_founder` kad ref=IG.

## Šta NE radimo u ovoj iteraciji

- Ne menjamo glavni `/` landing dramatično (postoji veliki rad oko Manifesto / FounderNote / Human Soul Layer — to ostaje za logovane).
- Ne diramo postojeću ekonomiju coin-a (samo +100 IG bonus kao referral reward).
- Ne dodajemo nove auth provajdere.

## Očekivani rezultat

Conversion rate sa ~0% na 3–8% na IG saobraćaju (industrijski prosek za gaming landing sa instant play je 5–12%). Od 10k poseta = 300–800 novih naloga umesto 0.

Reci mi koje od ovih 6 popravki da implementiram prvo, ili "uradi sve" da krenem redom (preporučujem #1 Guest Play + #2 IG landing + #3 skraćena forma kao prvi paket — to su 80% impacta).
