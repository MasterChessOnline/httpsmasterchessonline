# Zameni lažne ocene/recenzije pravim podacima + dodatni integritet/SEO win-ovi

## Šta sam našao (loše vesti)

`src/components/TestimonialsSection.tsx` je **u potpunosti izmišljen** — i prikazana "4.9/5 from 2,000+ players" značka i svih 6 testimoniala (Alex M., Sarah K., James W., Maria L., Viktor S., Chen W.) su hardkodovani u kodu. Ovo direktno krši memory rule:
> "ZERO fake engagement data, ghost players, simulated activity"

Pored toga, OG image i meta description i dalje govore "4.9 stars" iako sam JSON-LD očistio prošli put.

**Realni podaci iz baze (`site_ratings`):**
- 5 javnih ocena, prosek 4.20/5, 4 sa tekstom.

## Plan

### 1. `TestimonialsSection.tsx` — prepiši da koristi prave podatke
- Učitava `site_ratings` (hidden=false) + JOIN sa `profiles.display_name`, `country`, `avatar_url`, `current_rating`.
- Header prikazuje **stvarni** `avg.toFixed(1)/5` i `from N reviewers` (gde N ≥ 3, inače sakrij ceo header značku).
- Grid: prvih 6 recenzija sa tekstom; ako ima manje od 3, ceo `<section>` se ne renderuje (return null) — bolje sakriti nego lagati.
- Svaka kartica: pravi avatar/inicijal, pravi display_name, pravi country flag, pravi ELO (ako postoji), pravi datum, pravi `comment`.
- Empty state se NE prikazuje na home — sekcija nestaje dok ne bude bar 3 recenzije.
- Loading: `null` (ne flash placeholder).

### 2. Dodaj CTA "Be the first to review" u prazno mesto
Ako sekcija sakrivena (< 3 recenzije), umesto nje ide tanak banner: "Be the first to share what you think — [Write a review →]" linkujući na `/rate`. Ovo i sakuplja prave podatke i pomaže SEO (više `Review` JSON-LD = veće šanse za star-rating u SERP-u).

### 3. Očisti zaostale "4.9" lažne tragove
- `index.html` `<meta name="description">` — proveriti da nema "4.9 stars"
- `og:description` isto
- Nema više fake stat-ova ni u kom landing-u (već smo skinuli iz JSON-LD-a; ova provera samo verifikuje)

### 4. Dodatni "živi" trust signali (zamena za fake brojeve)
Mesto lažnih ocena, prikaži **prave žive brojeve** koji rastu organski (već se računaju na sajtu, samo treba ih izložiti):
- Total games played sa svih `online_games` (count)
- Total active players (count distinct profiles sa heartbeat-om u 30d)
- Total tournaments held
- Stavi to u mali "Live stats" strip iznad testimonials sekcije.

Ovo je takođe Google-friendly: Google voli "fresh, real numbers" u sadržaju.

### 5. Server-side cache za review brojeve
`SiteRatingJsonLd.tsx` poziva Supabase iz svakog klijenta. Bolje: dodaj `localStorage` cache 5min da se isti broj ne refetch-uje na svakom navigation-u (manje noise, brže LCP).

## Files

- `src/components/TestimonialsSection.tsx` — kompletno prepisati
- `src/components/LiveStatsStrip.tsx` — novi mali strip iznad testimoniala
- `src/components/SiteRatingJsonLd.tsx` — dodaj localStorage cache
- `index.html` + `src/components/Seo.tsx` — verifikacija da nigde nema fake brojeva u meta opisu

## Šta NE diram
- Dizajn estetiku (gold/black ostaje)
- Nikakve nove baze, edge funkcije, ili migracije
- Brand policy stvari

## Garantije
- Posle ovoga: niti jedan broj na sajtu nije izmišljen
- Star rating u Google SERP-u će se aktivirati čim sakupimo ~5 recenzija sa display_name + comment (već imamo 4)
- Lighthouse SEO/Best Practices ostaju 100

OK da krenem?
