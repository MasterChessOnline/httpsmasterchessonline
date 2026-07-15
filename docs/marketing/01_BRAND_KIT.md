# Brand Kit — Logo raspored po celom internetu

**Source logo**: `/public/app-icon-512.png` (kruna u zaobljenom crno-zlatnom kvadratu).
Sve dimenzije ispod se generišu iz istog source-a. Alat: [squoosh.app](https://squoosh.app) ili [birme.net](https://www.birme.net) (drag&drop, bez instalacije).

## 1. Gde ide logo (checklist — obeleži kad završiš)

### Google ekosistem
- [ ] **Google Business Profile** — profilna 720×720, cover 1080×608
- [ ] **Google Search Console** — favicon (koristi već postavljeni)
- [ ] **YouTube (DailyChess_12)** — avatar 800×800, banner 2560×1440 (bezbedna zona 1546×423 u centru), video watermark 150×150 PNG transparent
- [ ] **Google Ads** — logo asset 1200×1200 + 1200×300 landscape

### Social — jedan brand svuda
- [ ] **Instagram** — profil 320×320, story highlight covers 1080×1920 (6 komada: Play, Learn, Tournaments, Bots, News, DB Cup)
- [ ] **TikTok** — profil 200×200, video watermark bottom-right
- [ ] **X (Twitter)** — profil 400×400, header 1500×500
- [ ] **Facebook Page** — profil 320×320, cover 820×312
- [ ] **LinkedIn Company Page** — logo 400×400, cover 1128×191
- [ ] **Reddit** (napravi `u/MasterChess_Nikola`) — avatar 256×256, banner 1920×384
- [ ] **Discord** (server ikonica) — 512×512 + role ikonica 64×64
- [ ] **Twitch** (ako radiš stream) — profil 800×800, offline banner 1920×1080
- [ ] **Pinterest** — profil 165×165, board covers 600×600

### Founder / hub sajtovi
- [ ] **ProductHunt** — thumbnail 240×240, gallery 1270×760 × 4 slike
- [ ] **IndieHackers** — logo 512×512, product cover 1200×630
- [ ] **Hacker News** — nema logo polje; koristi OG image u linku
- [ ] **AngelList / Wellfound** — logo 400×400
- [ ] **BetaList** — logo 400×400 + 1200×630 cover
- [ ] **AlternativeTo** — logo 300×300

### Wikipedia / open web
- [ ] **Wikidata** — SVG logo licenciran CC-BY-4.0 (napravi property Q… za Nikola i za MasterChess)
- [ ] **Crunchbase** — logo 400×400
- [ ] **Chess federation Srbije** — logo 300×300 kao klupski simbol

### Email / komunikacija
- [ ] **Email potpis** (Nikola + support) — 600px wide inline PNG
- [ ] **Newsletter header** — 600×200
- [ ] **WhatsApp Business** profilna — 640×640, katalog cover 1080×1080
- [ ] **Signal / Telegram grupe** — 512×512

### Print (za lokalne turnire, škole)
- [ ] **Flajer A5** — 300 DPI PDF sa logom 500px
- [ ] **Sticker** 100×100mm — logo full-bleed
- [ ] **Roll-up banner** 850×2000mm — logo u vrhu

## 2. Kako napraviti sve dimenzije za 5 minuta

1. Otvori https://www.birme.net
2. Drag `/public/app-icon-512.png`
3. Za svaku dimenziju iz tabele → Set canvas size → Download ZIP
4. Ili koristi Figma template (napravi 1 frame po dimenziji, export all)

**Bulk skripta** (ako ti se radi lokalno):
```bash
# treba imagemagick: brew install imagemagick
SRC=public/app-icon-512.png
mkdir -p brand-out
for size in 64 128 200 240 256 320 400 512 640 720 800 1080 1200 2560; do
  magick "$SRC" -resize ${size}x${size} "brand-out/logo-${size}.png"
done
```

## 3. Konzistentnost pravila

- **Uvek** crno-zlatna kombinacija. Ne beli background nikad.
- **Minimalni clear-space**: 20% širine loga okolo (nikad tekst uz ivicu).
- **Uz wordmark**: "MasterChess" (jedna reč, kapitalizovan M i C).
- **Tagline** (opciono, na cover slikama): *"Play chess like a king."*
- **URL uvek**: `masterchess.live` (bez `https://` u vizualu).

## 4. GDE NE STAVLJAMO

- ❌ Chess.com forum avatar / potpis (protivan njihovim TOS + naša brand policy)
- ❌ Lichess forum (isto)
- ❌ Bilo koji "top 10 chess sites" listicle sa affiliate linkovima (spam pool)

## 5. Priority order (šta prvo)

**Danas** (2h posao):
1. GBP profilna + cover
2. YouTube DailyChess_12 avatar + banner + watermark
3. Instagram + TikTok + X profilna
4. Reddit `u/MasterChess_Nikola` avatar + banner
5. WhatsApp Business profilna

**Ove nedelje**:
6. Discord server ikonica + banner
7. LinkedIn Page kreiraj + logo
8. ProductHunt draft (submit tek kad imaš 500 signup — inače propada)
9. Email potpis Nikola i support

**Ovaj mesec**:
10. Wikipedia članak (kada imaš 2+ press članka kao izvor)
11. Wikidata entry
12. Print materijali za lokalne škole/klubove
