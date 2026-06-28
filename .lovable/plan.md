## 1. Vrati sajtu boje — "polychrome" izgled, bez switcher-a

Sajt trenutno deluje crno jer `live` tema koristi samo zlato na tamnoj podlozi. Dodajem **bojom-zonirane sekcije** tako da svaka oblast ima svoju dominantnu boju iz 5-bojne palete (zlato / safir / smaragd / korala / ljubičasta), ali sve i dalje deluje kao jedan sajt.

- `src/index.css` (`data-site-theme="live"`) — proširiti tokene: dodajem `--zone-play`, `--zone-learn`, `--zone-tourney`, `--zone-community`, `--zone-news` (svaka boja + glow varijanta).
- **Navbar** dobija obojene "taby": Play (safir), Learn (smaragd), Tournaments (zlato), Community (korala), News (ljubičasta) — boja se vidi kao tanka linija ispod stavke i kao hover halo.
- **Hero/Home**: gradient blobs u 5 boja iza headera umesto čisto crne pozadine; suptilan film-grain ostaje.
- **Stranice kao "obojeni svet"**: svaka top-level ruta dobija svoj `data-zone` na `<main>` koji obojuje akcente, badge-ove, dividers i kartice u svojoj boji (CTA dugmad i dalje zlatna radi konzistencije brenda).
- **Footer**: 5 vertikalnih kolona, svaka sa tankom obojenom linijom na vrhu — vizuelni potpis "5 boja".
- **Kartice**: dodajem suptilan dijagonalni "felt" pattern + colored top-border po zoni. Bez novih biblioteka.

Cilj: kad otvoriš sajt vidiš ZLATO + SAFIR + SMARAGD + KORALU + LJUBIČASTU u prvih 2 sekunde, ne samo crno.

## 2. FIDE ID auto-fill koji stvarno radi

Trenutni `fide-lookup` postoji ali na `TournamentRegister.tsx` UI je nezgrapan i ne reaguje dok ne klikneš "Find me". Pravim "tip-to-find":

- **Debounced auto-lookup**: čim ukucaš 5+ cifara (npr. `9218275`) u FIDE polje, posle 600 ms automatski poziva `fide-lookup` i popunjava ime, federaciju, titulu, godinu rođenja. Bez klika.
- **Vizuelni feedback**: spinner u inputu, pa zelena kvačica + "Found: Sakotić, Nikola · SRB" inline.
- **FIDE ID je opcionalan**: ako korisnik ne želi da ga unese, samo popuni ručno First/Last name i registracija prolazi. Tekst ispod polja: "Optional — speeds up registration and unlocks official Chess-Results listing."
- **Hardening `fide-lookup`** edge funkcije: cache 24h u memoriji, bolji parsing kad FIDE vrati prazno (fallback na `players.aspx` HTML), CORS retry, da ne pukne na ID-jevima kao tvoj.

## 3. Instagram turnir invite link — set ideja

Pravim **`/ig`** landing + **deep-share** sistem specifično za IG publiku:

- **`/ig/db-cup`** (nova ruta) — mobile-first, full-bleed, jedan CTA "Register in 30s". Ispod: tvoj video/foto, countdown, prize tier u Master Coins, social proof ("X igrača prijavljeno").
- **IG Story link generator** u `InviteShareCard.tsx`: dugme "Copy IG bio link" koje pravi kratki `masterchess.live/i/ABC123` + automatski dodaje UTM `?utm_source=ig&utm_medium=bio`. Tracking u `affiliate_clicks`.
- **Auto-generisana "shareable card"** (PNG) preko postojećeg `og-board-image` patterna: igračevo ime + invite code + QR + datum turnira. Dugme "Download for Story" → snima 1080×1920 PNG koji se direktno postuje na IG Story.
- **Reels hook**: 3 spremna teksta u `docs/MARKETING_POSTS.md` ("POV: igraš u srpskom blitz turniru s 64+ igrača…") + link u biou pokazuje na `/ig/db-cup`.
- **Captain badge mehanika** (već postoji u `InviteShareCard`): 3 prijave preko tvog linka = besplatan ulaz u sledeći turnir + zlatni "Captain" badge na profilu — to je glavna IG fora.

## 4. Bonus ideje (kratko, mogu da ubacim u isti build)

- **Live broj prijavljenih** na DB Cup landing-u u realnom vremenu (Supabase Realtime na `tournament_registrations`) — "47 / 500" tikta gore, pokreće FOMO.
- **"Who's in?"** strip ispod CTA: avatari poslednjih 8 prijavljenih + njihove federacije/titule. Vizuelno dokazuje da turnir nije prazan.
- **Mini quiz na `/ig/db-cup`**: "Pogodi sledeći potez Magnus-a" → posle 1 puzzle-a otvori se forma za registraciju. Konverzija ↑.

## Tehnički sažetak

- `src/index.css` — novi tokeni za 5 zona + obojeni footer pillars.
- `src/components/Navbar.tsx` (+ mobile bottom bar) — `data-zone` po linku, obojene underline trake.
- `src/App.tsx` ili layout — dodaje `data-zone` atribut na `<main>` na osnovu rute.
- `src/pages/TournamentRegister.tsx` — debounced auto-lookup, opcionalan FIDE ID, bolji UX status indikatori.
- `supabase/functions/fide-lookup/index.ts` — robusniji parser + in-memory cache.
- `src/pages/IgDbCup.tsx` (nova ruta `/ig/db-cup`) — mobile-first landing.
- `src/components/db-cup/InviteShareCard.tsx` — "Download IG Story PNG" + "Copy IG bio link".
- `src/lib/og-board-image.ts` — ekstenzija za 1080×1920 invite card.

## Pitanje pre nego što krenem

Da li hoćeš da glavni naglasak prvog build-a bude **(A) Bojanje sajta + FIDE auto-fill** (vizuelni "wow" + funkcija koju si tražio), ili **(B) sve odjednom uključujući IG landing i Story PNG generator**? Opcija B je 2× više koda ali kompletno za marketing kampanju.
