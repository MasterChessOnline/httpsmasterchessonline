# Plan da MasterChess eksplodira — brzi, konkretni potezi

Sortiran po **ROI / brzini**. Možeš mi reći "uradi 1, 3, 5" pa krećem.

---

## 1. Programmatic SEO — 500+ stranica iz baze (najveći ROI)

Generiši automatski landing strane iz već postojećih podataka. Svaka stranica = nova prilika u Google-u.

- **`/openings/:slug`** — po stranica za svako otvaranje iz `openings-data.ts` (Italian Game, Sicilian Najdorf, KID...) sa: PGN viewer, statistika, top potezi, varijacije. Targetira "italian game opening", "sicilian najdorf moves", itd.
- **`/players/:username`** — javni profili svih registrovanih igrača sa partijama i ratingom. Targetira pretrage po imenu igrača.
- **`/games/:id`** — svaka odigrana partija dobija public URL sa PGN-om i Stockfish review-om. Ovo je kako se chess.com i Lichess raširili.
- **`/bots/:slug`** — landing po botu (9 botova × ~3000 mesečnih pretraga "play chess vs computer").

**Rezultat:** sa ~100 ručno napisanih stranica skočiš na 1000+ indeksiranih.

---

## 2. Viralni share alati (bez signup-a)

Stranice koje ljudi prirodno share-uju.

- **"Share your last game" kartica** — slika za Instagram/X sa rezultatom, accuracy %, opening, opponent rating. Auto-generated OG image preko edge funkcije.
- **"My Chess Year"** — godišnji wrap-up tipa Spotify Wrapped (broj partija, omiljeno otvaranje, najbolja partija). Najmanje 1 viralni potez godišnje.
- **Chess Card** (već postoji) — dodaj javan link i ćaskanje preko OG slike.

---

## 3. Reddit + YouTube SEO blitz (besplatan saobraćaj sutra)

- **Reddit:** posting plan za r/chess, r/chessbeginners, r/AnarchyChess sa autentičnim sadržajem (ne spam). 1 post = 5k–50k pregleda.
- **Pisani guideovi koji već postoje** sad treba videom — kratki Shorts (60s) od svakog članka. DailyChess_12 može hostovati, ti samo embedduješ u Blog.
- **"Tools" stranice** koje rangiraju lako: PGN viewer, FEN editor, opening explorer, rating calculator — svi targetiraju long-tail.

---

## 4. Indexing API + automatska submit-acija

Sad kad imam GSC pristup, mogu da auto-šaljem URL-ove kad se dodaju (samo job/jobs, ali korisno za nove blog članke). Plus:

- **`<lastmod>`** ažuriran pri svakoj promeni → Google brže refetchuje.
- **Internal linking audit** — svaki članak treba 3–5 linkova na druge članke (sad ima 2–3).
- **Bing Webmaster Tools** registracija — 5% dodatnog saobraćaja besplatno.

---

## 5. Push notifikacije + email loop (retencija)

Da posetioci ne odu i ne vrate se nikad.

- **Web push** — "Your daily puzzle... ups, sorry — your daily game is waiting" (uz to što već imamo daily streak).
- **Welcome email serija** (3 emaila kroz Lovable Email): dan 1 — kako napredovati, dan 3 — challenge prijatelja, dan 7 — turnir.
- **Inactive user re-engagement** — auto email posle 7 dana neaktivnosti.

---

## 6. Reference program (zaprljaj geometrijski rast)

- **Pozovi prijatelja** → obojica dobijaju badge "Pioneer" + 100 XP.
- Public leaderboard top referrera mesečno.
- **Embed widget** — "play chess on my site" iframe koji svaki streamer/blog može da stavi, sa MasterChess brendiranjem na dnu.

---

## 7. Vizuelni "wow" momenat na homepage (prvi utisak)

- Hero animacija sa 3D pločom koja se sama igra (chess.js + light Stockfish, lazy-loaded).
- Live "playing now" counter (autentičan — ne lažan) i live partija u pozadini.
- "Beat the bot in 60s" — instant gameplay bez signup-a, captures email kasnije.

---

## 8. Pricing/premium (kad već imaš protok)

Ne sada, ali planiraj za mesec 2:
- **Free**: sve što sad imaš.
- **Pro $4.99/mo**: advanced analytics, neograničene PGN study lekcije, exclusive bot personalities, ad-free.

---

## Šta predlažem da uradimo **odmah, danas**:

**Phase 1 (3–4 sata rada moja):**
1. Programmatic stranice za 30 najvažnijih otvaranja (`/openings/:slug`) → +30 indeksiranih
2. Reddit-ready share card sa OG image generator-om za partije
3. Internal linking audit + auto-related u blog člancima
4. Bing Webmaster registracija (kao GSC)

Reci mi koji set hoćeš — ili samo "kreni" i ja idem redom 1→4.
