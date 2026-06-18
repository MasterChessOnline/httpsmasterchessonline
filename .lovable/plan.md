## Cilj
Donate i Rate dugmad da budu UVEK vidljivi (desktop + mobile), plus paket nadogradnji za SEO / GSC / brzinu.

## 1. Navbar — Donate + Rate vidljivi svuda

**Desktop (≥lg):**
- Dodati zlatni **♥ Donate** dugme (link na `/supporter`) u desnu zonu, odmah pre `Play Now`.
- Dugme: kompaktno (ikona + tekst "Donate"), zlatni gradient kao HeroDonationCard, suptilni pulse glow da privuče oko.
- Skinuti `hidden xl:block` sa **Rate** dugmeta → `hidden lg:flex` (vidljivo od laptopa naviše). Na užim laptop širinama prikazati samo ikonu da ne razbije layout.

**Mobile (<lg):**
- U `MobileBottomNav.tsx` (uvek prisutan donji bar) ubaciti dva mala ikon-only tastera:
  - ♥ Donate → `/supporter` (zlatan)
  - ★ Rate → `/rate-masterchess` (žut)
- Alternativa za telefon: kompaktna zlatna "♥" pilula u top Navbar-u pored hamburger menija (uvek vidljiva, ne samo u open meniju).

**Anti-collision pravila:** na sub-lg ekranima sakriti tekst, držati 44×44 px touch target, ne ići preko Play Now hijerarhije (Play ostaje primarni CTA).

## 2. Homepage čišćenje
- `HeroDonationCard` ostaje (već lepo izgleda), ali skinuti dupli SupporterCTA niže ako se preklapaju — jedan Donate blok u hero, jedan na dnu (final CTA), bez ponavljanja u sredini.

## 3. Google Search Console & SEO nadogradnje

**3a. Auto submit sitemap-ova u GSC**
- Iskoristiti postojeću `submit-sitemaps-gsc` edge funkciju → trigger jednom (svih 15 sitemap-ova) preko GSC konektora koji je već povezan.

**3b. IndexNow ping**
- Već postoji `indexnow-ping` funkcija + `indexnow-key.txt`. Dodati cron (pg_cron) da svaki novi `seo_landings` / blog / puzzle slug auto-pinguje Bing/Yandex.

**3c. JSON-LD nadogradnje** (pomoću postojećeg `jsonld-builders.ts`)
- **BreadcrumbList** na svaki detail page (opening, bot, city, glossary, famous game, GM). Trenutno ga nema na većini.
- **FAQPage** na top landing-e (`/sah-online`, `/beat/:botId`, `/openings/*`) — pull iz `seo-faq.ts`.
- **WebSite + SearchAction** u `index.html` za sitelinks search box u Google-u.
- **SoftwareApplication** schema za app (preko aggregateRating iz **realnih** site_ratings).

**3d. Core Web Vitals**
- Preload `og-image.jpg` i prvi hero font (`preload as="font"`).
- `loading="lazy" decoding="async"` na sve `<img>` ispod fold-a (sweep).
- Splittovati Stockfish chunk da ne uđe u initial bundle (već je dynamic? proveriti).

**3e. Internal linking**
- "Related" footer komponenta na svakom detail page (opening → 5 sličnih, bot → 3 slična ELO bota, city → susedni gradovi). Pomaže crawl depth & PageRank flow.

**3f. 404 → soft-redirect**
- Već `noindex` na 404. Dodati i "did you mean" suggestion-e iz NavSearchPalette-a (kratki link blok).

**3g. Last-modified headers**
- Generator sitemap-a već stavlja `<lastmod>` — dodati realne datume iz DB (`updated_at`) umesto build datuma da Google češće re-crawluje samo izmenjene stranice.

## 4. Performance / Best Practices (Lighthouse)
- Dodati `<link rel="preconnect" href="https://i.ytimg.com">` i Supabase host (za brži YouTube + RPC).
- Inline kritični CSS gold theme tokens u `<head>` da nestane FOUC.
- Service worker (`sw.js` v6) — dodati stale-while-revalidate za `/data/masterchess/*.json` shard-ove.

## 5. UX / Trust signali
- "As featured in" / community quotes — samo ako su pravi (preskočiti dok nemamo).
- **Visitor counter (pravi)**: mali "X playing now" iz Realtime presence — već imamo `use-presence.ts`. Strip ispod hero CTA.
- **Sticky Donate banner** koji se pojavi tek nakon 60s engagement-a (ne odmah da ne smara).

## Files koje ću taći (u build modu)
- `src/components/Navbar.tsx` — Donate dugme + Rate vidljiv od lg
- `src/components/MobileBottomNav.tsx` — Donate + Rate ikone
- `src/components/HeroDonationCard.tsx` — proveriti spacing
- `src/pages/Index.tsx` — ukloniti dupli SupporterCTA ako postoji
- `index.html` — WebSite+SearchAction JSON-LD, preconnect
- `src/lib/jsonld-builders.ts` — dodati FAQ + WebSite + SoftwareApplication
- detail page-vi (Opening/Bot/City/Glossary/FamousGame/GM) — Breadcrumb + FAQ JSON-LD
- `scripts/generate-sitemap.ts` — realni `lastmod` iz DB
- supabase edge function trigger za GSC submit + IndexNow cron

## Garancije
- Nikakvi lažni brojevi (sve aggregateRating ide iz `site_ratings`)
- Nema brand-policy prekršaja
- Dizajn ostaje Gold & Black, samo +1 dugme u navbar-u

OK da krenem?