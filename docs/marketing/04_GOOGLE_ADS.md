# Google Ads — copy-paste launch playbook

**Ukupni budžet preporuka**: €15–€20/dan (€450–€600/mesec) za prva 30 dana.

## 1. Kampanja: Search — English (worldwide, excl. IN/PK/BD)

**Budžet**: €5/dan · **Bid strategy**: Manual CPC · **Max CPC**: €0.15 (long-tail), €0.05 (brand)

### Ad Group 1: "Play free"
**Keywords** (Modified broad + Phrase match):
```
"play chess online free"
"free chess site"
"chess online no signup"
"chess without ads"
"play chess free browser"
+chess +online +free +no +ads
"best free chess site 2026"
```

**Negative keywords** (kampanja-wide):
```
-download -apk -mod -hack -cheat -bot -script -3d -unity
-multiplayer -android -ios -pc -download -tutorial
-jobs -salary -course -certification -degree
```

**Landing page**: `https://masterchess.live/play-guest`

**Responsive Search Ad** (15 headlines, 4 descriptions):
```
Headlines:
1. MasterChess — Free Online Chess
2. Play Chess. No Ads. No Signup.
3. Chess vs Bots or Real Players
4. Join Free Chess Tournament July 18
5. Stockfish Analysis on Every Game
6. Play Instantly in Your Browser
7. 9 Bot Personalities · 400-2000 ELO
8. Free Chess for Beginners & Pros
9. Swiss Tournaments · Real-time
10. Learn Openings the Fun Way
11. Chess Without the Bloat
12. Made by a 13-Year-Old Solo Dev
13. Open Board. No Login Needed.
14. DB Chess Cup — Free Entry
15. Play a Grandmaster Bot Free

Descriptions:
1. Free online chess against players or bots. No ads, no signup. Stockfish analysis included.
2. Join the DB Chess Cup July 18 — free entry, Swiss format. All ratings welcome.
3. Built by a 13-year-old solo developer. Open board, learn faster, play more.
4. 9 bot personalities from beginner to master. Instant play. Zero subscription.
```

**Sitelinks**:
- Play Now → `/play-guest`
- Bots → `/play`
- Tournaments → `/dragan-brakus`
- Learn → `/learn`

**Callouts**: `100% Free` · `No Ads` · `No Signup Required` · `Instant Play` · `Made in Belgrade`

---

### Ad Group 2: "vs Bots"
**Keywords**: `chess vs computer`, `chess bots`, `beat chess bot`, `play chess ai free`, `chess computer opponent`, `chess practice bot`
**Landing**: `/play` (bot select)

### Ad Group 3: "Tournaments"
**Keywords**: `online chess tournament 2026`, `free chess tournament`, `swiss chess tournament online`, `chess event july 2026`
**Landing**: `/dragan-brakus`

### Ad Group 4: "Learn"
**Keywords**: `learn chess online`, `chess openings trainer`, `chess for beginners free`, `chess endgames practice`
**Landing**: `/learn`

### Ad Group 5: "Kids"
**Keywords**: `chess for kids online`, `chess lessons for kids free`, `kids chess website safe`
**Landing**: `/learn` (child-safe messaging)

### Ad Group 6: Brand defense
**Keywords**: `masterchess`, `master chess live`, `masterchess.live`
**Max CPC**: €0.03 · **Landing**: `/`

---

## 2. Kampanja: Search — Serbian (Srbija, Crna Gora, BiH, HR)

**Budžet**: €3/dan · **Max CPC**: €0.10

### Ad Group 1: General SR
**Keywords**:
```
"šah online besplatno"
"igrati šah online"
"šah bez reklama"
"šah protiv kompjutera"
"učenje šaha online"
+besplatan +šah +online
```

**Headlines**:
```
1. MasterChess — Šah Online Besplatno
2. Igraj Šah Bez Reklama
3. DB Chess Cup 18. jula — Prijava besplatna
4. 9 Botova · Od 400 do 2000 ELO
5. Analiza svake partije (Stockfish)
6. Napravio 13-godišnjak iz Beograda
7. Otvori tablu i igraj — bez naloga
8. Švajcarski turniri uživo
9. Šah za početnike i majstore
10. Trenaži otvaranja u pauzi
```

**Descriptions**:
```
1. Igraj šah besplatno protiv igrača ili botova. Bez reklama, bez naloga. Stockfish analiza.
2. Prijavi se za DB Chess Cup 18. jula. Švajcarski sistem, besplatno, svi rejtinzi.
3. Napravio ga trinaestogodišnji programer iz Beograda. Bez reklama, zauvek.
```

### Ad Group 2: DB Cup SR
**Keywords**: `šahovski turnir online`, `blitz turnir besplatan`, `dragan brakus cup`, `šah turnir jul 2026`
**Landing**: `/dragan-brakus`

---

## 3. Kampanja: Performance Max — DB Cup (do 19. jula)

**Budžet**: €10/dan · **Goal**: Sign-ups + tournament registrations

**Asset groups**:
- 5 slika (screenshots + Nikola portret + logo)
- 5 headlines (koristi iz Search Ad Group 3)
- 5 long headlines: `Join the DB Chess Cup — July 18, 2026 · Free Entry · Made by 13-Year-Old Solo Dev`
- 3 videa (15s Reels format — vidi `06_META_TIKTOK_ADS.md`)
- Final URL: `/dragan-brakus`

**Audience signals**:
- Interests: Chess, Board Games, Chess.com visitors, Lichess visitors
- Custom: people who searched "chess tournament 2026"
- Demographics: 18-45, all genders

**Conversion goal**: `signup_completed` (import iz GA4)

---

## 4. Kampanja: YouTube pre-roll (skippable in-stream)

**Budžet**: €3/dan · **Bid**: Target CPV €0.02

**Placement targeting** (specific channels):
- GothamChess (UCXy10-NEFGxQ3b4NVrzHw1Q)
- Levy Rozman
- ChessNetwork
- Anna Cramling
- Hikaru Nakamura (GMHikaru)
- Chess.com official
- Lichess

**Audience**: Custom intent — searched for chess terms in past 7 days

**Video**: 15s Nikola story (vidi `07_YOUTUBE_TIKTOK_ORGANIC.md` skripta #1)

---

## 5. Conversion tracking setup

**Preduslov**: GA4 aktiviran (vidi `09_ANALYTICS_SETUP.md`)

U Google Ads → Tools → Conversions → Import from GA4:
- `signup_completed` — value €2
- `game_started` — value €0.50
- `tournament_registered` — value €5
- `pwa_installed` — value €3

**Attribution**: Data-driven (default)

---

## 6. Dnevna rutina (10 min/dan)

**Ujutru**:
1. Otvori Google Ads → Overview
2. Pogledaj CTR poslednjih 24h
3. **Pauziraj ad ako CTR < 0.8%** posle 500 impresija
4. **Povećaj bid 20%** ako CTR > 3% i pozicija > 3

**Nedeljno**:
- Pregled Search Terms Report — dodaj nove negatives
- Prebaci top keyword iz Broad u Exact match
- A/B test 2 nova headline-a

---

## 7. Kada da ubiješ / povećaš

| Signal | Akcija |
|---|---|
| CTR < 0.8% | Pauziraj ad, promeni headline |
| CTR > 4% + CPA < €5 | +50% budžet |
| Impresije < 100/dan | +30% bid |
| Impresije > 5000/dan + CTR < 1.5% | Uži targeting |
| 0 konverzija posle €30 potrošeno | Pauziraj ad group, ne kampanju |

---

## 8. Budget escalation plan

- **Nedelja 1**: €15/dan (validation)
- **Nedelja 2**: €25/dan (ako CPA < €5)
- **Nedelja 3**: €40/dan (skaliranje winners)
- **Nedelja 4**: €60/dan (DB Cup final push, potroši sve na PMax)

**Kill switch**: ako CPA > €15 dve nedelje, pauziraj sve Search i vrati budžet u PMax + Meta.

---

## 9. Google Ads Coupon (BESPLATNO €400)

**Kako dobiti**:
1. Napravi novi Google Ads nalog
2. Nakon potrošenih prvih €400, dobijaš €400 kupon (dostupno u SR)
3. Ili — kontaktiraj lokalnog Google Partner-a (npr. IN Rating), oni imaju kupone za nove klijente

Ovo ti dupla budžet za nedelju 3-4.
