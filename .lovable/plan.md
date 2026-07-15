## Cilj: eksplozija populacije — sve VAN sajta (marketing, ne kod)

Ti si u pravu: dodavanje sitnica na sajt neće doneti 100 korisnika. Ovo je plan **spoljnog marketinga + distribucije loga po celom internetu**. Sajt ostaje kakav jeste; ja pripremam **materijale, tekstove, kampanje i checkliste** koje ti (ili automatizacija) postavljate po platformama.

---

### DEO A — Logo raspored po celom internetu (jedan brend svuda)

Napraviću **"Brand Asset Kit"** folder (`docs/brand-kit/`) sa gotovim varijantama loga (1:1, 16:9 cover, 9:16 story, favicon, watermark) + PDF uputstvo gde ide šta:

| Platforma | Šta ide | Format |
|---|---|---|
| Google Business Profile | profilna + cover | 1:1 + 16:9 |
| YouTube (DailyChess_12) | avatar + banner + watermark | 800×800, 2560×1440 |
| Instagram / TikTok / X / Facebook | avatar + IG Story highlight covers | 1:1 + 9:16 |
| Reddit (user + subreddit ikonica) | avatar + banner | 256×256 + 1920×384 |
| Discord server | server ikonica + banner + role ikonica | 512×512 |
| Twitch (ako se koristi) | profil + offline banner | 1:1 + 16:9 |
| LinkedIn (kompanija) | logo + cover | 400×400 + 1128×191 |
| ProductHunt / IndieHackers / Hacker News | thumbnail | 240×240 |
| WhatsApp Business | profilna + katalog | 1:1 |
| Email potpis + newsletter header | inline PNG | 600px wide |
| Wikipedia / Wikidata (Nikola profil) | logo licenciran CC-BY | SVG + PNG |
| Chess.com / Lichess **NE** — brand policy | — | — |

Automatski ću izgenerisati sve dimenzije iz jedne source slike koju si uploadovao.

---

### DEO B — Google Ads (plaćeno, najbrža konverzija)

Napraviću `docs/ADS_GOOGLE_LAUNCH.md` sa **copy-paste kampanjama** — ti samo otvoriš Google Ads i lepiš:

1. **Search — Engleski** (€5/dan): 7 ad grupa, 30+ ključnih reči, 15 headlines, 4 descriptions, sitelinks, callouts.
2. **Search — Srpski** (€3/dan): `šah online besplatno`, `blitz turnir online`, `učenje šaha`, `DB Cup turnir`.
3. **Performance Max — DB Cup** (€10/dan, do 18. jul): jedna kampanja, event-focused, sav asset feed spreman.
4. **YouTube pre-roll** na chess kanalima (GothamChess, Levy Rozman, ChessNetwork, Anna Cramling audiences).
5. **Brand defense** (€1/dan): bid na "masterchess" da ne izgubiš klik od konkurencije.

Uključuje: tačne max CPC, negative keyword lista, conversion tracking uputstvo, dnevni budžet split, kada da ubiješ ad (CTR < 1.2%).

---

### DEO C — Meta / Instagram / TikTok Ads

`docs/ADS_META_TIKTOK.md`:
- **10 gotovih ad varijanti** (copy + hook + CTA) za Reels/TikTok 9:16
- **Audience targeting matrix**: interest lista, retargeting piksel setup, lookalike strategija
- **Nikola angle** (13-godišnji solo founder) — najjači hook, 3 verzije skripte za Reels/TikTok/YouTube Shorts
- **Kreativni brief** za 20 short-form video ideja (speedrun bot demolition, "beat this position", "500 free coins" itd.)
- **Testni budžet**: €3/dan × 3 kreative × 7 dana = €63 za validaciju

---

### DEO D — Reddit / Forumi (besplatno, visok ROI)

`docs/REDDIT_BLITZ.md` — 30-dnevni kalendar postova, sa **gotovim naslovima i telom posta** za:
- `/r/chess` (2.1M) — Nikola story, milestone posts, "would love feedback"
- `/r/chessbeginners` (400K) — weekly puzzle post
- `/r/serbia`, `/r/beograd` — SR turnir najava, "podržite domaći startup"
- `/r/webdev`, `/r/SideProject`, `/r/InternetIsBeautiful` — tech build story
- `/r/Entrepreneur`, `/r/startups` — solo founder priča
- Chess.com forum, Lichess forum (BEZ linka na sajt, samo Nikola priča → profil → link)

Uključuje: pravila svakog sub-a, kada postovati (dan/vreme za max upvote), kako odgovarati na komentare, šta NE raditi (spam ban).

---

### DEO E — Google Business Profile + Lokalni SEO

`docs/GBP_LAUNCH_CHECKLIST.md`:
- Verifikacija (video walkthrough — već imaš delimično)
- **90 GBP postova pripremljenih unapred** (3 mesečno × 3 nedelje = automatski feed za `publish-gbp-posts` edge)
- Reviews playbook: template poruka za prve 20 recenzija (WhatsApp/email prijateljima)
- Lokalne citation submisije: 15 srpskih direktorijuma (šahovski savez, sport.rs, 011info, poslovi-oglasi, Bing Places, Apple Maps Connect)
- Foto pack (30 fotografija): board, Nikola, turnir, screenshots

---

### DEO F — Press & PR (Nikola story = press magnet)

`docs/PRESS_OUTREACH_KIT.md`:
- **Press release** — dve verzije, EN + SR, spremne za slanje
- **Media kit** ZIP: logo (sve varijante), Nikola visoke rezolucije fotke, screenshots, factsheet, quotes, boilerplate
- **Kontakt lista sa email adresama**: Blic, Politika, Kurir, RTS, N1, Nova.rs, Telegraf, Vreme, NIN + Chess.com news, ChessBase, Chess24 + TechCrunch young founder desk, Hacker News (Show HN kada spreman)
- **Email template** — personalizovan po novinaru, follow-up sekvenca (3 emaila kroz 2 nedelje)
- **Podcast pitch** — 10 chess podcasts + srpskih tech/omladinskih podcastova gde Nikola može kao gost

---

### DEO G — YouTube / TikTok organski (DailyChess_12 kolaboracija)

`docs/YOUTUBE_TIKTOK_PLAN.md`:
- **30 skripti** za YouTube Shorts / TikTok / IG Reels (15s svaki), sortirano po hook snazi
- **Streaming kalendar** DailyChess_12 → "Play me on MasterChess" event streams, viewer challenges
- **Kolaboracija outreach** — lista od 40 mid-tier chess creator-a (10K–500K) sa email/DM template-om za saradnju
- **Cross-promo** — kada Nikola pobedi/izgubi na sajtu, auto-clip za TikTok

---

### DEO H — Community "guerrilla" distribucija

`docs/COMMUNITY_DISTRIBUTION.md`:
- **50 chess Discord servera** — lista sa članstvom, pravilima, kako se predstaviti (bez spama)
- **Facebook chess grupe** — 30 grupa (EN + SR + regionalne)
- **WhatsApp / Viber** — template poruka za tvoje prijatelje/porodicu, "podelite u 3 grupe"
- **Šahovski klubovi u Srbiji** — lista 40 klubova, email + telefon, template "besplatan online turnir za članove"
- **Osnovne škole u Beogradu** — 20 škola sa šahovskim sekcijama, direktorki template
- **Univerziteti** — Belgrade Chess Society, ETF, FON študentske organizacije

---

### DEO I — Analitika i praćenje (šta radi, šta ne)

`docs/ANALYTICS_SETUP.md` — uputstvo (bez izmena koda) kako da:
- Postaviš GA4 property + Google Ads linkovanje
- Postaviš Meta Pixel + Conversions API
- TikTok Pixel
- UTM konvencija za svaki kanal (`utm_source=reddit&utm_campaign=nikola_story`)
- Weekly KPI tabela (Google Sheet template): signups po izvoru, CAC po kanalu, DB Cup registracije

---

### DEO J — 30-dnevni execution kalendar

`docs/30_DAY_EXECUTION_CALENDAR.md` — dan po dan, šta se objavljuje gde, ko šalje šta:

- **Nedelja 1**: Brand kit deploy svuda, GBP live, prvi Reddit post, press release send (embargo do dana 5)
- **Nedelja 2**: Google Ads live, prvi TikTok/Reels talas (10 videa), 5 podcast pitcheva
- **Nedelja 3**: Meta Ads live, YouTube collab stream, drugi press talas
- **Nedelja 4**: DB Cup finalni push, retargeting kampanje, wrap-up + KPI review

---

### Šta OVAJ plan NE menja na sajtu

Nema komponentnih izmena, nema RLS-a, nema novih ruta. Samo `docs/brand-kit/` folder + `docs/*.md` marketing dokumenti + generisani asset fajlovi. Sajt ostaje isti — sav rad ide u distribuciju.

---

**Reci "kreni" i ja gradim sve gore navedeno u jednom pass-u.** Ili mi kaži koji DEO (A–J) da uradim prvi ako ne želiš sve odjednom. Preporuka redosleda po ROI: **A (logo raspored) → F (press kit, Nikola story) → D (Reddit blitz) → B (Google Ads) → E (GBP) → C (Meta) → ostalo**.
