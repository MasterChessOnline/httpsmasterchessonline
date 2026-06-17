# Šta još fali da sajt bude top-tier u Google/Chrome očima

Pregledao sam `index.html`, `robots.txt`, `sitemap_index.xml`, Seo komponente, sw.js, manifest. Ovo je lista realnih nedostataka rangirana po impact-u. Sve je tehnički SEO + performanse + trust signali — bez novih feature-a, bez dizajn promena.

## A. Tehnički SEO (najbrži win)

1. **`robots.txt` ne lista sve sitemape** — trenutno samo 4 od 14. Googlebot otkriva sub-sitemape iz `sitemap_index.xml`, ali Bingbot i ostali bolje rade sa eksplicitnim `Sitemap:` linijama. Dodaću svih 14.
2. **`hreflang` u Seo.tsx je pogrešan** — lista `sr/de/es/fr/ru` ali sajt je samo engleski (per memory: "whole site is English-only"). Ovo Google tretira kao spam signal i može sniziti rank. Skinuću sve osim `en` + `x-default`.
3. **Nedostaje `Organization` + `WebSite` + `SearchAction` JSON-LD u `index.html`** — sitewide schema koja omogućava sitelinks search box u SERP-u. 
4. **`BreadcrumbList` JSON-LD nedostaje na većini stranica** — već postoji builder u `jsonld-builders.ts` ali se ne koristi. Google pokazuje breadcrumbs umesto URL-a u SERP-u → veći CTR.
5. **404 stranica nije postavljena za Google** — `NotFound.tsx` vraća 200 status (SPA), Google ovo tretira kao "soft 404". Dodaću `<meta name="robots" content="noindex">` na NotFound.
6. **Nedostaje `lastmod` po stranici** — sitemape imaju samo build datum. Generišem real `lastmod` iz git/file mtime gde je moguće.

## B. Core Web Vitals / Chrome Lighthouse

7. **Nema `<link rel="preconnect">` za Supabase + YouTube + i.ytimg.com** — svaki cold-start gubi 100-300ms na DNS+TLS. Dodaću u `<head>`.
8. **Nema `<link rel="preload">` za kritični font** — FOUT/CLS problem. Preload glavnog font fajla (već koristimo custom fonts po memory).
9. **`og-image.jpg` se ne preload-uje a koristi se na svakoj stranici** — dodati `<link rel="preload" as="image">` samo na `/`.
10. **Service worker (`sw.js`) — proveriti da li ima offline fallback i da li cache-uje sitemap/robots** (treba da ih BYPASS-uje, ne cache-uje, inače Google vidi zastareo sadržaj).

## C. Trust & rich signali

11. **`security.txt` postoji ali bez PGP/expiration** — Google Safe Browsing i security skeneri vole kompletan `security.txt`. Dodaću `Expires`, `Preferred-Languages`, `Canonical`.
12. **Nedostaje `manifest.json` ↔ `index.html` veza za Chrome "Install app"** — proveriti `theme_color`, `background_color`, `screenshots[]` (Chrome 105+ traži screenshots za bogat install prompt na desktopu).
13. **Nedostaje `<meta name="theme-color">` sa media query za light/dark** — Chrome address bar boja na mobilnom.

## D. Indexing acceleration

14. **`sitemap.xml` nema `<image:image>` namespace na ključnim stranicama** — `sitemap-images.xml` postoji, ali main sitemap ne referencira slike po stranici. Google Images = dodatni traffic kanal.
15. **`/changelog` postoji ali nije u sitemap-u kao news source** — dodati `<news:news>` namespace (Google News discovery, čak i bez News registracije pomaže "freshness").

## Šta NE diram
- Nema redesign-a, nema novih feature-a.
- Ne diram bazu, edge funkcije, ili gameplay.
- Ne diram brand-policy stvari (competitor names ostaju van).
- Ne diram `client.ts`, `types.ts`, `.env`.

## Files koje ću menjati
- `index.html` — Organization/WebSite/SearchAction JSON-LD, preconnect, preload, theme-color media query
- `public/robots.txt` — sve sitemape
- `public/security.txt` — Expires, Canonical, Languages
- `public/manifest.json` — screenshots, polish
- `src/components/Seo.tsx` — fix hreflang
- `src/pages/NotFound.tsx` — noindex meta
- `scripts/generate-sitemap.ts` — real lastmod, image namespace
- `public/sw.js` — bypass sitemap/robots iz cache-a

## Procena
~30-45 min rada, sve verifikujem build-om. Posle ovoga Lighthouse SEO score = 100, PWA install-able na desktop Chrome, i Google ima sve signale koje očekuje od ozbiljnog sajta.

**Da krenem sa svih 15, ili da skratim na samo top 6 (A-grupa, najveći SEO impact)?**
