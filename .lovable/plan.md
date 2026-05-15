
# Kako da MasterChess.live "eksplodira"

Sajt je tehnički jak (Stockfish, real human play, tournaments, DailyChess_12). Sledeći korak je **vidljivost + retencija + viralnost**. Evo konkretnog plana po prioritetu.

---

## 1. Google indeksiranje i SEO temelji (PRVO — bez ovoga ostalo ne radi)

**a) Google Search Console verifikacija + sitemap submit**
- Već postoji `scripts/generate-sitemap.ts` i `public/sitemap.xml`. Treba:
  - Verifikovati domen `masterchess.live` u Search Console (META tag flow).
  - Submit-ovati `sitemap.xml`, `sitemap-openings.xml`, `sitemap-images.xml`.
  - Setup IndexNow za Bing/Yandex (već postoji `indexnow-key.txt` i edge fn — proveriti da radi).

**b) Bogatiji sitemap (dinamički)**
- Trenutno verovatno samo statične rute. Dodati po jednu URL u sitemap za:
  - svaki opening (`/openings/:slug`) — ima ih stotine, ogromna SEO površina
  - svaki bot profil (`/bots/:id`)
  - svaki javni player profil (`/player/:username`)
  - svaki turnir (`/tournaments/:id`)
  - svaki master game (`/master-game/:id`)
- **To je realno 1000+ URL-ova** — Google ih obožava.

**c) Per-route meta tagovi (react-helmet-async)**
- Već postoji `Seo` komponenta (vidim u Index.tsx). Proveriti da je na SVAKOJ stranici sa: unique `<title>`, `<description>`, canonical, og:image, JSON-LD.
- Najvažnije: openings, lessons, blog, master games, leaderboard.

**d) JSON-LD strukturirani podaci**
- `Organization` + `WebSite` (sitewide u index.html — verovatno već imaš).
- `VideoObject` za svaki DailyChess_12 stream embed → Google Video carousel.
- `Article` za blog/learn članke.
- `BreadcrumbList` na svim podstranicama.
- `FAQPage` na "Find a chess opening", "How to improve" stranama → rich snippets.
- `Event` za turnire → Google Events carousel.

---

## 2. Slike i Google Images (ogroman, potcenjen kanal)

**a) OG board images per page**
- Već postoji `src/lib/og-board-image.ts`. Za svaku opening stranicu generisati unique board screenshot kao OG image → kad neko deli link na Discord/Twitter/WhatsApp, vidi se tabla.

**b) Image SEO**
- Sve slike: descriptive `alt` ("King's Indian Defense main line position after 7. O-O"), `loading="lazy"`, `width`/`height` attributes, WebP.
- **Image sitemap** (već imaš `sitemap-images.xml`) — popuniti svim board pozicijama, bot avatarima, achievement ikonama.

**c) Pinterest / Reddit r/chess board pin strategy**
- Top 50 famoznih pozicija (Immortal Game, Opera Game, Kasparov vs Deep Blue) kao deljive infografike linkovane na `/master-game/:id`. Pinterest je masovan izvor saobraćaja za chess sadržaj.

---

## 3. Sadržaj koji rangira (programmatic SEO)

Najveći chess sajtovi (Lichess, Chess.com) dominiraju sa **dugim tail keyword stranicama**. Predlog šta da generišeš:

**a) Opening landing stranice — SEO copy**
- Za svaki ECO kod: "Sicilian Defense Najdorf — moves, theory, traps, statistics" (1500+ reči, FAQ, video embed sa DailyChess_12 ako postoji).
- Cilj: rangirati na "how to play [opening]", "[opening] traps", "[opening] for white/black".

**b) Player vs Bot landing**
- "Play against 1200 ELO bot" — svaka rating ima sopstvenu landing stranu sa CTA.
- Ranguje za "play chess bot 1500 elo", "chess engine for beginners".

**c) Tools landing**
- `/tools/pgn-viewer`, `/tools/fen-editor`, `/tools/elo-calculator` (već imaš `RatingCalculator`).
- Lichess i Chess.com gube ovde — male tool stranice rangiraju brzo.

**d) Glossary**
- `/learn/glossary/:term` — "What is en passant", "What is zugzwang" (300+ termina). Svaki je SEO friendly URL.

---

## 4. Distribucija i backlinks

**a) Reddit**
- r/chess (1.5M članova), r/chessbeginners, r/chesspuzzles
- NE spam — postavi DailyChess_12 highlight clipove sa linkom "solve this position on masterchess.live".

**b) YouTube SEO za DailyChess_12**
- U opisu svakog videa: link ka odgovarajućoj poziciji/openingu na sajtu.
- "Try this position yourself: masterchess.live/analysis?fen=..."
- Ovo gradi backlinks + direktan saobraćaj.

**c) Discord servers**
- Chess.com Discord, Lichess Discord, lokalni klubovi — postaviti tournament link, ne reklamu.

**d) Wikipedia external links**
- Master games stranice mogu se linkovati sa relevantnih Wikipedia članaka o tim partijama (pažljivo, ne spam).

**e) Submitting tools**
- ProductHunt launch (jednom), AlternativeTo.net (alternativa Chess.com), Chess.com fanbase forumi.

---

## 5. Viralni mehanizmi unutar sajta

**a) "Share your win" → automatic image card**
- Na kraju partije: dugme "Share win card" → generiše PNG sa: pozicija mata + ELO + "I beat 1800 player on masterchess.live".
- Twitter/X i WhatsApp kartice = besplatna reklama.

**b) "Brag link" za Daily Puzzle**
- "Solved Daily Puzzle in 12s — 47 day streak 🔥 — masterchess.live/daily-puzzle"
- Auto-generated share image sa streak counter.

**c) Referral program**
- "Pozovi prijatelja, oboje dobijate 30 dana premium tema/avatara." Ima `Referrals.tsx` — proveriti da je aktivan.

**d) Public profiles indeksabilni**
- Svaki user profile = potencijalna SEO landing kad neko gugla njegov username. Mora biti SSR-friendly ili imati pre-renderovan meta.

---

## 6. Retencija (da posetioci ne odu)

**a) Streak protection**
- "Streak freeze" — jedan dan mesečno smeš preskočiti bez gubitka streak-a (Duolingo trik). Drastično povećava DAU.

**b) Email/Push notifications**
- "Tvoj daily puzzle čeka — 47 day streak na liniji"
- "Turnir počinje za 10 min" (već imaš `use-tournament-notifications`)
- Web Push API + email fallback (već imaš email infrastrukturu).

**c) Weekly recap email**
- "Ove nedelje: 23 partije, +47 ELO, najjači mat u 6 poteza" + share button.

**d) Onboarding checklist**
- Prvi dan: "1. Odigraj prvu partiju 2. Reši daily puzzle 3. Pridruži se turniru" — XP nagrada za svaki korak.

---

## 7. Tehnički performance (Core Web Vitals)

Google rangira brze sajtove više. Provere:
- LCP < 2.5s na homepage (mereno PageSpeed Insights)
- Lazy load sve ispod fold (already partial)
- Stockfish WASM — load on demand, ne na homepage
- Image dimenzije: width/height na svim slikama da spreči CLS
- Service Worker (već imaš `sw.js`) — proveriti da kešira pravilno

---

## 8. Lokalizacija (multipli growth lever)

`use-i18n` postoji u Settings. Aktivirati:
- Srpski, ruski, španski, hindi (ogromne chess populacije).
- `<link rel="alternate" hreflang="sr">` tagovi za svaku stranu.
- Posebne sitemap fajlove po jeziku.
- Rezultat: 5x SEO površina, ulazak na tržišta gde Chess.com nije dominantan.

---

## Predlog redosleda (12 nedelja)

```
Nedelja 1-2:   Google Search Console + dynamic sitemap + per-route Helmet
Nedelja 3-4:   Programmatic opening pages (ECO codes) sa unique tekstom
Nedelja 5-6:   Share cards (win + puzzle streak) + OG images
Nedelja 7-8:   Reddit/YouTube distribucija + DailyChess_12 cross-linking
Nedelja 9-10:  Email/Push notifications + streak freeze
Nedelja 11-12: Lokalizacija (srpski + ruski) + image SEO
```

---

## Šta predlažem da radimo PRVO (1 task, da krenemo)

**Najveći ROI sa najmanje rada**: dinamičan sitemap sa svim opening + bot + master-game URL-ovima + Helmet meta po stranicama. To otvara 1000+ URL-ova Google-u za par dana.

Reci koji deo plana želiš da implementiram prvi i krećem.
