## Cilj
Maksimalno pojačati vidljivost MasterChess-a kroz Google Search Console, Google Maps i PR (portali/mediji), bez trošenja kredita na stvari koje ne donose igrače.

## Šta predlažem (po prioritetu ROI)

### 1. Google Search Console — dodatno (~10 kredita)
- **URL Inspection + Request Indexing** za 10 najvažnijih stranica (Home, /nikola-sakotic, /play-guest, /puzzles, /openings, /tournaments, /battle-royale, /vs/{code}, /beat/magnus-bot, /community) — gura ih u indeks za par dana umesto par nedelja.
- **Performance API report** — koje queries već donose impresije ali NE klikove (pozicije 8–20). Te stranice prepravljamo (title/H1/meta) jer su "low-hanging fruit".
- **Fix sitemap error** — `sitemap.xml` ima `errors: 1`. Naći i popraviti.
- **Core Web Vitals report** — provera da li LCP/CLS koče indeksiranje.

### 2. Google Maps / Business Profile (~5 kredita kod, ostalo ručno)
**Važno:** Google Business Profile zahteva fizičku lokaciju ili "service area business". MasterChess je online servis — ne kvalifikuje se za klasičan Maps pin. Realne opcije:
- **Google Knowledge Panel za Nikola Šakotić** kroz Person schema (već urađeno) + Wikidata entry (ručno, ja pripremim tekst).
- **Google Business Profile kao "Service Area"** registrovan na Nikolinu adresu (Beograd/region) — ako pristaješ, dam ti uputstvo korak po korak. Tu možeš dodavati fotografije sajta, postove, recenzije.
- **Google Posts** preko Business Profile-a — nedeljne objave o turnirima, puzzlesima.

### 3. PR / Portali — copy-paste pitch-evi (~15 kredita)
Pripremam **gotove mejlove i pitch tekstove** za:
- **Srpski tech portali:** Netokracija, Startit, Benchmark, Mondo Tech, B92 Tehnologija, Telegraf Tech, Blic Zona
- **Omladinski/edukativni:** RTS Klinci, Politikin Zabavnik, NIN, Nedeljnik
- **Šahovski:** Šahovski Savez Srbije bilten, lokalni šah klubovi (mejling lista)
- **Internacionalno (engleski):** TechCrunch tips, Hacker News (već u planu), IndieHackers, Product Hunt launch, BetaList, Reddit r/InternetIsBeautiful

Angle za sve: **"13-godišnji dečak iz Srbije napravio chess platformu koja konkuriše Chess.com-u"** — to je priča koja se sama prodaje.

### 4. Dodatne viralne ideje (besplatne, samo treba uraditi)
- **TikTok/Instagram Reels** — Nikola snima 30s "kako sam napravio sajt sa 13 godina" → linkuje masterchess.live u bio
- **YouTube DailyChess_12** — pin video "Igraj na mom sajtu" + link u opisu svakog videa
- **Šah turniri u školama** — ponuda lokalnim školama: besplatan turnir na MasterChess platformi
- **Sticker/QR kod kampanja** — print QR koji vodi na /play-guest, lepi po šah klubovima u Beogradu
- **Discord server MasterChess** — community hub, daily puzzle, turniri
- **Wikipedia stranica "Nikola Šakotić"** — ako se kvalifikuje (treba 2-3 nezavisna izvora prvo → otud PR)

### 5. Šta NE radimo (gubitak kredita)
- Više landing stranica (već imamo 1000+)
- Više blog postova (nema ko da čita)
- Plaćeni Google/Meta Ads (skupo, mali ROI za young domain)
- Email kampanje (nemamo listu)

## Plan izvršenja (ako odobriš)

**Faza A — Tehnički (ja radim, ~30 kredita):**
1. GSC: Request Indexing za 10 ključnih URL-ova
2. GSC: Performance report → identifikuj "page 2" queries
3. Popravi sitemap error
4. Generiši `docs/PR_PITCHES.md` sa 15+ gotovih mejlova (srpski + engleski)
5. Generiši `docs/GOOGLE_BUSINESS_SETUP.md` — korak po korak za GBP
6. Generiši `docs/WIKIDATA_NIKOLA.md` — gotov entry za Wikidata
7. Generiši `docs/TIKTOK_SCRIPTS.md` — 10 video scenarija za Nikolu

**Faza B — Ti radiš (ručno, besplatno):**
- Šalješ mejlove portalima (template-i gotovi)
- Postavljaš Google Business Profile
- Snimaš TikTok/Reels
- Postavljaš na Reddit/HN (template-i već gotovi)

## Pitanje pre nego što krenem
Koja faza ti je prioritet?
- **A** Samo GSC tehnički (10 kredita, brzo)
- **B** PR pitch-evi za portale (15 kredita, najveći ROI dugoročno)
- **C** Sve od navedenog (30 kredita)
- **D** Nešto drugo — reci šta

Napiši A / B / C / D ili "kreni sve".
