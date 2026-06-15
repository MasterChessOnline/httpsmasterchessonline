
# Mega Sprint — "Sve odjednom, vikend warrior režim"

Sajt ostaje 100% na engleskom (po Human Soul pravilu). Srpski/regionalni SEO strane su SAMO landing strane indeksirane za Google — nikad ne menjamo default jezik UI-ja.

---

## DEO 1 — Završi tekući SEO sprint (započeto, ide do kraja)

**1.1 Canvas Share-After-Win kartica** (`src/components/SharePositionCard.tsx`)
- Canvas 1080×1080 PNG: final pozicija + username + rezultat + ELO delta + QR kod ka `/vs/{code}` rematch linku
- Dugmad: Download PNG, Web Share API (mobile), Copy Link, Instagram Story deep link
- Trigger u `MatchResultModal` (samo nakon završene partije, ne resign u 2 poteza)
- `qrcode` paket već instaliran u prošlom sprintu

**1.2 SEO Mega Footer** (`src/components/SeoMegaFooter.tsx`)
- 60+ internih linkova grupisanih: Play, Learn, Openings, Bots, Regions, Tools
- Renderuje se na svim landing stranama (ne na /play da ne zatrpa UI igre)

**1.3 FAQ schema na Home** (`src/components/HomeFaqSection.tsx` + `src/lib/seo-faq.ts`)
- 6–8 Q&A sa FAQPage JSON-LD → Google rich snippets za 2–4 nedelje
- Visual accordion komponenta (ne samo nevidljiv schema dump)

**1.4 Openings "for beginners"** — 20 najpopularnijih → `/openings/:slug/for-beginners`
- 3 ključna poteza, 2 zamke, "Try it now" dugme ka treneru
- Sve u sitemap-openings.xml

---

## DEO 2 — PWA Install + Push Notifications

**2.1 Real PWA manifest** (`public/manifest.webmanifest`)
- name, short_name, icons (192/512/maskable), theme_color, background_color, display: standalone, start_url: /play
- Generiši ikone preko imagegen (transparent PNG, gold-on-black logo)

**2.2 Service Worker** (`public/sw.js` + `src/lib/pwa-register.ts`)
- Cache-first za statičke assete, network-first za /api
- Offline fallback strana sa "Play vs bot offline" linkom

**2.3 Install prompt komponenta** (`src/components/InstallAppBanner.tsx`)
- Hvata `beforeinstallprompt`, prikazuje custom banner posle 2. pobede (ne 1. — manje agresivno)
- iOS variant: instrukcije za Add to Home Screen

**2.4 Push notifikacije** (`supabase/functions/send-push/index.ts` + tabela `push_subscriptions`)
- Web Push API (VAPID keys kao secrets)
- Triggeri: rematch izazov, turnir starts in 5min, clan quest gotov, daily puzzle
- Setting toggle u `/settings` (default OFF, user opt-in)

---

## DEO 3 — Monetizacija (donacije, BEZ paywall-a)

**3.1 Supporter strana** (`src/pages/Supporter.tsx`, ruta `/support`)
- 3 tier-a: ☕ Coffee ($3), 🥇 Gold ($10), 👑 Legend ($25/mo)
- Stripe Checkout (jednokratno + subscription)
- Sve funkcije ostaju besplatne. Donatori dobijaju: gold username glow, "Supporter" badge, custom board theme

**3.2 Stripe integracija** (`supabase/functions/create-checkout` + `stripe-webhook`)
- Koristi `stripe--create_stripe_product_and_price` u build režimu
- Tabela `supporters` (user_id, tier, expires_at, stripe_customer_id) sa RLS
- Webhook update-uje status

**3.3 Supporter badge sistem**
- `<SupporterBadge userId={...} />` komponenta
- Render na: profilu, leaderboard-u, chat porukama, share kartici
- Subtilan gold glow, ne pretrpava UI

---

## DEO 4 — Streamer/Creator alati

**4.1 OBS Overlay strana** (`/overlay/:username`)
- Transparent background, prikazuje: trenutnu partiju, ELO, win streak, last move
- URL koji streamer dodaje u OBS kao Browser Source
- Auto-update preko Supabase Realtime

**4.2 Stream code za viewers** (`/join/:streamer-code`)
- Streamer dobija šifru u `/settings → Streamer`
- Viewer-i ulaze u queue, streamer prihvata sledećeg challenger-a
- Već postoji bazna logika u `/live` — proširujemo

**4.3 Highlight reel exporter**
- Posle partije: "Export 30s highlight" → animirani GIF/MP4 sa zadnjih 10 poteza
- Koristi canvas-recorder, download direktno

---

## DEO 5 — Programmatic SEO ekspanzija (srpski/regionalno za Google)

**5.1 Već postoji 8 SR strana iz prošlog sprinta.** Dodaj 12 novih:
- `/sr/sah-protiv-kompjutera-besplatno`, `/sr/sahovske-zagonetke`, `/sr/sah-turniri-online`, `/sr/kako-igrati-sah`, `/sr/sahovska-tabla`, `/sr/sahovske-figure`, `/sr/sah-za-decu`, `/sr/najbolje-sahovsko-otvaranje`, `/sr/kraljev-gambit`, `/sr/sicilijanska-odbrana`, `/sr/sahovska-strategija`, `/sr/sah-mat-u-3-poteza`
- Sve sa `<html lang="sr">` na toj ruti (Helmet override) + hreflang cross-link

**5.2 Bosanski + Hrvatski varijante** najboljih 5 SR strana
- `/bs/...`, `/hr/...` — Google ih tretira kao zasebne (različit market)

**5.3 "Chess in {City}" ekspanzija** — već imamo 41, dodaj 60 → ukupno 100+ cities
- Beograd, Novi Sad, Zagreb, Sarajevo, Ljubljana, Sofia, Bukurešt, Atina... + 50 EU/SAD gradova

---

## DEO 6 — Weekend Content Kit (tvoj 5h vikend posao)

**6.1 `/promo-kit` (admin-only strana, requires admin role)**
- Pre-generisan content paket koji ti samo copy-paste-uješ:
  - 30 IG/TikTok caption-a (auto-generisani sa AI Gateway-em)
  - 30 Reddit naslova za r/chess, r/SideProject, r/AnarchyChess
  - 10 Twitter/X tred-ova
  - 5 ProductHunt/HackerNews draft postova
  - Wikipedia stub draft
  - Email template za chess streamere
- Sve sa direktnim linkovima ka tvojim landing stranama
- "Mark as posted" dugme da pratiš šta si već okačio

**6.2 Auto-generated screenshot grabber**
- Klikneš na bilo koju landing stranu u promo kit-u → generiše IG-ready screenshot (1080×1920) sa highlight-om
- Skida ti 80% rada za vizuelni content

**6.3 Weekly content calendar**
- Subota = 6 IG postova queue
- Nedelja = 4 Reddit + 2 TikTok skripte
- Ponedeljak ujutro = automatski digest "šta okačiti danas" email

---

## DEO 7 — Tehničke sitnice koje pomeraju brojeve

- `<link rel="alternate" hreflang="sr">` na svim EN stranama koje imaju SR par
- `SearchAction` schema na home (Google search box u rezultatima)
- BreadcrumbList JSON-LD na svim landing-zima
- `sameAs` u Organization schema → IG, TikTok, YouTube, X
- Image alt audit (svi `<img>` bez alt → dodati)
- Lighthouse pass: lazy load svih below-fold slika, defer non-critical CSS

---

## Šta NE radim

- ❌ Ne menjam home dizajn (user veto)
- ❌ Ne dodajem nove game mode-ove
- ❌ Ne prevodim sajt na srpski (engleski ostaje default, SR samo SEO landings)
- ❌ Ne dodajem reklame
- ❌ Ne pravim native iOS/Android app (PWA je dovoljna)
- ❌ Ne targetiram "chess" keyword (nemoguće)

---

## Procena obima

- Files: ~35 novih, ~12 edit
- Nova ruta: ~25
- Edge functions: 3 (push, stripe-checkout, stripe-webhook)
- Nove tabele: 2 (`supporters`, `push_subscriptions`)
- Stripe + VAPID keys = trebaće mi tvoji secrets u jednom trenutku

## Redosled isporuke (radimo u tranšama, ne sve odjednom u jednom AI run-u)

1. **Tranša 1** (sad): DEO 1 (završi tekući sprint) + DEO 5 (12 novih SR strana)
2. **Tranša 2**: DEO 2 (PWA + push)
3. **Tranša 3**: DEO 3 (Stripe donacije) — treba mi Stripe key
4. **Tranša 4**: DEO 4 (Streamer alati) + DEO 7 (tech polish)
5. **Tranša 5**: DEO 6 (Weekend content kit)

Posle svake tranše: pauza, ti testiraš, pa nastavljamo.

---

## Realan očekivani ishod (3 meseca)

- Google indeks: ~250 strana (sa ~80 sada)
- Organic visits: 50/dan → 500–1500/dan (ako vikend kit radiš redovno)
- Registrovani: 50 → 800–2000
- Supporter konverzija: ~1% = 8–20 plativih → $30–100/mes (pokriva server)
- Average concurrent online: 3–8 (više nije "ghost town" osećaj)

Spreman da krenem Tranšom 1 čim potvrdiš.
