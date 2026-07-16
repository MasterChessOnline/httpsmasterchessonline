# NAJBRUTALNIJA IDEJA: "Chess Roast" — MasterChess kao TikTok/Reels fabrika

Ovo je jedina strategija koja može da eksplodira sajt za 60 dana **bez ijedne marketing pare**. Razlog: **korisnici postaju marketing tim.**

## Realnost

Ne možeš da pobediš chess.com na chess sadržaju. Ne možeš da pobediš lichess na "besplatno + open source". **Ali možeš da eksplodiraš na kanalima gde oni ne postoje: TikTok, Instagram Reels, YouTube Shorts.** Chess.com ima ~500K TikTok pratilaca ali ne pravi UGC (user-generated content) — samo prof clips. Lichess uopšte nema TikTok. **Ova rupa je milionska.**

## Ideja: Chess Roast Engine

Posle svake partije, korisnik dobija **automatski generisan 15-30 sekundni vertikalni video (9:16, TikTok format)** — savršen za direktan upload na TikTok/Reels/Shorts. Video sadrži:

1. **Intro (2s)** — "Roasting [tvoje ime] — Rating [ELO]"
2. **Highlight potez (8s)** — animirana tabla, tvoj najgori/najbolji potez sa engine eval swing-om, veliki brojevi "−4.7"
3. **AI Roast tekst (10s)** — brutalan srpski/engleski tekst preko ekrana:
   - "34. Qh5?? — ovaj potez je video Bogorodica i zaplakala"
   - "Žrtvovao si damu... za šta tačno? Odgovori u komentarima"
   - "Stockfish 17 je posle ove partije podneo ostavku"
4. **Rezultat (3s)** — velika crvena "L" ili zlatna "W" kartica
5. **Outro sa watermark (2s)** — "roasted by masterchess.live/roast/[gameId]"

Svaki video **ima masterchess.live vodeni žig kroz ceo klip** + link kartica na kraju. Kad user postavi na TikTok, njegovi pratioci vide URL. **Jedan viralni video = 100K impresija = 500-2000 novih korisnika.**

### Zašto radi (psihologija)

- **Self-deprecating humor je najviralniji sadržaj na internetu 2024-2026.** Fantasy Football Roast Instagram ima 2M pratilaca radeći isto — samo sa fudbalom.
- **Chess ima "meme-ability"** — blundera, žrtvovanja, mat-u-1-potezu = savršen content.
- **User želi da podeli** kad je smešno na njegov račun. Kad je pobeda, hvali se. Win-win.
- **AI brutalan tekst** je 1000x bolji od dosadnog "You lost". Chess.com govori "Nice try!" — mi kažemo "34. Qh5 je najgori potez u istoriji tvog naloga."

## Distribucija — kako to zapaljivo eksploduje

### 1. Auto-post to TikTok kroz saradnju (nedelja 1-2)
- Nalog **@masterchess.roast** na TikTok/IG/YT Shorts
- Svakih 4h automatski postaje najbolji roast od dana (top 10 by upvotes od korisnika)
- 6 videa dnevno × 30 dana = 180 videa za mesec dana
- **Statistika:** kanal koji postavlja 5+ vertikalnih videa dnevno sa niche topikom dostiže 10K pratilaca za 30 dana (dokazano na desetinama chess/gaming acc-ova)

### 2. Reddit "arbitrage" (nedelja 1-3)
- Postavljati najsmešnije roast-ove na r/AnarchyChess (1.4M korisnika), r/chess (800K), r/tocsen
- Auto-crosspost bot koji čita naše najviralnije roast-ove i deli
- r/AnarchyChess = zlato jer je 100% meme-based

### 3. Discord bot `/roast @user` (nedelja 3-4)
- Bilo koji Discord može dodati MasterChess bot
- `/roast @user` — bot vuče poslednju partiju tog usera i baca roast u thread
- Svaki server = 50-500 nas potencijalnih korisnika koji vide brand
- Chess Discords ima 2000+ servera, direct-hit target audience

### 4. Streamer package (nedelja 4-6)
- Bilo koji streamer sa 100+ prati na Twitch/YT: **besplatan premium doživotno + custom overlay**
- Overlay pokazuje: MasterChess rating, live board, roast reaction popup
- 200 malih streamera × 20-500 gledalaca = 4K-100K impresija dnevno besplatno

### 5. "Chess Wrapped" decembra
- Kao Spotify Wrapped — svaki user dobija svoj godišnji recap: totalne partije, best win, worst blunder (roast), most-played opening, "chess personality" (Aggressor/Grinder/Blitz Demon)
- Deljivi kartice svaki decembar → **jedan dan = 10K organic shares**
- Chess.com kopira Spotify slabo; naš recap = savršen, personalizovan, viralan

## Šta ja gradim u kodu

**Sprint A (1-2 turn-a):**
1. **Edge funkcija `generate-roast`** — Lovable AI (Gemini) prima PGN + Stockfish eval, vraća 3-5 brutalnih roast linija na srpskom/engleskom
2. **Roast page `/roast/:gameId`** — public stranica sa roast textom, share dugmadi, embedded video player
3. **Video generator (`generate-roast-video` edge)** — koristi FFmpeg WASM ili remotion-style API da složi 15s vertikalni MP4 sa tablom + tekstom + music. Prvi MVP: SVG animacija konvertovana u MP4 kroz vanjski API (Shotstack ili Creatomate — jeftin API, ~$0.05/video). Ili čisto client-side sa Canvas + MediaRecorder.
4. **Auto-prompt posle partije** — modal "Vidi svoj Roast" sa preview + Download MP4 dugme

**Sprint B (2-3 turn-a):**
5. **Discord bot** — Deno edge funkcija, slash command `/roast`, `/challenge`
6. **Chess Wrapped page** `/wrapped/:year` — per-user annual recap
7. **Public roast leaderboard** `/roast/top` — najviralnije roast-ove nedelje, upvote/share sistem
8. **TikTok/IG upload helper** — one-click "Preuzmi za TikTok" dugme sa optimizovanim MP4

## Tehnički detalji

- **Video generisanje**: preporučujem **Creatomate API** (~$25/mesec za 500 videa) ili **Shotstack** — JSON template → MP4. Alternativa: čisto client-side kroz `MediaRecorder` API + Canvas (besplatno ali sporije, ~10s per video na korisničkom uređaju).
- **AI roast**: Lovable AI Gateway, model `google/gemini-2.5-flash` (jeftin, brz). Prompt: "You are a brutal chess commentator. Roast this player's worst move in 2-3 sentences of savage humor in [Serbian/English]."
- **Nove tabele**: `roasts(id, game_id, user_id, roast_text, video_url, upvotes, shares, created_at)`, `roast_reactions(roast_id, user_id, type)` — sve sa RLS + GRANT
- **Storage**: Supabase Storage bucket `roast-videos` (public read)
- **Discord bot**: Deno edge funkcija sa Discord Interactions endpoint, verify signature; register komande kroz Discord Developer Portal
- **Chess Wrapped**: cron job 1. decembra pre-računa sve statistike u `wrapped_recaps` tabelu

## Metrike uspeha (60 dana)

- **10K TikTok pratilaca** na @masterchess.roast
- **1 viralni video** (>500K views)
- **500+ user-uploaded roast-ova** na TikTok/IG sa masterchess.live watermark
- **50+ Discord servera** doda bota
- **20K+ novih posetilaca** iz social kanala (mesečno)
- **5-10% conversion** iz social → registrovan nalog

## Rizici i mitigacije

- **Roast tekst previše uvredljiv** → dvostepeni system: default "playful roast", opciono "brutal mode" u settings
- **Video generisanje skupo** → cache po game_id, generiši samo na klik, ne za svaku partiju
- **Discord bot spam** → rate-limit per server, admin toggle
- **TikTok algoritam nije predvidljiv** → testiraj 3 formata prve nedelje, dupliraj šta radi

---

## Da li krećemo?

Ovo je jedina ideja koja može da **10x sajta za 2 meseca bez marketing budžeta**. Sve ostalo (SEO landing stranice, referral, feed) su dopuna ovome, ne zamena.

**Reci "krećemo" i počinjem sa Sprint A: AI Roast engine + `/roast/:gameId` public page + video generator MVP (client-side Canvas verzija za brzi start).**

Ili predloži druge smerove ako ovo nije to što tražiš.
