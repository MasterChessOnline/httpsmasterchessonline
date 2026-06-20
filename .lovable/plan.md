# Šta je već urađeno (rezime)

**GSC / Indexing automatizacija:**
- `gsc-search-analytics` edge funkcija — povlači klikove, impresije, top upite i strane (28 dana)
- `/admin/gsc` dashboard — live SEO statistika sa week-over-week deltama
- `indexnow-submit` — automatski šalje sve URL-ove iz sitemap-a Bing/Yandex/Seznam (939 URL-ova već poslato), cron 04:00 UTC
- `publish-gbp-posts` automatski pinga IndexNow kad se objavi novi post

**GBP (Google Business Profile):**
- `image_url` kolona u `gbp_posts` + `gbp-images` storage bucket
- 8 Services definisano (Ranked Play, Tournaments...)
- Booking link dodat, atributi „youth-led business"

**Google Maps Platform (već povezano):**
- `resolve-place-id` edge funkcija (server-side, kroz gateway)

# Da li je korisno?

Da — GSC + IndexNow donose merljiv SEO efekat (brže indeksiranje, vidljivost koje fraze rade). GBP poboljšanja podižu lokalni ranking. Maps konekcija je trenutno **iskorišćena samo 5%** — odatle dolazi sledeća lista.

# 10 novih ideja oko Google Maps (od najvrednije ka nice-to-have)

## 1. Geo-targetovane SEO landing strane „Chess in {City}"
Generisati statičke strane `/chess/{city-slug}` za top 50 gradova (Belgrade, Zagreb, Sofia, Vienna...). Koristi **Places API (New) Nearby Search** da povuče prave šahovske klubove/kafiće u tom gradu + ugrađena mapa. Ogromna long-tail SEO vrednost — „chess club Belgrade", „where to play chess Vienna".

## 2. „Find Chess Near Me" mapa
Stranica `/near-me` sa Maps JS API mapom, geolokacija korisnika, pinovi za šahovske klubove u radijusu (Places Nearby `textQuery: chess club`). Cluster markeri, filter „open now", deep-link „get directions". Viralni share potencijal.

## 3. Tournament venue mapa
Svaki turnir u sistemu već ima lokaciju? Dodati mapu pina + „get directions" dugme. Auto-resolve adrese kroz **Geocoding API** kad organizator otkuca grad.

## 4. Player heatmap (anonimizovan)
World map sa heatmap-om gde su MasterChess igrači aktivni (samo broj po zemlji/regionu, bez tačnih koordinata). Odlično za homepage „social proof" i deluje živo (rešava cold-start ghost-town problem).

## 5. Time zone-aware matchmaking
**Time Zone API** + geolokacija → automatski predloži turnire/igrače u sličnom TZ. Smanjuje „niko nije online" osećaj.

## 6. Address autocomplete pri tournament creation
**Places Autocomplete (New)** umesto plain text inputa za venue adresu. Validna adresa, lat/lng, place_id sačuvan — kasnije se može koristiti za reviews/photos.

## 7. „Travel to tournament" planner
Za on-site turnire: **Routes API** prikaže driving/transit vreme + distancu od korisnikove lokacije. CTA „Add to calendar with travel time".

## 8. Air Quality / Weather widget za on-site turnire
**Weather API** + **Air Quality API** na turnirskoj strani: „Saturday 14°C, AQI good". Mali touch ali izgleda premium i niko od konkurencije nema.

## 9. Static Map Open Graph slika
Za tournament share linkove generisati **Static Maps API** sliku sa pinom venue-a kao OG image. Lepši Twitter/WhatsApp preview.

## 10. Country leaderboards sa flag mapom
Iskoristi geokodiranu zemlju igrača → leaderboard po zemlji, country selector na world map (Maps JS sa stylized country fill). Nacionalni ponos = retencija.

# Google Cloud Console — šta još uraditi

- **Enable API-je** koje sada ne koristimo: Places API (New), Geocoding, Routes, Time Zone, Static Maps, Weather, Air Quality
- **API key restrictions** — server key restrict na edge funkcije, browser key restrict na `*.lovable.app` i `masterchess.live`
- **Quota alerts** — postaviti budget alert na $50/mesec da nas ne iznenadi
- **GBP API access** — zatražiti pristup (review process ~2 nedelje) da možemo automatski postavljati GBP posts bez ručnog koraka

# Predlog: šta sledeće da implementiram

Ne mogu sve odjednom — najveći ROI su **#1 (Geo SEO landing strane)** i **#2 (Find Chess Near Me)**. To su nove strane sa stvarnim SEO/akvizicijskim efektom.

**Reci koje od ovih 10 ideja da uradim** (mogu i više, npr. „1, 2, 6, 9") pa pravim detaljan plan implementacije samo za to.
