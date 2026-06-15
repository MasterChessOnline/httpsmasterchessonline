# Plan: Reviews na Google + više linkova ka sajtu

Cilj: **prave zvezdice + ime usera** vidljive na Google rich-snippet rezultatima, i što više backlinkova ka sajtu sa interneta.

## 1. Google rich-snippets za review-e (zvezdice u SERP-u)
- **Per-review JSON-LD** — u `SiteRatingJsonLd.tsx` dodati listu pojedinačnih `Review` objekata (sa `author.name`, `reviewRating`, `reviewBody`, `datePublished`) pored postojećeg `AggregateRating`. Google traži oba da bi prikazao zvezdice + ime ispod linka.
- **Cap na 20 najnovijih review-a** sa komentarom (Google ignoriše prazne).
- **Verifikacija**: posle deploy-a — Google Rich Results Test na `masterchess.live`.

## 2. SiteRating UX — koristiti polja koja već postoje u bazi
- **`title`** kolona (postoji, prazna) → dodati input "Headline" iznad teksta, prikazati kao bold u listi
- **`like_count` / `love_count` / `helpful_count`** → dodati reakcije pored svakog review-a (👍 / ❤️ / 🎯) koristeći postojeću `site_review_reactions` tabelu
- **"Was this helpful?"** sortiranje — najkorisniji review-i na vrhu

## 3. Backlink / Distribution Pack
Da bi linkovi ka sajtu eksplodirali po internetu:

- **`/badge` ruta** — javna stranica gde svako kopira HTML embed:
  ```html
  <a href="https://masterchess.live">
    <img src="https://masterchess.live/api/badge.svg" alt="Rated 4.8 on MasterChess"/>
  </a>
  ```
  → svaki streamer/bloger koji embeduje = jedan backlink. SVG se generiše real-time edge funkcijom sa trenutnim ratingom.
- **Edge funkcija `rating-badge`** vraća dinamični SVG (gold zvezdice + broj) — caching 1h.
- **"Share MasterChess" footer blok** sa 8 kanala: WhatsApp, X, Telegram, Reddit, Facebook, LinkedIn, Email, Copy link. Postavlja se ispod `SiteRating` + u `Footer.tsx`.
- **"Embed na svoj sajt"** dugme pored share-a → otvara `/badge`.

## 4. IndexNow + Sitemap nudge
- `public/indexnow-key.txt` već postoji → dodati lightweight POST u IndexNow API kad se kreira novi review (preko edge funkcije) da Google brže refresh-uje rating
- Dodati `/badge` u `sitemap.xml`

## 5. SEO discovery
- Trigger `seo--trigger_scan` posle implementacije da scanner vidi nove Review schema-e
- Pokrenuti rescan kad sajt ima ≥10 review-a (rich snippet eligibility threshold)

---

## Tehnički obim
- **1 nova edge funkcija**: `rating-badge` (vraća SVG, CORS, cache header)
- **1 nova ruta**: `/badge` (embed copy generator + live preview)
- **3 izmene komponenti**: `SiteRating.tsx` (title field + reactions), `SiteRatingJsonLd.tsx` (Review[]), `Footer.tsx` (Share strip)
- **1 nova komponenta**: `ShareSiteStrip.tsx`
- **Sitemap**: dodati `/badge` URL
- 0 novih tabela (sve već postoji)

## Šta NE radim
- ❌ Ne pravim fake review-e ili lažne zvezdice (constraint: zero fake engagement)
- ❌ Ne kupujem backlinkove — samo organic distribution tools

---

Krećem odmah kad odobriš.
