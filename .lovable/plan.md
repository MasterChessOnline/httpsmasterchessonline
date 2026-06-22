# MasterChess — "Sve odjednom" plan (PWA fokus)

Spec ti je ogroman (5 sekcija + GSC + Maps + voice chat + nove ideje). Da ne bih sve gurnuo u jedan loš commit, ovo je **realistični plan po fazama**. Krećem od Faze A odmah po odobrenju, ostalo sukcesivno.

---

## FAZA A — Odmah (1 iteracija, sada)

### A1. Google Search Console — auto verify za masterchess.live
- Edge fn `gsc-verify-domain`: poziva `siteVerification/v1/token` (META metoda) preko GSC connector gateway-a
- Snimam token u `site_config` (`gsc_meta_token`)
- Ubacujem `<meta name="google-site-verification" content="...">` u `index.html` (već postoji prazan slot? ako ne, dodajem)
- Admin dugme na `/admin/seo-console` → "Verify domain in Google Search Console" → poziva fn → automatski poziva verify + dodaje sajt u GSC properties

### A2. Google Maps — Custom Domain Setup Wizard
- Nova stranica `/admin/maps-setup` sa step-by-step checklistom (4 koraka iz docs/GOOGLE_MAPS_INTEGRATION.md)
- Live test dugme: "Test API key on masterchess.live" → poziva edge fn koja proverava da li `places/v1/places:searchText` radi sa custom ključem
- Status badge u admin SEO console: 🟢 Working / 🔴 Referrer denied

### A3. Voice Chat — Quick polish
- "Push-to-talk" mode (drži razmaknicu = mikrofon živ, otpusti = mute) — manje awkward nego stalno otvoren mic
- Voice activity indicator (zlatni ring oko avatara protivnika dok priča)
- Auto-mute kad protivnik napravi potez (da se ne čuje šum dok razmišljaš)

### A4. PWA install prompt (manifest-only, već imamo manifest)
- Smart install banner: prikazuje se posle 3. partije, ne odmah (manje annoying)
- Tracking event `pwa_install_prompt_shown` / `pwa_installed`

---

## FAZA B — Sledeća iteracija (kad mi javiš GO)

### B1. AI Voice Coach u MasterCourse (iz tvog Android spec-a)
- Tap-na-potez u `/learn/:lessonId` → poziva `nikola-tts` sa generisanim engleskim objašnjenjem (template + Stockfish kontekst)
- Template: "White moves the {piece} to {square}. This is a {classification} move because {reason}."
- Cache izgovorenih objašnjenja po (FEN + move) ključu u `audio_cache` storage bucket-u (jeftinije, brže)
- Toggle dugme "🔊 Coach voice ON/OFF" u lesson header-u

### B2. Share Analysis Card (proširenje SharePositionCard)
- Posle finished game: 1080×1080 PNG sa Accuracy %, Best move, # mistakes/blunders, final position thumbnail
- "Challenge my score" deep link → `/vs/{shareCode}` (postoji)
- Native Web Share API (već radi) + per-platform pretext: IG, X, WA, Telegram, Discord

### B3. Daily Challenges hub konsolidacija
- Unified `/daily` route koji u tabovima zove postojeće: DailyPuzzle, DailyMate, DailyKing, DailyChallenge
- Single XP/coin/streak source of truth
- Push notification scheduler (1× dnevno, 18:00 lokalno) ako je streak > 2 dana

---

## FAZA C — Ideje na backlog-u (ne radim sad, samo lista za diskusiju)

| # | Ideja | ROI | Vreme |
|---|-------|-----|-------|
| 1 | **Google Static Maps OG za /chess/:city** stranice (slika grada + pin) → bogatije social share preview | High SEO | 2h |
| 2 | **GBP auto-publish "Player of the week"** post (već imamo `publish-gbp-posts` cron) | Med | 1h |
| 3 | **Places Autocomplete** za turnirske venue lokacije u Tournament create formi | Med | 2h |
| 4 | **"Get directions" CTA** na svakom venue na /near-me i /chess/:city | Med | 30min |
| 5 | **Weather/Pollen widget** za outdoor turnire (Google Weather API kroz connector) | Low | 2h |
| 6 | **Country leaderboard 3D globe** (react-globe.gl) sa pin-ovima top igrača | High wow | 4h |
| 7 | **Voice messages u chat-u** (record 5s, šalji kao Opus blob u Supabase storage) | Med-high | 3h |
| 8 | **AI Coach summary posle partije** (text + TTS): "Tvoja partija u 30 reči" + audio play | High retention | 3h |
| 9 | **Auto-generated YouTube Shorts** od top game snippet-a (h2h ko može + ffmpeg) — eksperiment | Low | 1d+ |
| 10 | **"Replay my game" QR code** na štampanom certifikatu | Low | 1h |

---

## Šta odobravaš?

- **(A)** Faza A sva 4 podzadatka — krećem odmah
- **(A + B1)** Faza A + AI Voice Coach (najveći item iz tvog spec-a)
- **(custom)** napiši šta tačno hoćeš prvo, npr. "Faza A bez voice chat-a + B2 share card"
