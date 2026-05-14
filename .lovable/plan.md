## Phase 3 — Završni "Explode" Plan

Sajt već ima: Daily Missions, Streaks, AI Coach, Trust Strip, Fair Play, Referrals, 73 SEO ruta. Evo šta još fali da pređe iz "dobrog" u "viralno":

### 1. Viral Share Cards (najveći growth lever)
- Edge funkcija `share-card` koja generiše PNG (1200x630) posle pobede: avatar, ELO change, opening name, brand watermark
- Auto-prompt "Share your win" modal posle ranked pobede
- OG meta tags na `/players/:username` i `/game/:id` da preview izgleda profesionalno na X/WhatsApp/Reddit
- **Zašto:** svaki share = besplatan backlink + social proof

### 2. Public Player Profiles (`/players/:username`)
- Indexabilna stranica: ELO, win rate, omiljeni opening, last 10 games, badges
- JSON-LD `Person` schema za Google rich results
- Sitemap auto-update za top 500 igrača
- **Zašto:** stotine novih indexed stranica + ego loop (ljudi guglaju sami sebe)

### 3. "Beat the Bot in 60s" Homepage Hook
- Bez signup-a — odmah klik = igra protiv lakog bota
- Posle gubitka/pobede → CTA "Save your rating" (signup)
- **Zašto:** rušenje friction barijere, conversion booster

### 4. Push Notifications + Email Digest
- Browser push: streak će ti isteći za 2h, novi daily challenge, neko te izazvao
- Weekly email digest (opt-in): tvoj rating trend, top opening, klub novosti
- **Zašto:** vraća korisnike kad zatvore tab

### 5. Embeddable Widget za Streamere
- `<iframe src="masterchess.live/embed/board/:gameId">` — live board sa watermarkom
- Stranica `/embed-tools` sa copy-paste kodom
- **Zašto:** svaki stream = besplatna reklama

### 6. PWA + Offline
- `manifest.json` + service worker (offline bot play)
- "Add to Home Screen" prompt
- **Zašto:** mobile retention, push notifications, app-feel

### 7. Real-Time Activity Pulse na Homepage
- Live feed: "Marko (1450) just beat Ana (1480) in Sicilian" (samo realni events iz `online_games`)
- "X people playing right now" counter
- **Zašto:** FOMO + social proof, ali strogo real data (Core rule)

### 8. Strukturni SEO bust
- FAQ schema na `/openings/*` stranicama
- HowTo schema na `/learn/*` člancima
- Breadcrumb schema svuda
- `hreflang` tags ako planiraš srpski/engleski

### Tehnički detalji (za dev)
- Nove tabele: `share_cards_log`, `push_subscriptions`, `email_preferences`, `player_profile_views`
- Nove edge funkcije: `share-card` (PNG gen sa @vercel/og ili Satori), `send-push`, `weekly-digest` (cron)
- Nove rute: `/players/:username`, `/embed/board/:id`, `/embed-tools`
- Service worker: `public/sw.js` + register u `main.tsx`

### Redosled (preporuka)
1. **Share Cards + OG tags** (najveći viral ROI)
2. **Public Player Profiles** (SEO masa)
3. **Beat-the-Bot homepage hook** (conversion)
4. **PWA + Push** (retention)
5. **Activity Pulse** + **Embed Widget** + **Schema SEO** (polish)

Reci **"kreni 1"** za share cards, ili **"sve redom"** da krenem od vrha.
