# MEGA PLAN: EKSPLOZIJA MASTERCHESS-a za 60 dana

Cilj: **10.000–50.000 organskih poseta / mesec** i **3.000–15.000 novih registracija** bez ijednog dinara reklama.
Metoda: masovna proizvodnja SEO sadržaja + agresivna distribucija po celom internetu (isto kako su Chess.com i Lichess uzeli long-tail 2015–2020).

---

## DEO 1 — AI CONTENT FARM (500+ stranica / nedeljno)

### 1.1 Šta zapravo pravim (novi tipovi stranica)

Sve se generiše programski (edge function + AI Gateway) i piše u DB tabele; jedan React template servisira desetine hiljada URL-ova. Google indeksira svaki.

| Tip stranice | URL šablon | Broj | Primer |
|---|---|---|---|
| **Otvaranje-vs-otvaranje** | `/openings/:a-vs-:b` | ~800 | `sicilian-vs-french` |
| **"Kako pobediti protiv X"** | `/how-to-beat/:opening` | ~200 | `how-to-beat-the-london-system` |
| **Mat u N poteza** | `/mate-in/:n/:pattern` | ~300 | `mate-in-2-back-rank` |
| **ELO milestone vodiči** | `/rating/:elo-guide` | ~600 | `1200-elo-chess-guide` |
| **"Chess for X"** | `/chess-for/:audience` | ~150 | `chess-for-6-year-olds`, `chess-for-adults` |
| **Grad + šah** | `/chess-in/:city` | ~400 | `chess-in-belgrade`, `chess-in-berlin` |
| **Poznati igrači — dubinski profili** | `/players/:name/games`, `/players/:name/openings` | ~500 | `/players/magnus-carlsen/openings` |
| **Poznate partije (razgrađene)** | `/famous-games/:slug` | ~300 | `kasparov-vs-topalov-1999` |
| **Beat-bot landing** | `/beat/:botId` (proširiti sa 9 → 40 varijanti) | ~40 | `beat-nikola-1800` |
| **Puzzle by theme** | `/puzzles/:theme` | ~120 | `pin-puzzles`, `fork-puzzles` |
| **Glossary terms** | `/glossary/:term` | ~250 | `zugzwang`, `zwischenzug` |
| **Rivalstvo generator** | `/vs/:playerA-vs-:playerB` | ~200 | istorijski dueli |

**Ukupno ~3.870 novih stranica**, sve indeksibilne, sve real content (ne samo template).

### 1.2 Kako AI piše sadržaj (bez smeća)

- **Edge function `seo-content-generator`** (cron, radi po 100 stranica/dan) — Gemini 2.5 Flash
- Svaka stranica ima: **JSON-LD Article/HowTo schema**, canonical, og:image (auto-generisan sa boardom pozicijom), 800-1500 reči, FAQ sekcija, "related pages" grid (interno linkovanje = SEO gold)
- Tabela `seo_pages(slug, kind, title, meta_desc, body_md, jsonld, related_slugs, generated_at, quality_score)`
- **Kontrola kvaliteta**: quality_score < 70 → regeneriši. Real chess podaci iz `masterclass-validated-lines` + Lichess Explorer API + `famousGames` data.
- **Dvojezično**: SR + EN varijanta svakog URL-a (`/en/…` i `/sr/…`) = duplo indeksiranih stranica.

### 1.3 Auto-sitemap + IndexNow ping

- `scripts/generate-sitemap.ts` čita `seo_pages` tabelu → generiše 15 tematskih sitemap-ova (već postoje delimično)
- Nakon svake AI batch runde: edge function pinguje **Google Indexing API, Bing IndexNow, Yandex IndexNow** za nove URL-ove
- Auto news-sitemap za svaki novi članak

### 1.4 Blog/News farma (svakodnevno)

- **Cron edge function `daily-news-writer`** — svaki dan piše 3-5 članaka:
  - "Chess news of the day" (RSS iz FIDE/ChessBase/TWIC već postoji → AI rewrite u original članak)
  - "Opening of the week deep-dive"
  - "Player spotlight"
  - "Chess psychology / improvement tips"
- Objavljuje se u `blog_posts` tabelu, ide u news sitemap, IndexNow ping
- Za 60 dana = **180-300 novih original blog članaka** = ozbiljna Google News kandidatura

---

## DEO 2 — PROGRAMMATIC PR + DISTRIBUCIJA (50+ platformi)

Ovo su sajtovi/servisi koji **pomažu platformama da rastu** — sve što je legalno automatizovati, automatizujem; ostalo pripremim gotovo za tvoj jedan-klik.

### 2.1 Startup/product direktorijumi (jednokratni ali ogromni)

Pravim **`/kit`** stranicu (press kit) + auto-generisane submission tekstove za:

| Platforma | Pristup | Rezultat |
|---|---|---|
| Product Hunt | Ručno lansiranje (pripremam sve: assets, copy, hunter outreach lista) | 500-5000 poseta prvi dan |
| BetaList | Auto submit form | 200-1000 signup |
| Hacker News (Show HN) | Ručno + template | 1K-50K poseta ako uleti |
| Indie Hackers | Auto post | 500-2000 poseta |
| AlternativeTo | Auto submit ("alternativa za [competitor]") | dugoročni SEO traffic |
| SaaSHub | Auto submit | dugoročni SEO |
| ToolFinder / Startup Stash / Launching Next / SideProjectors / Uneed / Fazier / Peerlist / Startup Base | Batch submitter edge function | ~30 direktorijuma odjednom |
| Google News Publisher Center | Priprema submission paketa | Ulazak u Google News → 10x traffic za blog |
| Wikidata entry za "MasterChess" | Auto-generated Q-item | Semantic web signal |

**Rezultat**: ~50 backlinkova iz autoritativnih domena za 1 nedelju = Domain Authority ↑↑↑.

### 2.2 Reddit blitz (poluautomatski, siguran)

- Edge function skenira r/chess, r/AnarchyChess, r/chessbeginners, r/ChessPuzzles svaki dan
- Kad neko postavi pitanje na koje jedna od naših SEO stranica **direktno** odgovara → generiše **pristojni komentar-draft** i stavlja u admin queue (`/admin/reddit-queue`) — ti kliknes "post" iz svog Reddit accounta
- 5 komentara/dan × 30 dana × ~500 poseta/komentar = **75.000 poseta/mesec**

### 2.3 Chess forumi / Discord auto-outreach

- Skript generiše **listu 200+ chess Discord servera + 50+ šahovskih foruma** (već imam u docs) + personalizovanu poruku za svaki
- Push u tabelu `outreach_queue` sa deep-linkom za tvoj Discord bot da automatski postavi objavu (samo tamo gde je dozvoljeno)

### 2.4 RSS + agregator distribucija

- Emitujemo RSS/JSON feed-ove svih blog članaka, vesti, novih SEO stranica
- Auto-ping ka: **Feedly, Inoreader, Feedspot, Blogarama, Alltop, ChessFeed, Google FeedBurner alternatives** (~20 agregatora)
- Rezultat: automatski indeksovanje + syndication traffic

### 2.5 Long-tail zapping (Google Search Console loop)

- Već imamo GSC integraciju + `seo_query_opportunities` tabelu
- **Novo**: cron function svakodnevno čita GSC queries gde smo pozicija 8-30 → automatski generiše novu, jaču, ciljanu SEO stranicu → IndexNow ping
- Ovo je **self-improving SEO loop** (isto kako radi Programmatic SEO industry).

### 2.6 Backlink-building bot

- Auto-generiše guest-post ponude ka 100+ šahovskih blogova (iz naše `media_outreach` tabele)
- Auto-generiše "Sources" članke — mi objavljujemo članak koji citira 20 chess autora → oni dobijaju notifikaciju → mnogi backlinkuju
- Auto-submit ka **HARO / Qwoted / SourceBottle** za chess-related upite (novinari traže eksperte → mi šaljemo AI-generisane citate od tebe)

### 2.7 Social auto-postavljanje

Nova tabela `social_scheduler`. Za svaku novu SEO stranicu / blog članak / roast:
- Auto-generiše post za X (Twitter), Threads, Facebook, LinkedIn
- Auto-generiše TikTok/Reels script + Canvas video (već imamo Chess Roast Engine)
- Guruje u queue, ti povežeš accounts sa Buffer/Publer API (ili ručno klik-post iz `/admin/social-queue`)

---

## DEO 3 — MERENJE I ITERACIJA

Nova admin stranica **`/admin/growth`** sa dashboardom:
- SEO stranice: koliko generisano, koliko indeksirano (GSC API), koliko donose klikova
- Direktorijumi: status svakog submitovanja
- Reddit / social queue: koliko na čekanju, koliko objavljeno, engagement
- Konverzija: posete → signup po izvoru
- **A/B test:** naslovi SEO stranica se auto-testiraju (GSC CTR)

---

## Tehnički detalji

**Novo tabele:**
- `seo_pages` (glavni content store)
- `outreach_queue` (Reddit/forum/discord drafts)
- `social_scheduler` (auto social posts)
- `backlink_prospects` (guest-post targets + status)
- `directory_submissions` (Product Hunt, BetaList, itd. tracker)

**Novo edge functions (cron-drive):**
- `seo-content-generator` (100/dan) — AI Gateway, Gemini 2.5 Flash
- `daily-news-writer` (3-5/dan)
- `seo-loop-optimizer` (čita GSC, pravi nove stranice za pozicije 8-30)
- `directory-submitter` (batch API POST-ovi ka direktorijumima koji imaju public API)
- `reddit-comment-scout` (skenira relevantne postove)
- `indexnow-mass-ping` (posle svake batch runde)
- `social-post-generator`

**Novo frontend:**
- `SeoContentPage.tsx` — jedan template renderuje sve tipove
- `/admin/growth` dashboard
- `/admin/reddit-queue`, `/admin/social-queue`, `/admin/outreach`
- `/kit` — press kit stranica (assets, copy, screenshots)
- `/api/rss/*.xml` — RSS endpoints per kategoriji

**AI Gateway**: Gemini 2.5 Flash za bulk generisanje (jeftino), GPT-5.5 samo za flagship blog članke.

---

## Redosled izvršavanja (radim ovim redom u build modu)

**Sprint 1** (odmah): `seo_pages` tabela + `SeoContentPage` template + `seo-content-generator` edge fn za 3 tipa stranice (openings-vs-openings, how-to-beat, ELO guides) → **prvih 500 stranica live za 24h**.
**Sprint 2**: 8 preostalih tipova stranica + auto-sitemap + IndexNow mass ping → **3000+ stranica indeksibilno**.
**Sprint 3**: `daily-news-writer` cron + Google News submission paket + `/kit` press stranica.
**Sprint 4**: `directory-submitter` (auto submit ka 15 platformi koje imaju API) + priprema paketa za ručno lansiranje (Product Hunt, HN).
**Sprint 5**: Reddit/social/outreach queue + `/admin/growth` dashboard + GSC self-improving loop.

Odobri plan pa krećem sa Sprintom 1.
