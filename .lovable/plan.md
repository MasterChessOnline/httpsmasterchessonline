# Chess.com Playbook vs MasterChess — Audit + 30-Day Activation Plan

## Šta je Chess.com stvarno uradio da dostigne populaciju

Chess.com nije porastao iz "boljeg UI-ja". Porastao je iz **kontrole ekosistema**:

### 1. SEO dominacija (Semrush podaci, US baza)
- **257.868 organskih ključnih reči**, **~3.550.997 poseta/mesec** samo iz Google-a.
- **Authority Score 81/100**, **23+ miliona backlinkova**, **61.736 referring domena**.
- Najjači saobraćaj dolazi sa branda "chess" i "chess online" — to je godinama građeno kroz sadržaj, ne oglase.
- **chess.com/news** ima punu redakciju i dominira "chess news" upitima.

### 2. Akvizicije konkurencije
- ChessKid, PlayMagnus, Aimchess, Chessable, iChess, ChessTempo — sve progutano.
- Cilj: nema ozbiljnog konkurenta, svi korisnici na jednoj platformi.

### 3. Influencer & streamer ekskluzive
- Potpisali Hikaru, Botez, Levy **pre** Queen's Gambit buma.
- PogChamps 2020 (turnir NE-šahista) doveo **2M+ novih naloga za 2 nedelje**.
- Speed Chess Championship kao sopstvena NBA liga.

### 4. Bot personalities kao marketing kanali
- 60+ botova sa licem, glasom, memovima.
- Svaki bot je zaseban razlog da neko dođe na sajt.

### 5. Freemium zid + dnevni habit
- Analiza, lekcije, više puzzle-a → paywall posle 3 dana.
- **Daily Puzzle email** je po njihovim rečima najjača retencija poluga.
- Konverzija 4-6%.

### 6. Viralni PR kroz fair-play
- Banovi poznatih igrača (Hans Niemann slučaj) = besplatan PR mesecima.
- Svaki veliki skandal u šahu = saobraćaj na Chess.com.

## Da li je MasterChess 100% spreman za pik rasta — NE

Sajt ima **odličnu infrastrukturu**, ali nije "pik-ready". Procena spremnosti:

| Oblast | Status | Šta fali |
|---|---|---|
| **Igra / matchmaking / botovi** | 85% | Radi, 26 botova, online igranje, turniri. |
| **SEO stranice / sitemaps** | 75% | 186 ruta, 19 sitemapova, SEO generator postoji. |
| **Viralni mehanizmi** | 60% | Roast, share cards, Chess DNA postoje — ali nisu aktivno gurani. |
| **Retencija / email / push** | 50% | Resend konektor postoji, ali nema aktivnog daily puzzle email-a ni retargetinga. |
| **TV / Study (Lichess/Chess.com killer feature)** | 20% | **Nema `/tv` ni `/study/:id` rute** — ovo je najveći promašaj. |
| **Plaćeni oglasi (Google/Meta/TikTok)** | 10% | GA4/Meta/TikTok pikseli su žičani, ali env varijable verovatno nisu postavljene. |
| **Google Business Profile / Maps** | 15% | Admin panel postoji, ali GBP nije verifikovan. |
| **Sadržaj / društvene mreže** | 30% | News-jacker, LinkedIn, TikTok konektori postoje — ali nema redovne produkcije. |
| **Partneri / streameri / klubovi** | 25% | Forme postoje (`/streamers/apply`, `/sponsor-a-tournament`), ali nema outreach-a. |

**Ukupna procena spremnosti: ~55%**. Sajt može da primi rast, ali će veliki deo posetilaca otići bez navike ako pokrenemo masivnu kampanju pre nego što se popune rupe.

## 30-dnevni plan aktivacije — šta prvo

Cilj: dovesti sajt sa 55% na 90% spremnosti, pa onda upaliti masinu.

### Nedelja 1 — Produkt rupe koje ubijaju retenciju
1. **MasterChess TV (`/tv`)** — auto-rotate najjače live partije svakih 15s + spectator chat. Ovo je Lichess TV kopija koja drži ljude na tabu satima.
2. **Studies (`/study/:id`)** — paste PGN → shareable board sa komentarima po potezima. Najjači backlink magnet u šahu.
3. **Daily Puzzle Email + Streak** — Resend cron u 09:00 UTC+1, daily leaderboard na `/puzzles`.
4. **Fix `/tv` i `/study` rute u `App.tsx`** — trenutno ne postoje.

### Nedelja 2 — Analitika i konverzija
5. **Postavi GA4, Meta Pixel, TikTok Pixel** — dodaj env varijable i proveri da li se događaji šalju.
6. **Aktiviraj GBP verifikaciju** — video walkthrough dashboard-a, 20 fotki, prvi event post za DB Cup.
7. **Pokreni Google Ads test** — €5/dan na "besplatan šah online", "šah turnir online" za RS/HR/BA/MK/SI.
8. **Postavi Meta/TikTok retargeting pixel** pre nego što krene organski saobraćaj.

### Nedelja 3 — Sadržaj i viralnost
9. **Aktiviraj News-Jacker** — cron svakih 15 min, ali sa ljudskim pregledom pre objave (ne želiš loš sadržaj na sajtu).
10. **Produkcija 30 TikTok/Reels/Shorts** — batch snimanje, 2 videa dnevno, UTM linkovi.
11. **Reddit blitz** — 8 postova na r/chess, r/SideProject, r/serbia, r/chessbeginners itd.
12. **Press kit + medijski outreach** — Nikola priča, Blic/Politika/RTS/Startit/Netokracija.

### Nedelja 4 — Partnerski rast
13. **StreamerHub 500** — DM/email 500 mikro-strimera, `/streamers/apply` link.
14. **Šahovski klubovi i škole** — 100 klubova × ~50 članova potencijal.
15. **Sponsor-a-tournament self-serve** — lokalne firme za €50, backlink + prihod.
16. **Product Hunt launch** — Aug 12 ili odmah posle DB Cup-a.

## Šta NE radimo (jer nema smisla sada)

- Kupovina konkurencije — nema cash-flowa.
- Skupi influencer deal-ovi (€10k-100k za GM-a) — umesto toga 500 mikro-strimera.
- Sopstvena TV liga — bez publike prvo, prazna arena.

## Pitanje pre nego što krenem

Da li da krenem sa **Nedeljom 1 (TV + Study + Daily Email)** da popunimo najveće rupe u retenciji, ili želiš prvo da **upalim marketing odmah** (Reddit + TikTok + Ads) pa da popravljamo sajt dok saobraćaj dolazi?

Preporuka: **Nedelja 1 prvo**. Bolje je 100 posetilaca koji ostanu nego 10.000 koji odu.
