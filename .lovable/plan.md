
# Full Growth Automation — "Do Everything" Sprint

Cilj: pretvoriti svaki konektor u aktivnu akvizicionu ili retention mašinu koja radi 24/7 bez tvoje intervencije.

---

## 1. GSC Query Mining Loop (najveći ROI)

**Šta radi:** Svakih 7 dana povlači GSC podatke i pravi 3 tipa akcija.

- Edge function `gsc-query-miner` (weekly cron, nedeljom 03:00):
  - Povuče top 500 queries iz `searchAnalytics/query` (28 dana).
  - **Opportunity queue:** queries sa impressions >50 i position >10 → upisuje u već postojeću `seo_query_opportunities` tabelu.
  - **CTR bandit:** queries sa position 3–10 i CTR <2% → flaguje `seo_pages` rowove za meta rewrite; AI regeneriše title/description.
  - **Cannibalization detektor:** queries gde 2+ URL-a rankuju → upisuje u novu tabelu `seo_cannibalization` (query, urls[], suggested_canonical).
- Edge function `gsc-auto-generate-pages`: za svaku opportunity čita brief i poziva postojeći `seo-content-generator` da napiše novu stranicu.
- Admin UI: nova sekcija u `/admin/growth-hub` — "Query Mining" tab (opportunities lista, CTR kandidati, kanibalizacija).

---

## 2. Google Maps "Chess in {city}" programske stranice

**Šta radi:** 100+ novih SEO landing stranica za long-tail "chess club near me" pretrage.

- Nova tabela `city_chess_hubs` (city_slug, city_name, country, lat, lng, places_cached_json, updated_at).
- Edge function `chess-city-hub-generator`:
  - Uzima listu 100 gradova (Balkan + EU + US top cities).
  - Za svaki: Places API (New) `places:searchNearby` sa `includedTypes: ["chess_club"]` + fallback text search "chess club {city}".
  - Cache-uje rezultate na 30 dana.
- Nova ruta `/chess-in/:citySlug` (SeoAutoPage varijanta):
  - Lista klubova sa Google review score-om, mapa embed, "play online now" CTA, top 3 tournament linkovi u regionu.
- Dodaje `sitemap-cities.xml` i uključuje u sitemap index.

---

## 3. Auto-social publishing (TikTok + LinkedIn)

**Šta radi:** Svaki dan bez tvoje intervencije objavi content.

- Edge function `daily-social-publisher` (cron, svaki dan 18:00):
  - **LinkedIn:** povlači jedan interesantan dnevni data-point (najbolji comeback, najveći upset, top otvaranje dana) → generiše profesionalni LinkedIn tekstualni post → objavljuje preko postojećeg `linkedin-publish`.
  - **TikTok:** ako TikTok scope dozvoljava publishing, poziva `tiktok-publish` sa danas-generisanim highlight klipom. Ako scope nedostaje, upisuje u `pending_social_posts` da se ručno pushne kad reconnect-uješ.
- Nova tabela `social_post_log` (platform, post_id, content, url, posted_at, engagement_json).

---

## 4. Resend retention loop (3 kampanje)

- Edge function `retention-emailer` (cron dnevno 09:00):
  - **Streak saver:** user čiji streak istice za <2h → email "your 12-day streak dies soon".
  - **Rival climbing:** ako neko unutar ±25 ELO od tebe skoči za 20 ELO danas → email "your rival is catching up".
  - **Reactivation drip:** 3/7/30 dana neaktivnosti → 3 različita template-a.
- Poštuje postojeće `suppressed_emails` i `notification_preferences`.
- Log u `email_send_log`.

---

## 5. Semrush Weekly Intel Report

- Edge function `semrush-weekly-intel` (cron, ponedeljak 08:00):
  - Poziva `domain_organic` za `chess.com` i `lichess.org`, top 100 keywords.
  - Diff protiv `masterchess.live` — keywords gde oni rankuju a mi ne.
  - Upisuje u `seo_query_opportunities` sa source='semrush_gap'.
  - Šalje sažetak email preko Resend-a tebi.

---

## 6. Sve visible u `/admin/growth-hub`

Nove tab-ove:
- **Query Mining** — opportunities, CTR losers, cannibalization
- **City Hubs** — regenerate button + list statusa
- **Social Log** — poslednjih 30 auto-postova + engagement
- **Retention** — današnji queue, jučerašnji send stats
- **Semrush Gap** — nedeljni izveštaj + "generate page" dugme per keyword

---

## Tehnički deo

**Nove tabele (migracije):**
- `seo_cannibalization` (query text, urls jsonb, suggested_canonical text, detected_at, resolved_at)
- `city_chess_hubs` (city_slug pk, city_name, country, lat, lng, places_cached_json, updated_at)
- `social_post_log` (id, platform, post_id, content, url, posted_at, engagement_json)
- `pending_social_posts` (id, platform, payload jsonb, created_at, sent_at)

Sve tabele: `GRANT` blok + RLS. Admin-only SELECT via `has_role(auth.uid(), 'admin')`. Service role full access.

**Nove edge functions:**
- `gsc-query-miner` (verify_jwt=true, admin-only invoke)
- `gsc-auto-generate-pages` (service-role called)
- `chess-city-hub-generator` (admin-only)
- `daily-social-publisher` (cron)
- `retention-emailer` (cron)
- `semrush-weekly-intel` (cron)

**Cron scheduling:** kroz `pg_cron` + `pg_net`, upisano preko insert tool-a (nije migracija jer sadrži project-specific URL/anon key).

**Nova ruta:** `/chess-in/:citySlug` (React Router lazy load).

**Novi sitemap:** `/sitemap-cities.xml` edge function, uključena u glavni sitemap index.

---

## Šta NE dirasm

- Homepage layout (user veto).
- Postojeće edge functions — samo dodajem nove.
- Auth/RLS na već ispravnim tabelama.
- Brand policy (nema pominjanja competitor sajtova u UI-u; Semrush/GSC podaci samo u admin panelu).

---

## Redosled izvršenja

1. Migracije: 4 nove tabele + `pg_cron`/`pg_net` enable.
2. Edge functions (6 nove, deploy-uju se automatski).
3. Ruta `/chess-in/:citySlug` + SeoAutoPage integracija.
4. Admin UI proširenje (5 novih tab-ova u `/admin/growth-hub`).
5. Cron insert (preko insert tool-a, ne migracija).
6. Prvi ručni trigger svih 6 novih funkcija radi verifikacije.

Približna veličina: ~15 novih fajlova, ~4 nove tabele, ~6 novih cron jobova. Ovo je najveći growth sprint do sada.
