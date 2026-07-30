# Dynasty Playbook — Brutalnije od Chess.com

Chess.com nije porastao slučajno. Kupili su konkurenciju, potpisali svakog većeg strimera pre nego što je bio slavan, i pretvorili šah u reality TV. Evo šta ćemo mi uraditi — istim tempom, ali agresivnije, jer smo mali i brzi.

## Šta je Chess.com stvarno uradio (kratko)

1. **Acquisitions** — kupili ChessKid, PlayMagnus, Aimchess, Chessable, iChess, ChessTempo. Progutali celu industriju.
2. **PogChamps** — turnir NEšahista (Twitch strimera) 2020. Doveo je 2M+ novih naloga za 2 nedelje.
3. **Hikaru & Botez ekskluziva** — potpisali sve pre nego što je Netflix pustio Queen's Gambit.
4. **Bot personalities** — 60+ botova sa licem, glasom, memovima → svaki bot je svoj marketing kanal.
5. **Speed Chess Championship** — sopstvena liga sa nagradnim fondom, prenosi se kao NBA.
6. **Chess.com/news** — puna redakcija, dominira "chess news" u Google-u.
7. **Freemium wall** — analiza, lekcije, više puzzle-a → paywall posle 3 dana. Konverzija 4-6%.
8. **Fair Play + banovi slavnih** → svaki ban je viralna vest (Hans Niemann case je bio besplatan PR mesecima).

## 10 poteza brutalnijih od toga (za MasterChess)

### 1. **Napravi PROTIVNIKA, ne konkurenta** — "Chess.com killed the small clubs" narativ
Chess.com je gigant. Mali klubovi na Balkanu umiru. Mi smo Robin Hood.
Landing page `/manifesto` sa video-om Nikole: *"They took chess from the streets. We're taking it back."* → svaka priča o nama počinje ovim.

### 2. **Nikola vs Svet** — javni izazov jednom GM-u dnevno
Nikola (13) javno izaziva jednog poznatog igrača dnevno preko Twittera/YouTube-a. Čak i ako 1 od 30 odgovori, to je viralno. Ako niko ne odgovori, to je takođe priča: *"Nobody wants to play the 13-year-old"*.
→ Automatizovano preko `linkedin-publish` + TikTok cron-a. Feature na sajtu: `/challenge-of-the-day`.

### 3. **Balkan Bounty** — €1000 za svakog ko pobedi Nikolu
Realan cash prize (može biti donacija ili sponzorstvo). Landing `/beat-nikola` sa live leaderboard-om. Ovo je klik-magnet za regionalne medije. Cena po članku je 0€ — mediji sami pišu.

### 4. **StreamerHub 500** — potpiši 500 mikro-strimera pre nego što porastu
Chess.com je potpisao 20 top strimera. Mi ćemo 500 mikro-strimera (500-5k pratilaca) sa affiliate kodom + revenue share. Svaki im donosi 5-20 signup-a mesečno = 5000+ mesečno besplatno.
→ Postoji `partner_applications` tabela. Treba `/streamers/apply` javna stranica + auto-approve flow.

### 5. **"Naslednici Fischer-a"** — reality serija na TikTok-u
30-dnevni "reality" gde 8 mladih igrača (12-16) igra svaki dan, ispada 1 dnevno, poslednji uzima €500. Kamera prati emocije, ne poteze. Ovo je **PogChamps ali za decu i sa dramom** — jer deca su emotivnija i to je clip-food.
→ Nova sekcija `/nasledinici` sa dnevnim epizodama, glasanje ko je "villain of the day".

### 6. **Bot Wars** — bot personalities koji GOVORE tvojim jezikom
Svaki bot sa balkanskim licem/imenom: *"Deda Mile 1200", "Baba Vera 1400", "Cika Miloš 1800"*. Svaki priča trash-talk na srpskom sa audio-clip-ovima. Chess.com botovi su generični Amerikanci. Naši su iz komšiluka.
→ Proširiti `bot-profiles.ts` na 20 balkanskih likova + Nikola-voice sample-i.

### 7. **Live Ban Wall** — javna anti-cheat transparentnost
Kad banujemo cheat-era, javno objavimo (bez imena, sa rating-om i statistikom). Chess.com to krije. Mi to koristimo kao marketing: *"Danas smo banovali 47 cheat-era. Fair play matters."*
→ `/fair-play` javna live stranica. Već imamo `tournament_anti_cheat_flags`.

### 8. **Sponsored Tournaments as a Service** — bilo koja firma sponzoriše svoj turnir za €50
Ne čekamo Chess.com da zove Coca-Colu. Local pekara može sponzorisati "Pekara X Blitz" za €50 i staviti svoj logo. Za pekaru je to reklama, za nas je to prihod + backlink.
→ `/sponsor-a-tournament` self-serve forma + Stripe.

### 9. **Programska preuzimanja** — 500 lendinga za long-tail
Već imamo `seo-content-generator`. Sledeći nivo:
- `/vs/hikaru`, `/vs/magnus`, `/vs/hans` — "kako bi izgledao match" sa AI simulacijom
- `/prep-for/{opening}` — 3-minutna priprema pred meč
- `/rating/{500..2500}` — po jedna strana za svaki rating: šta znaš, šta učiš dalje

Chess.com ima ~50k stranica. Cilj: 5k za 30 dana.

### 10. **News-jacking bot** — automatski članak čim se desi šahovska drama
Cron: skenira šahovske vesti (RSS + Twitter). Čim se desi drama (ban, kontroverza, GM izjava) → za 5 minuta imamo članak sa svojim uglom. Ovo je *kako je Kurir postao Kurir* — brzina, ne kvalitet.
→ Nova `news-jacker` edge funkcija + cron svakih 15 min.

## Šta bih napravio odmah (ovaj sprint)

Ne mogu sve odjednom. Predlažem u ovom redu (svaka stavka je 1 build-turn):

1. `/manifesto` + `/beat-nikola` landing sa live leaderboard-om (najveći PR-magnet).
2. `/streamers/apply` self-serve partner flow (500 novih kanala u pipeline-u).
3. Bot Wars — 20 balkanskih botova sa trash-talk clip-ovima.
4. Sponsor-a-tournament self-serve forma.
5. News-jacker cron.
6. Nasledinici Fischer-a landing (turnir organizujemo posle DB Cup-a).

## Šta neću predložiti (i zašto)

- **Kupovina konkurencije** — nemamo cash-flow Chess.com-a.
- **Skupi influencer deal-ovi** — €10k-100k za jednog GM-a je van budžeta. Umesto toga → 500 mikro-strimera.
- **Sopstvena TV liga** — bez publike prvo, prazna arena. Radimo za 6 meseci kad imamo bazu.

## Tehnički detalji

- Sve nove stranice: statične + JSON-LD + auto-IndexNow ping (već imamo infra).
- Sve nove edge funkcije: `verify_jwt = false` za javne, admin-only za CMS delove.
- Nova tabela `public_challenges` za "Nikola vs Svet" dnevne izazove.
- Nova tabela `streamer_partners` (ili proširiti `partner_applications`) sa affiliate tracking-om.
- News-jacker koristi `LOVABLE_API_KEY` (Gemini) za generisanje ugla za 30s.
- Sponsor-a-tournament preko postojećeg Stripe konektora → `tournament_sponsors` tabela već postoji.

## Pitanje pre nego što krenem

Da li da krenem sa **svih 6 iz "odmah" liste redom** (6 turnova), ili prvo samo **TOP 2 (Manifesto + Beat Nikola)** da vidimo reakciju pre ostalih?
