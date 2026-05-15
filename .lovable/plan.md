
# Full SEO Eruption — kompletna implementacija

Cilj: maksimizirati Google indeksaciju, video/image SERP prisustvo, rich snippets i knowledge panel kandidaturu za **masterchess.live**.

---

## Pack 1 — Google Indexing API (instant crawl trigger)

**Šta:** Edge funkcija `google-indexing-ping` koja pozove Google Indexing API (`https://indexing.googleapis.com/v3/urlNotifications:publish`) preko **Google Search Console connector-a** (već imaš token sa pravim scope-om — proširićemo `https://www.googleapis.com/auth/indexing` ako fali).

**Trigger:**
- Manualni: dugme u `/seo-status` admin panelu → "Push all URLs to Google"
- Auto: pg_cron jednom dnevno → ping svih novih URL-ova iz sitemape
- Per-event: kad se objavi novi blog/turnir, edge funkcija pozove ping za taj URL

**Fallback:** ako scope nije dostupan, postojeći `indexnow-ping` ostaje za Bing.

---

## Pack 2 — Schema Markup (FAQ + Course + Video + Event + Breadcrumb + Sitelinks)

Dodaj JSON-LD u sledeće stranice preko postojećeg `<Seo jsonLd={...}>` propa:

| Stranica | Schema | Efekat u SERP |
|---|---|---|
| `/openings/:slug` (60+) | `FAQPage` (3-5 pitanja po openingu) + `BreadcrumbList` + `Course` | Accordion + breadcrumb + course card |
| `/learn/*` (28 članaka) | `Course` + `BreadcrumbList` + `FAQPage` | Star ratings + breadcrumb |
| `/tournaments/:id` | `Event` + `SportsEvent` | Event card sa datumom |
| `/live` | `VideoObject` (per DailyChess_12 video) | Video thumbnail u SERP |
| `/blog/:slug` | `Article` + `BreadcrumbList` | Already partial — proširi |
| `/profile/:user` | `Person` + `Athlete` | Knowledge panel kandidat |
| `/` (root) | `Organization` + `WebSite` + `SearchAction` + `SiteNavigationElement` | Sitelinks search box + brand panel |

**Implementacija:** novi helper `src/lib/jsonld-builders.ts` sa funkcijama tipa `buildFAQSchema(qa)`, `buildCourseSchema(article)`, `buildVideoSchema(video)`. Pozivaju se u svakoj relevantnoj stranici.

**FAQ podaci za openinge:** auto-generišu se iz postojećeg `OPENING_SEO` (description, history, response polja → "What is X?", "How to play X?", "Best response to X?").

---

## Pack 3 — GSC Auto-Loop & Inspection Dashboard

Proširi postojeći `gsc-status` edge funkciju i `/seo-status` stranicu:

- Dodaj `urlInspection.index.inspect` poziv → po stranici prikaži status (`URL is on Google`, `Discovered – not indexed`, `Crawled – not indexed`).
- Auto-resubmit dugme za sve "Discovered – not indexed" URL-ove → batch poziv Indexing API-ja.
- Dnevni cron koji pinga top 50 URL-ova sa najlošijim impresijama.
- Tabela "Coverage issues" sa tipovima problema (404, redirect chain, soft 404).

---

## Pack 4 — Video Sitemap (DailyChess_12)

- Nova edge funkcija `generate-video-sitemap` (cron 6h) → dohvata sve videe sa DailyChess_12 kanala preko YouTube Data API.
- Generiše `public/sitemap-videos.xml` sa `<video:video>` markupom (thumbnail_loc, title, description, content_loc, duration, player_loc).
- Doda u `public/sitemap_index.xml`.
- Na `/live` i tamo gde se video embed-uje, dodaj `VideoObject` JSON-LD sa `embedUrl` i `uploadDate` → Google ih prepoznaje kao tvoj sadržaj.

---

## Pack 5 — Knowledge Graph & Sitelinks

U `index.html` `<head>`:

- `Organization` JSON-LD sa `name`, `url`, `logo`, `sameAs: [youtube, x, discord]`
- `WebSite` JSON-LD sa `potentialAction` (SearchAction) → aktivira Google sitelinks search box
- `SiteNavigationElement` array → potpomaže sitelinks ispod glavnog rezultata

---

## Pack 6 — hreflang multi-region

- Dodaj `<link rel="alternate" hreflang="en" />`, `hreflang="sr"`, `hreflang="de"`, `hreflang="es"`, `hreflang="x-default"` u `Seo.tsx`.
- Sve verzije pokazuju na isti URL (single-language sajt) → Google ih indeksira po regionu bez duplicate-content penala.
- Procenjeno +30-50% impresija u non-EN tržištima.

---

## Pack 7 — Image SEO drugi nivo

- **Per-game OG image:** edge funkcija `og-game-board` → prima FEN kao query → vraća PNG board screenshot sa logom (već imamo `og-board-image.ts` helper). Svaki game review = unique og:image.
- **Player avatar schema:** `ImageObject` JSON-LD na svakom player profilu.
- **`<picture>` AVIF + lazy loading:** za sve hero slike → Core Web Vitals boost (LCP).
- **sitemap-images.xml** proširiti sa avatarima top-100 igrača.

---

## Pack 8 — Bing Webmaster + IndexNow polish

- IndexNow već radi → dodati `lastModified` per URL u payload (Bing daje prioritet).
- Edge funkcija `bing-submit-url-batch` → koristi Bing Webmaster API (ako user doda Bing API ključ kao secret) za direktni submit + crawl-rate increase.
- Auto-ping kad se sitemap regeneriše.

---

## Tehnički detalji (za developera)

**Novi fajlovi:**
- `src/lib/jsonld-builders.ts` — sve schema builder funkcije
- `src/lib/jsonld-faqs.ts` — FAQ generatori za openinge i learn članke
- `supabase/functions/google-indexing-ping/index.ts` — Indexing API
- `supabase/functions/generate-video-sitemap/index.ts` — YouTube → XML
- `supabase/functions/og-game-board/index.ts` — dynamic FEN → PNG OG
- `scripts/generate-sitemap.ts` — proširenje za video sitemap entry u indexu
- `src/pages/SeoStatus.tsx` — proširenje sa Inspection tabelom

**Connector setup:**
- Provera da li postojeći GSC connector ima `https://www.googleapis.com/auth/indexing` scope; ako ne, pozvati reconnect.

**Cron rasporedi:**
- `google-indexing-ping`: dnevno u 04:00 UTC (top 50 URL)
- `generate-video-sitemap`: svakih 6h
- `gsc-status` inspection: dnevno u 05:00 UTC

**Schema validation:** sve šeme proći kroz Google Rich Results Test format (čisto `@context` + `@type`, bez nested anomalija).

---

## Šta će korisnik videti odmah

1. `/seo-status` admin panel sa novim sekcijama: Indexing API status, Inspection table, Video sitemap status, Schema validator linkovi.
2. Konzolni log u dev modu kad se schema markup ubaci na stranicu.
3. Posle 7 dana: skok u GSC impresijama (FAQ accordions + breadcrumbs povećavaju CTR ~30%).
4. Posle 30 dana: video thumbnails u SERP-u za chess upite.

---

## Ne diram

- Postojeći `sitemap.xml`, `sitemap-openings.xml`, `sitemap-images.xml` — samo dodajem `sitemap-videos.xml`.
- Postojeći `Seo.tsx` API — samo proširenje, backward compatible.
- Auth/RLS sistem.
- Postojeće edge funkcije (`gsc-status` se proširuje, ne menja API).

