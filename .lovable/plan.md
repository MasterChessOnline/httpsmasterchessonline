## Maestralan plan rasta — sve poluge, redom po ROI-ju

Ovo nije "još jedna komponenta". Ovo je sistem koji svaki dan pravi nove ulaze na sajt. Podelio sam ga po **kanalima** (gde dolaze ljudi) i **mehanizmima** (zašto se vraćaju). Sve je realno izvodljivo, ništa nije lažno.

---

## 1) BACKLINKS — sirovi gorivo Google-a

Što više kvalitetnih sajtova linkuje ka tebi, to više Google veruje da si "ozbiljan". Cilj: **50 backlinkova za 30 dana**.

### Lako (1 dan posla, 15-20 linkova odmah)
- **Product Hunt** launch — 1 dan, 200-1000 poseta + permanentan link
- **BetaList**, **Indie Hackers Launch**, **Hacker News "Show HN"** — 3 linka
- **AlternativeTo.net** — "alternative to Chess.com" stranica, ide na vrh za taj upit
- **SaaSHub**, **G2 Products**, **Capterra** (besplatni listing)
- **Slant.co** — "Best chess sites for kids"
- **Reddit profile** + 3 corisna komentara na r/chess, r/chessbeginners, r/AnarchyChess (bez spama)
- **Hacker News profile** sa link u bio
- **GitHub README** za sve repo-e koji se odnose na chess engine integraciju
- **Dev.to članak** "How I built a chess site at 13" — masovan saobraćaj iz tech zajednice
- **Medium članak** + canonical na tvoj sajt
- **Quora odgovori** na 10 chess pitanja sa korisnim odgovorom + link

### Srednje (1 nedelja, jaki domeni)
- **Wikipedia spoljni linkovi** — gde god se pominje šah za decu, online šah u Srbiji, dodaj kao "External link" (mora biti uistinu koristan)
- **Wikidata entry** za Nikolu i za MasterChess kao šah platformu (već imaš docs)
- **Srpski IT portali** (Netokracija, Startit, B92 Tehno, Telegraf Tehno, Mondo) — "13-godišnji Beograđanin pravi šah platformu"
- **Šahovski portali** — Chess.com news, Chess24, ChessBase News (skriniti svoju priču)
- **Lokalne novine** Vranje/Beograd/grad gde si — lokalna priča prolazi lakše
- **Školski sajtovi** — kontakt sa 20 osnovnih škola, ponudi besplatne turnire
- **Šahovski savezi** Srbije, BiH, CG, HR, MK — link u "korisni resursi"

### Teško ali zlato
- **Forbes 30 Under 30 Serbia** (ima šanse zbog godina)
- **TED-Ed** ili **TEDx Belgrade** prijava
- **Univerzitetski sajtovi** sa "online tools" sekcijom
- **Šahovski klubovi** širom regiona — partnerstva sa link razmenom

---

## 2) GOOGLE SEARCH CONSOLE — sve što može da se izvuče

### Već imaš pristup preko konektora. Maksimalna upotreba:
- **Submit svaki sitemap shard** (već urađeno za 7 shards)
- **URL Inspection API** — pingovati Google za svaku novu stranicu istog dana
- **Coverage report** — proveriti koje stranice su "discovered, not indexed" (Google ih zna ali ih ne crawluje)
- **Performance API** — povući top 1000 upita gde si na poziciji 5-20 i prepisati title/meta za svaki
- **Mobile usability** — popraviti sve mobile greške
- **Core Web Vitals** — LCP, FID, CLS metrike (sve mora "Good")
- **Manual actions** check — proveriti da nemaš penalty
- **International targeting** — postaviti hreflang za sr/en/bs/hr verzije
- **Rich results test** — validirati sve JSON-LD šeme
- **Discover** opt-in — kratke vesti, šahovske analize, mogu da uđu u Google Discover feed (eksplozija saobraćaja)
- **News inclusion** — Google News submission za blog sekciju

### IndexNow — instant indeksiranje
Već imaš `public/indexnow-key.txt`. Treba samo:
- **Automatski ping IndexNow** kad god se kreira nova stranica/blog/lesson — Bing/Yandex/Naver odmah indeksiraju (Google ne podržava ali se priprema)

---

## 3) GOOGLE MAPS — lokalni saobraćaj odmah

### Šta ide u kod
- **`/play-near-me`** (već postoji) — proširiti sa "MasterChess local champions" po gradu
- **`/chess/{city}` stranice** za top 50 gradova Srbije + regiona — svaka sa Maps embed + lokalni klubovi
- **Schema.org LocalBusiness** JSON-LD na svakoj gradskoj stranici → triger za Google Maps pack
- **Embed Maps** na `/community-map` — pravi igrači po gradovima (samo kad ih ima)

### Šta radiš van koda (Google Business Profile)
- **Registracija GBP-a** kao "Online Chess Service" (već imaš `docs/GOOGLE_BUSINESS_SETUP.md`)
- **Verifikacija videom** (već imaš skriptu) — 2-7 dana, posle toga si na Google Maps
- **GBP Posts 2x nedeljno** — turnir najava, lekcija, milestone
- **GBP Photos** — 20+ slika sajta, board screen, Nikola portreta
- **GBP Q&A** — predefinisanih 15 pitanja sa odgovorima
- **Google Reviews** — moliti prvih 30 korisnika za review
- **Service areas** — Srbija, BiH, CG, HR, MK kao service areas (ne fizička lokacija)

---

## 4) DRUŠTVENE MREŽE — dnevni motor

### TikTok / Instagram Reels / YouTube Shorts (najjači kanal za 14 dana)
Cilj: **2 klipa dnevno, 14 dana**. Skripte već postoje u `docs/TIKTOK_SCRIPTS.md`.

Format ideje:
- "Watch me beat my dad in 8 moves" (mat za 8 poteza, dramaturški)
- "Stockfish vs my 7-year-old brother" (humor)
- "POV: ti si 13 i praviš svoj šah sajt" (relatable za tinejdžere)
- "Speedrun: 100 ELO za 1000 ELO za 24h" (challenge format)
- "Rating my Instagram followers' chess openings" (community engagement)
- "Reading mean comments on my chess site" (drama + signup link u bio)
- Šahovske misterije, čuvene partije sa modernim kontekstom
- "Reacting to GMs reacting to my site" (ako možeš da postaviš pitanje GM-u)
- Daily puzzle u 60 sekundi, kraj sa "solve more on masterchess.live"

### Instagram strategija
- **Bio link**: jedna jedina opcija — Play Now CTA
- **Story highlights**: 5 grupa (Play, Lessons, Daily Puzzle, Tournament, Nikola)
- **DM marketing**: 20 šahovskih IG profila dnevno sa personalizovanim porukom
- **Collab posts** sa drugim šahovskim kreatorima (1 nedeljno)
- **Reels duets / stitches** sa popularnim šahovskim klipovima

### YouTube duga forma
- **1 video nedeljno**, 5-10 minuta, "Behind the scenes building MasterChess"
- **Game analysis** svojih partija
- **GM games breakdown** za long-tail SEO
- **Stockfish vs Stockfish dramatic moments**

### Discord/Telegram zajednica
- **MasterChess Discord server** sa daily puzzle bot-om, turnir najavama, learning kanali
- **Telegram kanal** za regionalne vesti i pozive na turnire
- **Reddit r/MasterChessLive** subreddit

---

## 5) VIRALNE MEHANIKE U SAJTU (svaki igrač dovodi sledećeg)

### Share kuke
- **Auto-screenshot pobede** sa board pozicijom + ratingom → 1 klik na IG/WhatsApp
- **"I beat Nikola" certificate** — PDF/PNG kojim se hvale (već imaš `BeatNikola.tsx`)
- **Rating-up share** — kad pređeš 1000/1200/1500, automatski share kartica
- **Streak milestone share** — 7 dana zaredom, share kartica
- **Daily puzzle solve share** — "I solved today's puzzle, can you?" link
- **Game replay share** — link na replay svake partije, otvara se i bez naloga
- **PGN to GIF** — automatski animirani GIF partije za društvene mreže

### Referral sistem (već imaš `Referrals.tsx`)
- **Pozovi 1 = exclusive piece set**
- **Pozovi 3 = dvostruka XP nedelju dana**
- **Pozovi 10 = "Founder Friend" trajni badge**
- **Leaderboard** najboljih referala sa nagradama

### Challenge link mreža
- **Personalizovan `/vs/{username}`** za svakog korisnika — share na profilu
- **QR kod** za challenge link (lako za štampu, lepak po školi)
- **Email signature generator** — "Play me on MasterChess: link"

---

## 6) ESPORT / TURNIRI — okupljanje publike

- **Daily 20:00 Arena** (već dodato) — fiksan termin svakog dana
- **Weekend Major** — petak 21:00, subota 14:00 i 21:00, nedelja 19:00 — 4 turnira vikendom
- **Monthly Championship** — kraj meseca, ulaz besplatan, nagrada 1000 Lovable coins ili tematski badge
- **School Cup** — pozovi 20 osnovnih škola, svaka pošalje 5 đaka, online turnir
- **Country Battle** — Srbija vs Hrvatska, Srbija vs BiH (svaki mesec)
- **Streamer Showdown** — pozovi 5 chess streamera regiona na javnu emisiju turnir
- **24h Marathon Tournament** — jedan vikend, ko god uđe za 24h igra

---

## 7) SEO SADRŽAJ — long-tail eksplozija

### Programmatic SEO (već imaš osnovu)
- **Openings**: 500+ stranica, jedna po varijanti
- **Famous games**: 100+ stranica, po legendarnoj partiji
- **Players**: 200+ stranica, po GM-u
- **Cities**: 50+ stranica, po gradu (chess in {city})
- **ELO levels**: 20+ stranica, po rejtingu
- **Mate patterns**: 30+ stranica, po matnom obrascu
- **Bots**: 9 stranica + "beat {bot} guide" za svaki

### Sve ovo već postoji. Sledeći nivo:
- **"Chess vs X"** kompariranje (chess vs go, chess vs checkers, chess vs poker)
- **"Best chess opening for {ELO}"** — 20 stranica, jedna po nivou
- **"Chess for {age}"** — chess for 5 year olds, 7 year olds, 10, 13, 16, 30, 50, 65
- **"How to win in {moves} moves"** — 10 stranica
- **"Famous {country} chess players"** — 50 zemalja
- **"Chess tournaments {month} {year}"** — automatski mesečno
- **"{Opening} repertoire for {color} at {level}"** — kombinatorna eksplozija
- **"Daily chess puzzle {date}"** — svaki dan automatski (već imaš puzzle backend)

### Pillar pages (long-form, 5000+ reči)
- "Ultimate guide to chess openings"
- "How to improve from 800 to 1500 ELO"
- "Complete history of world chess championships"
- "Stockfish explained: how chess engines think"

---

## 8) EMAIL — najjeftiniji kanal za zadržavanje

- **Welcome email** odmah po signup-u sa "Play now" CTA
- **Daily puzzle email** opt-in (samo za one koji žele)
- **"We miss you" email** posle 3 dana neaktivnosti
- **Tournament reminder** sat pre svakog javnog turnira
- **Weekly newsletter** sa: top partija nedelje, novi feature, top 10 leaderboard, daily puzzle pregled
- **Milestone emails** — kad pređeš nivo, dobiješ badge, win streak
- **Referral kampanja** — "Tvoj prijatelj te čeka na sajtu"

Već imaš `email_send_log` i `email_send_state` tabele — infrastruktura postoji.

---

## 9) PARTNERSTVA — brze pobede

- **Šahovski klubovi** — 5 najvećih u Srbiji, ponuda za online turnir za njihove članove
- **Šahovski coachevi** — partnership program, MasterChess plaća/daje kredite po referalu
- **Šahovski YouTuberi** — sponzorisani segmenti (besplatni Premium za 1 godinu = pomenu sajt)
- **Šahovski Twitch streameri** — daj im custom "play with viewers" link, ti dobijaš signupove
- **Škole šaha** — partnerstvo, koriste MasterChess za domaće zadatke
- **Šahovski savezi** — sponzorstvo lokalnih turnira
- **Šahovska udruženja u dijaspori** — srpska zajednica u Beču, Cirihu, Frankfurtu, Čikagu

---

## 10) PR I MEDIJI — jedan članak = 500-2000 signup-a

Šablone već imaš u `docs/PR_PITCHES.md`. Cilj: **20 pitches za 7 dana**.

Mete (po prioritetu šanse):
- **Netokracija, Startit** — IT priča, 13-godišnjak founder
- **B92 Tehno, Mondo, Telegraf Tehno** — domaći tech
- **Blic, Kurir, Informer** — ljudska priča, talenat
- **Politikin Zabavnik** — ako još postoji za decu
- **TV emisije** — Beogradska hronika, Jutro na Pinku, Dobro jutro RTS
- **Šahovski podcasti** — Perpetual Chess Podcast, ChessBase Podcast
- **Strani tech mediji** — TechCrunch, The Verge (long shot ali isplativo)

---

## 11) MONETIZACIJA = JOŠ JEDAN GROWTH KANAL

Zvuči čudno, ali plaćeni kupci se najviše dele:
- **Founder badge** za prvih 100 supportera (već imaš `Supporter.tsx`)
- **Custom titles** za donatore
- **Lifetime Premium** za prvih 50 (jeftino ali daje "early adopter" osećaj)
- **Affiliate program** — 30% lifetime za nove preporuke

---

## 12) STVARI ZA UKLONITI ILI SAKRITI (smanji buku, povećaj fokus)

- Sakrij prazne rute iz Navbar-a (Battle Royale, Clan, StreamHub, Team Battles dok nema publike)
- Smanji Footer linkove za 50%
- Skinuti "Coming Soon" stranice iz produkcije
- Sakrij "Live Player Counter" kad je 0 (već radi)
- Spoji slične stranice (3 različita Daily Puzzle stranica → 1)
- Skinuti dev/test rute (DevOnlineSim, ako nije nužno)

---

## 13) REKLAME — kad imaš budžet

Pomenuto u prošlom planu, ukratko:
- **Meta ads** — €5-10/dan, šah interes, Balkan
- **Google Ads** — samo brand keywords, €1-2/dan
- **TikTok Spark Ads** — boost organskih klipova koji rade
- **NE** Twitter, LinkedIn, YouTube ads

---

## 14) ANALYTICS — bez merenja nema rasta

- **Google Analytics 4** — već postoji u sajtu? proveriti
- **Plausible/Umami** kao backup
- **PostHog** za product analytics (funnels, retention)
- **GSC Performance API** — pratiti rast impresija/klikova dnevno
- **Weekly growth report** automatski u email-u

---

## Šta bih implementirao u kodu sledeće (ako kažeš "kreni")

Po prioritetu ROI/trud:

1. **Auto share-kartica** posle pobede (PNG download + native share) — viralni loop
2. **Personalizovan `/vs/{username}` challenge profile** za svakog korisnika
3. **Programmatic "Chess for {age}"** stranice — 7 novih stranica, low-effort, long-tail SEO
4. **Email: "We miss you" workflow** sa Tonight Arena reminder-om
5. **Daily Puzzle automatski IndexNow ping** kad se generiše nova stranica
6. **Schema.org LocalBusiness** na svim city stranicama za Maps pack
7. **Discord widget na Home** (kad budeš imao Discord)
8. **Referral progress bar** vidljiviji na svakoj stranici
9. **Navbar cleanup** + Footer cleanup (smanji buku)

---

## Iskren završetak

Ovo izgleda kao mnogo, ali **80% rasta dolazi od 3 stvari koje moraš raditi SAMA, NE U KODU**:

1. **TikTok/Reels svaki dan 14 dana**
2. **Jedan PR pitch dnevno medijima**
3. **Daily Arena u 20:00** sa share linkom svuda

Sve ostalo iznad je amplifikator. Kod već ima 90% potrebnog. Reci samo koje od 9 stvari iz "šta bih implementirao" da kreneš, ili kaži "kreni sve" pa idem po prioritetu — ali znaj da bez TikTok/PR/Daily Arena dela nema 1000 igrača bez obzira na kod.