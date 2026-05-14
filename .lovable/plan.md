## Plan — "Explode" preko Google slika i društvenih mreža

Cilj: maksimalno povećati šanse da se MasterChess pojavljuje u Google pretrazi, Google Images i da svaka deljena URL izgleda profesionalno na X/WhatsApp/Reddit/Facebook/LinkedIn.

### Šta je već urađeno (status)
- Sitemap index sa 156+ URL-ova (statički + 60 opening landing pages + image sitemap)
- Robots.txt dozvoljava Googlebot-Image + AI crawlere (GPT, Claude, Perplexity)
- GSC verifikacija + svi sitemapi submit-ovani
- IndexNow ključ postoji (`public/indexnow-key.txt`)
- ShareWinCard komponenta (canvas 1200×630) za viralno deljenje pobeda
- `/topics` hub stranica koja distribuira link juice
- Osnovni Seo komponenta sa OG tagovima

### Šta NIJE urađeno (ovo je plan)

**1. Pravi OG slike po stranici (Google Images + social previews)**
- Edge funkcija `og-image` koja generiše PNG 1200×630 po ruti (opening name, ELO badge, brand)
- Per-route `og:image` u Seo komponenti za sve 60 opening stranica + 25 learn članaka
- `twitter:image` + `og:image:width`/`height` meta tagovi
- Rezultat: ~85 unikatnih slika u Google Images, lepi previewi na svakom share-u

**2. IndexNow auto-ping (instant indexing)**
- Edge funkcija `indexnow-ping` koja šalje URL listu na Bing/Yandex/Seznam endpoint
- Trigger pri build-u (sve URL-ove iz sitemap-a) + pri novim blog postovima
- Bonus: Google Indexing API (samo za JobPosting/BroadcastEvent zvanično, ali često prolazi i za ostalo)

**3. Image sitemap proširen sa pravim slikama**
- Trenutno svaka opening pokazuje isti `/og-image.jpg` — beskorisno za Google Images
- Generiši po jednu sliku po opening-u (chess board screenshot ili dinamički OG) i upiši ih u `sitemap-images.xml` sa unikatnim title/caption koji sadrži keyword

**4. Strukturni schema markup (rich snippets na Google)**
- `FAQPage` schema na svim 60 opening stranica (3-5 Q&A po opening-u)
- `HowTo` schema na `/learn/how-to-*` člancima (već imamo 6 ovakvih)
- `BreadcrumbList` schema globalno (Header → Sekcija → Stranica)
- `VideoObject` schema na `/live` (DailyChess_12 video embed)
- Rezultat: rich results u SERP-u = 2-3× viši CTR

**5. Social sharing dugmad svuda**
- `<ShareButtons>` komponenta (X, WhatsApp, Reddit, Facebook, LinkedIn, Telegram, copy link)
- Dodati na: opening landing, blog/learn članke, game review, player profile
- Pre-popunjen text + UTM parametri za tracking (`?utm_source=share&utm_medium=x`)

**6. Backlink magneti (linkovi koji stvaraju linkove)**
- `/embed-tools` već postoji — dodati: PNG board generator, FEN→image API, opening trainer iframe
- "Powered by MasterChess" watermark u svakom embed-u (svaki sajt koji embed-uje = backlink)
- Free tools koji rangiraju: PGN viewer, ECO opening database, blunder checker

**7. PWA + share target (mobile reach)**
- `manifest.json` već postoji — dodati `share_target` API tako da kad neko deli PGN/FEN sa drugog app-a, MasterChess se pojavi kao opcija
- Push notifikacije za daily puzzle (retention loop koji vraća ljude → više share-ova)

**8. Sitemap proširenje**
- Dodati javne player profile (`/players/:username`) za top 500 igrača — auto-generated u sitemap
- Dodati game share linkove (`/game/:id`) za public games
- Cilj: 500-1000+ indexed URL-ova

### Tehnički sažetak (za dev)
- **Edge funkcije:** `og-image` (Satori/canvas), `indexnow-ping` (cron + on-demand)
- **Nove komponente:** `ShareButtons.tsx`, `Breadcrumbs.tsx` sa JSON-LD
- **Izmene:** `Seo.tsx` (per-route og:image), `OpeningLanding.tsx` (FAQ schema), `LearnArticle.tsx` (HowTo schema), `generate-sitemap.ts` (per-page images, profile slugs)
- **Nove rute:** `/players/:username` (već u planu iz `.lovable/plan.md`)
- **Backend:** novo polje `og_image_url` na opening data, profili sa public flag

### Redosled (preporučujem ovaj prioritet)
1. **Per-page OG slike + FAQ schema** (najveći SEO ROI, vidi se u 1-2 nedelje)
2. **Share dugmad svuda + UTM tracking** (odmah viralni efekat)
3. **IndexNow auto-ping** (Bing/Yandex indeksiraju za 24h umesto 2 nedelje)
4. **Backlink magneti (embed tools)** (dugoročni efekat, gradi domain authority)
5. **Player profili + sitemap proširenje** (masa novih indexed stranica)

Reci **"sve redom"** da krenem od vrha, ili broj (npr. **"1 i 2"**) za selektivno.
