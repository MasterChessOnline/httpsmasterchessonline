# Maximum Discovery Setup za masterchess.live

Cilj: sve besplatne kanale otkrivanja koje Google/Bing/AI pretraga koriste, postavljeno do maksimuma. Bez plaćenih reklama — samo tehnički SEO + prijava na sve relevantne indekse.

## 1. Google Search Console — puna automatizacija

- **Verifikacija preko meta taga** (Site Verification API preko postojećeg `google_search_console` konektora): agent traži token, ubacuje `<meta name="google-site-verification">` u `index.html`, zove `verify`, dodaje `https://masterchess.live/` kao property.
- **Submit svih sitemapa** (`sitemap.xml`, `sitemap-*.xml`, `news-sitemap.xml`, `rss.xml`) kroz `POST /webmasters/v3/sites/.../sitemaps/...` — jedan poziv po fajlu.
- **URL Inspection panel** u `/admin`: koristi `urlInspection/index:inspect` da vidiš status ključnih strana (Home, `/play-guest`, `/puzzles`, `/news/nikola-vs-niemann-belgrade`, top landing stranice).
- **Search Analytics widget** u istom admin panelu: top query-je iz GSC-a (poslednjih 28 dana) da vidiš pod kojim rečima ljudi već dolaze.

## 2. Bing + Yandex + DuckDuckGo + IndexNow

- **Bing Webmaster Tools**: verifikacija preko istog meta tag pattern-a (dodaje se drugi `<meta name="msvalidate.01">`); sitemap submit link.
- **Yandex Webmaster**: `<meta name="yandex-verification">` tag.
- **IndexNow protokol** (Bing + Yandex): generiše API ključ kao `public/{key}.txt`, edge function `notify-indexnow` koja na svaki novi `/news/*` ili sitemap update šalje URL na `api.indexnow.org` — trenutna indeksacija bez čekanja crawlera.
- **DuckDuckGo** koristi Bing index — automatski pokriveno kad Bing zaindeksira.

## 3. Structured data (schema.org) do maksimuma

Dodaje se JSON-LD po tipu stranice u postojećem `Seo` komponentu:
- `Organization` + `WebSite` + `SearchAction` sitewide (već postoji, proširiti sa `sameAs` linkovima na TikTok/LinkedIn/X/YouTube/IG).
- `SportsOrganization` za MasterChess brand.
- `NewsArticle` (već na Niemann članku) — proširiti na sve `/news/*`.
- `FAQPage` na Home i `/play-guest` (top pitanja iz GSC-a).
- `BreadcrumbList` na svim non-home rutama.
- `VideoObject` za YouTube embed-ove (DailyChess_12).
- `Event` za turnire (`/tournaments/*`) sa startDate/location.
- `Course` za `/openings` i `/learn/*` stranice.
- `Person` schema za Nikoline stranice.

## 4. Google Maps + Google Business Profile

- **Google Business Profile** (besplatno): agent ne može da napravi nalog, ali priprema **komplet za tebe** — logo (već imamo), opis (SR/EN), kategorije ("Chess club", "Educational game"), radno vreme, telefon, adresa, 10 foto placeholder-a. Uputstvo korak-po-korak da ga aktiviraš.
- **Maps embed** na novoj `/contact` stranici sa lokacijom Beograd (ili tvojom adresom ako želiš).
- **LocalBusiness JSON-LD** sa geokoordinatama — Google Maps to čita direktno.

## 5. Social & AI discovery

- **`sameAs` array** u Organization JSON-LD → povezuje sve profile (TikTok, LinkedIn, X, YouTube, IG, GitHub) — Google Knowledge Panel signal.
- **`llms.txt`** u `/public` — novi standard za ChatGPT/Claude/Perplexity indeksaciju sajta.
- **`ai-plugin.json`** placeholder za buduću ChatGPT plugin integraciju.
- **OpenGraph + Twitter Cards** provera na svakoj ruti (canonical + og:url self-reference).
- **RSS feed** za `/news/*` (već postoji `rss.xml` — proširiti da uključuje nove članke automatski).

## 6. Tehnička higijena

- **`robots.txt`**: eksplicitno `Allow` za sve major bot-ove (Googlebot, Bingbot, DuckDuckBot, YandexBot, GPTBot, ClaudeBot, PerplexityBot, Applebot), plus `Sitemap:` direktive za sve sitemape.
- **Canonical audit**: proći kroz sve rute, potvrditi self-referencing canonical.
- **Sitemap index** (`sitemap_index.xml`) referencira sve pod-sitemape — već postoji, verifikovati.
- **`security.txt`** u `/.well-known/` (mala stvar, ali Google to voli).
- **`humans.txt`** — brand signal.

## 7. Admin dashboard za monitoring

Nova ruta `/admin/discovery` (samo za tebe, iza role check):
- GSC top queries + impressions grafik
- URL Inspection lookup polje
- Sitemap status (poslednji fetch datum)
- IndexNow log (koji URL-ovi su poslati)
- Bing Webmaster status (link out)

## Tehnički detalji

**Nove/izmenjene datoteke:**
- `index.html` — meta verifikacija tagovi (GSC, Bing, Yandex), prošireni OG
- `public/robots.txt` — proširen bot allow-list
- `public/llms.txt`, `public/humans.txt`, `public/.well-known/security.txt` — novi
- `public/{indexnow-key}.txt` — novi
- `src/components/Seo.tsx` — proširena schema podrška (FAQ, Breadcrumb, Video, Event, Course, LocalBusiness)
- `src/pages/Contact.tsx` — nova stranica sa Maps embed + LocalBusiness JSON-LD
- `src/pages/admin/Discovery.tsx` — novi admin dashboard
- `supabase/functions/gsc-proxy/index.ts` — nova edge function (GSC API kroz konektor)
- `supabase/functions/notify-indexnow/index.ts` — nova edge function (IndexNow ping)
- `src/App.tsx` — dodate rute `/contact`, `/admin/discovery`

**Konektori:** koristi već povezani `google_search_console`. Ne treba novi konektor.

**Šta *neću* dirati:** homepage dizajn (tvoj veto), postojeći kod za igru/turnire, brand policy (bez konkurenata).

**Šta ti moraš ručno posle:**
1. Napraviti Google Business Profile (agent priprema sve materijale)
2. Napraviti Bing Webmaster Tools nalog (30 sekundi, meta tag već postavljen)
3. Napraviti Yandex Webmaster nalog (isto)
4. Uneti GA4 Measurement ID i TikTok/LinkedIn pixel ID-jeve u `index.html` (već pripremljeno)

## Redosled implementacije

1. **Faza 1 (odmah, ~15 min):** meta verifikacija tagovi, robots.txt, llms.txt, humans.txt, security.txt, IndexNow ključ, proširen `sameAs`
2. **Faza 2 (~20 min):** GSC auto-verifikacija + sitemap submit preko konektora, edge function `notify-indexnow`
3. **Faza 3 (~30 min):** proširen `Seo` komponent (FAQ, Breadcrumb, Video, Event, Course), primena na ključne rute
4. **Faza 4 (~20 min):** `/contact` stranica sa Maps + LocalBusiness schema
5. **Faza 5 (~30 min):** `/admin/discovery` dashboard sa GSC podacima

**Ukupno: ~2h rada, sve free, maksimalno pokrivanje.**

Da li da krenem sa svih 5 faza odjednom, ili prvo Faza 1+2 (najvažnije za Google) pa da vidimo rezultate?
