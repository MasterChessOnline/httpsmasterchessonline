# Meta / Instagram / TikTok Ads

**Ukupni test budžet**: €90 (€3/dan × 3 platforme × 10 dana)

## 1. Meta Pixel + TikTok Pixel setup

Vidi `09_ANALYTICS_SETUP.md` za tehnički deo. Preduslov pre pokretanja bilo koje kampanje.

## 2. Ad kreative — 10 varijanti (9:16, 15 sekundi)

Svaki reels/tiktok mora imati:
- **Hook** u prve 2s (bez ovog, 80% preskoči)
- **Value** (šta dobijaju)
- **CTA** poslednji frame (URL + logo)

### Kreativa #1 — "13-year-old founder" (glavni hook)
**Hook (0-2s)**: Text overlay preko crno-zlatnog background: *"I'm 13. I built a chess site. Alone."*
**Body (2-10s)**: Screen recording — brzi klip Nikole kako igra na sajtu, prikazuje bot arenu, klik na "Play"
**CTA (10-15s)**: *"Free. No ads. masterchess.live"* + logo bounce animacija

### Kreativa #2 — "Beat this bot"
**Hook**: *"Can you beat me in 10 moves?"*
**Body**: Board sa pozicijom + timer. Text: "Bot #7 · 1800 ELO"
**CTA**: *"Try free → masterchess.live"*

### Kreativa #3 — "Chess.com without ads"
**Hook**: *"Chess.com but no ads."*
**Body**: Side-by-side comparison screenshot — Chess.com ad-heavy vs MasterChess clean
**CTA**: *"Free forever. masterchess.live"*

### Kreativa #4 — "500 free coins"
**Hook**: *"500 free coins. Yours in 30 seconds."*
**Body**: Signup flow speed-run (15s registracija)
**CTA**: *"Grab them → masterchess.live"*

### Kreativa #5 — "DB Cup FOMO"
**Hook**: *"127 players. 3 days left."*
**Body**: Countdown timer + registered players ticker (screenshot iz sajta)
**CTA**: *"Free entry → masterchess.live/db-cup"*

### Kreativa #6 — "Puzzle challenge"
**Hook**: *"You have 5 seconds. Find mate in 2."*
**Body**: Prikaži poziciju, timer, na kraju rešenje
**CTA**: *"1000+ more puzzles → masterchess.live/puzzles"*

### Kreativa #7 — "Speedrun bot demolition"
**Hook**: *"Watch me destroy a 1600 bot in 12 moves"*
**Body**: Full game timelapse sa clock + evaluation bar
**CTA**: *"Play me → masterchess.live"*

### Kreativa #8 — "For kids and parents" (Meta only)
**Hook**: *"Chess. No ads. No pay-to-play. For your kid."*
**Body**: Dete koje igra na tabletu, roditelj gleda, oboje smeju
**CTA**: *"Safe & free → masterchess.live"*

### Kreativa #9 — "Serbian pride" (TikTok SR + Meta SR)
**Hook**: *"Napravio sam ovo sam. Imam 13 godina."*
**Body**: Nikola u sobi, montaža rada, sa titlom
**CTA**: *"Podrži Beograđanina → masterchess.live"*

### Kreativa #10 — "Play me live"
**Hook**: *"Play me right now. I'm online."*
**Body**: Screen ka onlajn statusu na profilu + poziv
**CTA**: *"Challenge me → masterchess.live/@Nikola"*

---

## 3. Audience targeting matrix

### Meta / Instagram

**Test 1: Interest — Chess enthusiasts**
- Interests: Chess (game), Chess.com, Lichess, Magnus Carlsen, Hikaru Nakamura, Chess24
- Age: 18-45
- Placement: Reels + Feed
- Countries: US, UK, DE, IN (chess-heavy)

**Test 2: Interest — Board games broader**
- Interests: Board games, Puzzle games, Strategy games, Sudoku
- Age: 25-55
- Placement: Feed only

**Test 3: Retargeting (posle 100 posetilaca)**
- Custom Audience: Website visitors last 30 days
- Ad: Kreativa #4 ("500 free coins" — reduce friction)

**Test 4: Lookalike (posle 100 signup)**
- Source: DB Cup registrants
- Lookalike 1% US + UK

**Test 5: Serbia local**
- Interests: Chess (game) + Location Serbia
- Language: Serbian
- Ad: Kreativa #9

### TikTok

**Test 1: Chess hashtag audience**
- Hashtag interests: #chess, #chesstok, #chessmoves, #chessblunder
- Age: 13-34
- Placement: In-feed video

**Test 2: Learning audience**
- Interests: Education, Puzzle games, Brain training
- Age: 18-45

**Test 3: Serbia + region**
- Location: RS, HR, BA, ME
- Language: SR
- Ad: Kreativa #9

---

## 4. Budget alokacija (30 dana)

| Nedelja | Meta | TikTok | Ukupno | Fokus |
|---|---|---|---|---|
| 1 | €3/dan × 3 ads | €3/dan × 3 ads | €126 | Testiranje |
| 2 | €5/dan (top 2 ads) | €5/dan (top 2 ads) | €140 | Skaliranje |
| 3 | €7/dan (top 1 ad) | €5/dan (top 1 ad) | €168 | Retargeting live |
| 4 | €10/dan (retargeting + LAL) | €7/dan (top ad) | €238 | DB Cup push |
| **Total** | | | **€672** | |

## 5. Optimization pravila

**Ubij ad ako**:
- CTR < 1.2% (TikTok < 1.8%) posle 3000 impresija
- CPC > €0.50 (Meta) ili > €0.25 (TikTok)
- CPA > €10 signup posle €30 spent

**Skaliraj ad ako**:
- CTR > 3% (Meta) ili > 5% (TikTok)
- CPA < €3 → +50% budžet dnevno

**Nikad ne menjaj ad set posle 48h** (učeći period se resetuje)

---

## 6. Meta Creative Studio tips

- **Prvi frame** = ključan. Postavi text overlay UN ključan momenat.
- **Bez zvuka gledaju 85%** — koristi titlove uvek.
- **Font**: Sans-serif, minimum 40pt, sa outline za čitljivost preko bilo koje pozadine.
- **Logo watermark** stalno bottom-right (mali, ne prekriva sadržaj).

## 7. TikTok specific

- **Native feel > polished**: TikTok publika mrzi ad-y videe. Snimaj telefonom, ne DSLR.
- **Trend audio**: Koristi trending sound-e (TikTok Creative Center → Sounds → Popular)
- **Hashtag mix**: 3 large (#chess 2M) + 3 medium (#chessmoves 300K) + 3 niche (#chessblunders 50K)
- **Post nativno prvo, boost tek posle** ako organski uhvati 10K+ views

---

## 8. Kontrolni panel

Vodi Google Sheet:
| Datum | Platform | Ad # | Impressions | CTR | CPC | Signups | CPA |
|---|---|---|---|---|---|---|---|

Ažuriraj svakog dana u 20h. Ubij losije od proseka svake nedelje.
