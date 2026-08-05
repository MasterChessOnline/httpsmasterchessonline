# Google Max Plan — Search, Maps, Discover, AI

Cilj: izvući maksimum iz Google-a (besplatan saobraćaj) bez menjanja Home stranice.

Sajt već ima: 17 sitemap-ova + sitemap index, robots.txt sa AI crawler-ima, GSC funkcije (status, query miner, auto-generate pages, submit sitemaps, full audit), IndexNow ping, Google Indexing ping, GBP post publisher, Maps setup panel, chess-places-nearby, Google reviews fetch. Zato plan ne gradi to iznova — zatvara rupe i dodaje nove Google površine.

## A. Search Console — dublje od trenutnog

1. **Weekly GSC dashboard u adminu**: klikovi/impresije/CTR/pozicija po nedeljama, trend gore/dole, uz postojeći `gsc-search-analytics`.
2. **"Striking distance" report**: sve upite na pozicijama 5–20 → lista stranica koje treba dopuniti (najbrži rast).
3. **CTR alarm**: stranice sa visokim impresijama i CTR < 2% → automatski predlog novog title/description.
4. **Query → page mismatch**: upit gde rangira pogrešna stranica → predlog interne veze ka pravoj.
5. **URL Inspection batch**: provera indeksiranosti top 50 stranica, tabela "indexed / not indexed / discovered".
6. **Nedeljni email sa GSC rezimeom** (koristi postojeći email sistem) — da ne moraš da ulaziš u admin.
7. **Sitemap health check**: greške/upozorenja po sitemap-u prikazana u adminu.
8. **Automatski IndexNow + Indexing API ping** na svaku novu SEO stranicu i news članak (proveriti da li je već zakačeno na sve generatore).

## B. Struktura sajta za Google (najveći dobitak)

9. **FAQ schema** na svim SEO stranicama (openings, bots, mates, elo, cities) — širi snippet u rezultatima.
10. **HowTo schema** za "kako pobediti bota X", "kako igrati otvaranje Y".
11. **Video schema + video sitemap** za DailyChess_12 klipove ugrađene u lekcije.
12. **Breadcrumb schema** svuda (Home > Openings > Sicilian) — Google prikazuje putanju umesto URL-a.
13. **Interni linking engine**: automatsko ubacivanje 3–5 relevantnih internih linkova u svaku generisanu stranicu (Google voli dubinu).
14. **Hub stranice**: /openings, /bots, /puzzles kao pravi hub-ovi sa linkovima na sve podstranice.
15. **Sitemap prioriteti + lastmod iz baze** umesto statičkog datuma.

## C. Nove SEO površine (programmatic)

16. **/opening/{naziv}/vs-{bot}** — hiljade dugorepih kombinacija.
17. **/rating/{broj}** — "šta znači 1200 ELO" za svaki 50-ti korak.
18. **/game/{id}** javne partije sa PGN + opisom (evergreen sadržaj, raste samo od sebe).
19. **/tournament/{slug}** arhiva rezultata (Google indeksira imena igrača → oni te sami nalaze).
20. **/player/{username}** javni profili sa statistikom.
21. **/chess-terms/{term}** rečnik proširen na 300+ pojmova.

## D. Google Maps / Business Profile

22. **GBP verifikacija do kraja** + nedeljni auto-post (postoji `publish-gbp-posts`, treba cron i kalendar tema).
23. **/chess-in/{grad}** hub-ovi povezani sa Places API-jem: prave lokacije šahovskih klubova u gradu.
24. **"Chess clubs near me"** stranica sa geolokacijom i Maps prikazom (koristi `chess-places-nearby`).
25. **LocalBusiness + SportsOrganization JSON-LD** sa adresom, radnim vremenom, linkom na turnire.
26. **Event schema za DB Chess Cup** + GBP Event post → turnir se pojavljuje u Google Events.
27. **Google Reviews widget** na sajtu (postoji `fetch-google-reviews`) + CTA "oceni nas" posle odigrane partije.
28. **Maps embed** na stranici turnira sa tačnom lokacijom.
29. **Fotografije i Q&A u GBP** — popuniti sve sekcije (checklist već postoji u docs).

## E. Google Discover / News / Images

30. **News sitemap aktivan + članci sa datumom, autorom, slikom** → ulaz u Google News.
31. **Discover optimizacija**: velika slika 1200px+, jasan naslov, `max-image-preview:large` meta.
32. **Image SEO**: alt tekstovi, imena fajlova, sitemap-images sa naslovima (proveriti da li su svi popunjeni).
33. **Web Stories** za "top 5 poteza nedelje" — Discover ih jako gura.

## F. Google AI / ostalo

34. **llms.txt i ai.txt već postoje** — dopuniti sa listom najvažnijih stranica.
35. **Structured data za AI odgovore**: sažetak od 2–3 rečenice na vrhu svake SEO stranice (AI Overviews vuku odatle).
36. **Core Web Vitals pass**: lazy-load engine WASM, smanjiti početni JS na Home.
37. **hreflang** ako se dodaju drugi jezici (sada je sajt samo engleski — preskočiti dok ne bude potrebe).
38. **Google Analytics event tracking** za registracije i odigrane partije (konektor postoji).

## Tehnički detalji

- GSC pozivi idu preko konektor gateway-a iz edge funkcija; svaka nova funkcija dobija admin/cron auth gate kao postojeće.
- Nove SEO rute idu kroz postojeći `SeoAutoPage` / `seo_pages` obrazac + generisan sitemap iz baze.
- Schema markup ide kroz `src/lib/jsonld-builders.ts`.
- Maps pozivi: browser key za prikaz mape, gateway za Places/Geocoding.
- Cron poslovi kroz pg_cron kao postojeći.

## Predlog reda rada (prva iteracija)

1. Striking-distance + CTR report u adminu (A2, A3) — najbrži rast sa postojećim stranicama.
2. FAQ + Breadcrumb + HowTo schema na svim SEO stranicama (B9, B10, B12).
3. Interni linking engine (B13).
4. Maps paket: near-me stranica, LocalBusiness/Event schema, GBP cron (D22–D28).
5. Nove programmatic površine (C16–C21).
