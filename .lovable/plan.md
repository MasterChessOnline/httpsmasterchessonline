
# Plan: Dati MasterChess-u dušu

Cilj: sajt da se **oseti živo** prvih 5 sekundi i da svaka partija ima emocionalni vrhunac. Bez novih stranica, bez novih feature-a — samo poliranje + zvuk + cinematic momenti.

---

## 1. Tihi, elegantni audio sloj

Suptilan zvuk koji **dodaje, ne smeta**. Sve može da se ugasi iz Settings → Sound (default uključeno, tiho na 30%).

Zvuci koje uvodimo:
- **Move** — meki "tap" drvene figure (kratko, < 100ms)
- **Capture** — nešto teži udarac
- **Check** — suptilan zlatni "ding"
- **Checkmate / pobeda** — kratka cinematic fanfara (2s, ne više)
- **Poraz** — tihi minor akord
- **Hover na CTA dugme (Play, Install App)** — jedva čujan klik
- **Notification (rival pronađen, izazov)** — meki gong

Implementacija:
- Generišemo SFX preko ElevenLabs API (Edge function) jednom, kešujemo kao `.mp3` fajlove u `public/sounds/`
- `useSound()` hook sa globalnim volume controlom + master mute u Settings
- `localStorage` čuva preference, podrazumevano: volume 30%, muted=false
- Prvi put ulazak: tihi welcome chime (1.5s) **samo na prvom učitavanju ikad**, pa nikad više

## 2. Jači prvi utisak (homepage hero)

Trenutno: korisnik vidi puno informacija, ali ne **oseća** zašto je MasterChess poseban.

Promene u hero sekciji:
- **Velika headline animacija**: jedna jaka rečenica koja se ispisuje slovo-po-slovo prvih 0.8s ("Šah. Bez asistenta. Bez varanja. Samo igrači.")
- **Subline ispod**: jedna mirna linija sa key brojkama (X partija danas, X aktivnih igrača — samo ako su brojke realne)
- **Cinematic 3D scena**: 2-3 figure koje **lebde tiho** sa parallax-om na pokret miša (već ima 4D Visual Mode — pojačati ovde)
- **Glavni CTA "Play Now"** dobija jedan jak gold pulse svake ~4s (ne stalno)
- **Install App** ostaje gde jeste, ali manje agresivan u hero-u
- Hero visina: zauzima ~85vh tako da prvi utisak nije pretrpan — sve ostalo je "ispod fold-a"

Klar hijerarhija: **jedan H1, jedan glavni CTA, jedan secondary**. Ostalo se vidi kad skroluje.

## 3. Cinematic momenti pobede / mata

Ovo je gde "duša" najviše dolazi. Trenutno game-over je verovatno tekstualni modal.

Novi flow nakon pobede (3-4s):
1. Tabla blago **dim-uje** osim mat-figure (spotlight efekat)
2. Mat figura dobija zlatni glow + lagani spin
3. Cinematic fanfara (2s)
4. Fullscreen overlay sa zlatnom particle erupcijom (Framer Motion + canvas confetti)
5. "VICTORY" tekst koji se ispisuje masivnim display fontom
6. ELO change pokazan sa **count-up animacijom** (1450 → 1462, broji uživo)
7. Tek tada se pojavljuju dugmad (Rematch, Review, Share Moment)

Za poraz: kraći, dostojanstven — sivi overlay, "Defeat" u manjem fontu, tihi akord, fokus odmah na "Review".

Za draw: neutralno, plavi accent.

## 4. Sitne UX cake (micro-delights)

Stvari koje korisnik ne registruje svesno ali oseti:
- **Hover na figure** u tabli: jedva primetan zlatni outline + 1px lift
- **Loading states**: zameniti spinner-e sa **animiranim figurama** (peška koji "korača")
- **Empty states**: kratka rečenica + ilustracija figure (ne "No data found")
- **Toast notifikacije**: subtilni slide-in sa zvonom ako je tihi mode dozvoljen
- **Page transitions**: 200ms crossfade umesto hard cut između stranica

## 5. Mali "potpis" autora na footer-u

Tihi, ne previše uočljiv potpis koji daje sajtu **lični identitet**:
- "Made with passion · MasterChess 2026"
- Mali zlatni kralj ikonica koja se rotira na hover
- Link ka About / Manifesto stranici (ako želiš da napravimo i jednostavnu "Why MasterChess" stranicu kasnije)

---

## Tehnički detalji

- **Audio**: `<audio>` HTML elementi + `Howler.js` (lightweight) ili native Web Audio API; ElevenLabs Edge function za inicijalnu generaciju, fajlovi kešovani u `public/sounds/`
- **Settings store**: proširiti postojeći `localStorage` settings sa `audio: { enabled, volume, moveSound, victorySound }`
- **Particle erupcija**: `canvas-confetti` library (lagan, 8kb)
- **Count-up za ELO**: jednostavan custom hook sa `requestAnimationFrame`
- **Hero refactor**: izmena postojeće Hero komponente, bez dodavanja novih stranica
- **Game-over overlay**: nova `<VictoryOverlay />` / `<DefeatOverlay />` komponenta koja se zove iz postojeće game-state logike

Bez novih ruta, bez novih tabela u bazi, bez novih biblioteka osim `canvas-confetti` i jedne ElevenLabs Edge function za inicijalnu generaciju SFX-a.

---

## Šta NE radim u ovom planu

- ❌ Native mobilna aplikacija (Capacitor) — odložiti dok ne budeš spreman za App Store
- ❌ Novi feature-i (puzzles, novi modovi, novi alati)
- ❌ Promena postojećih stranica osim homepage hero-a
- ❌ Ambijentalni soundtrack — previše agresivno za šah

---

## Predloženi redosled implementacije

1. **Audio sistem + Settings toggle** (osnov za sve ostalo)
2. **Cinematic Victory / Defeat overlay** (najveći emocionalni impact)
3. **Hero redesign** (jači prvi utisak)
4. **Micro-delights** (hover, loading, empty states)
5. **Footer potpis**

Ako ti se sviđa pravac, klikni Implement i krećemo od koraka 1.
