
# Plan: TOP 3 fičera koje preporučujem (BEZ puzzle-a)

Pošto je sajt već ogroman i kompleksan, preporučujem **fokusiran paket od 3 fičera** umesto svih 15 odjednom. Ovo su tri koja po mom mišljenju daju **maksimalan efekat** (zadržavanje korisnika + viralnost) uz **minimalan rizik** lomljenja postojećeg koda.

Niti jedan od ovih ne dira tvoja postojeća pravila (bez puzzle-a, bez AI analize u ljudskim partijama, samo DailyChess_12 YouTube sadržaj).

---

## 🏆 FIČER #1 — Daily Streak Rewards + Daily Missions

**Zašto:** Ovo je #1 razlog zašto se ljudi svaki dan vraćaju na chess.com i Duolingo. Trenutno tvoj sajt nema ništa što "zove" igrača da dođe sutra.

**Šta dobijaš:**
- "Login streak" brojač na homepage-u (🔥 7 dana zaredom)
- Sistem od 3 dnevne misije koje se resetuju u ponoć:
  - "Odigraj 3 partije"
  - "Pobedi protiv bota"
  - "Pogledaj 1 lekciju iz /learn"
- Nagrade: XP boost, badge-evi, otključavanje board tema
- Vizuelni "claim reward" modal sa konfetama kad ispuniš misiju
- Streak insurance: 1 "freeze" dnevno da ne izgubiš streak ako preskočiš dan

**Gde se dodaje:**
- Nova kartica na `/` (homepage dashboard) — Daily Missions widget
- Nova stranica `/missions` (pun pregled + istorija)
- Notifikacija u headeru kad nova misija postane dostupna

---

## 🏆 FIČER #2 — Replay Highlights (Share-to-TikTok/Instagram)

**Zašto:** Ovo je **besplatan organic marketing**. Svaki put kad neko podeli highlight, sajt dobija reklamu. Niko od konkurencije nema ovo dobro odrađeno.

**Šta dobijaš:**
- Posle završene partije → dugme "Create Highlight"
- Automatski detektuje **3 najbolja momenta** iz partije:
  - Najveća promena u materijalu (capture queen, fork)
  - Mat ili matni napad
  - Spektakularna žrtva (sacrifice)
- Generiše animirani video/GIF (9:16 format za TikTok/Reels):
  - Tvoj brand watermark u uglu
  - Imena igrača + rating
  - Animacija poslednjeg poteza
  - "Play on MasterChess" CTA na kraju
- Download dugme + direct share na Twitter/X, Instagram, TikTok
- Galerija highlight-a na profilu (`/profile/:id` → nova kartica "Highlights")

**Gde se dodaje:**
- Novi modal/screen na kraju partije
- `/profile/:id` → nova kartica "Highlights"

---

## 🏆 FIČER #3 — Rivalry System (Head-to-Head)

**Zašto:** Stvara **lične priče**. "Moram da pobedim Marka, vodi me 3-2." Ovo drži ljude da igraju 10x duže nego anonimni matchmaking.

**Šta dobijaš:**
- Automatski detektuje "rival" — bilo ko sa kim si igrao 3+ partije
- Kartica na profilu: "Top 5 rivala"
  - Win/Loss/Draw record
  - Trend (poslednjih 5 partija — zelene/crvene tačke)
  - "Challenge to rematch" dugme
- Kad ti rival dođe online → notifikacija: "Marko je online. Revanš?"
- Posle pobede protiv rivala: posebna animacija + bonus XP
- "Rivalry Stats" mini-stranica (`/rivals`):
  - Sve istorijske partije
  - Grafikon ko vodi kroz vreme
  - Najduži win streak protiv svakog rivala

**Gde se dodaje:**
- `/profile/:id` → nova kartica "Rivals"
- Nova stranica `/rivals`
- Notifikacija u headeru kad rival dođe online

---

## ❌ Šta NE radim u ovoj iteraciji (i zašto)

| Ideja | Razlog odlaganja |
|-------|------------------|
| Battle Pass | Velik posao (30+ rewarda, sezonski sistem) — radimo posle ako #1 uspe |
| Arena Royale | Potpuno novi game mode, rizik od bagova u matchmaking-u |
| Voice Chat | WebRTC kompleksnost, moderation problemi |
| Trash Talk pack | Mala vrednost vs trud |
| Push Notifs | Treba PWA setup, kompleksno |
| Email Digest | Već imaš email infra, ali nije prioritet bez prvih 3 |
| Chess Variants (960, KOTH) | Nije fokus za sticanje korisnika |
| Trophy Room | Već imaš badge sistem, marginalan dodatak |
| Clan Wars | Već imaš klubove — proširenje za posle |
| Voice Coach | AI eksperiment, nepouzdano |

---

## 🛠️ Tehnički detalji (za znalce)

**Nove tabele:**
- `daily_missions` — definicije misija (admin-managed)
- `user_mission_progress` — koliko si ispunio za današnji dan
- `user_streaks` — login streak counter, freeze used
- `game_highlights` — sačuvani highlight-i (game_id, timestamps_json, video_url)
- `rivalries` — auto-generated view ili tabela (user_a, user_b, w/l/d, last_played)

**Nove edge funkcije:**
- `daily-missions-reset` (cron, ponoć) — reset progress
- `generate-highlight` — primi game PGN + vrati video URL (koristi serverless renderer ili client-side canvas → mp4)
- `detect-rivals` — periodično računa rival listu

**Nove rute:**
- `/missions`
- `/rivals`

**Postojeće stranice koje se diraju:**
- `/` (homepage) — dodati Missions + Streak widget
- `/profile/:id` — dodati "Highlights" + "Rivals" kartice
- Game end screen — dodati "Create Highlight" dugme
- Header — notification bell

**Storage:**
- Novi bucket `highlights` (public) — za .mp4/.gif fajlove

---

## 📅 Redosled implementacije

1. **Daily Streak + Missions** prvo (najjednostavniji, najveći retention impact)
2. **Rivalry System** drugi (srednje kompleksan, koristi postojeće online_games podatke)
3. **Replay Highlights** poslednji (najkompleksniji jer treba video generation)

Svaki fičer ide u zasebnoj iteraciji da možemo testirati pre nego što krenemo na sledeći.

---

## ✅ Šta dalje?

Ako odobriš ovaj plan, krećem od **Fičera #1 (Daily Streak + Missions)**. Ako želiš drugačiji redosled ili da izbacimo/dodamo nešto, reci sad.
