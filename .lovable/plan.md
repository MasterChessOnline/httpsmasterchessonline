
# Google audit + sledeći koraci za Maps

## 1. Šta već postoji (radi)
- `/rate-masterchess` upisuje u `site_ratings` → AggregateRating JSON-LD se generiše automatski.
- `useGoogleReview()` hook povlači `place_id` iz `site_config` → CTA dugme "Leave a Google review" vodi direktno na `search.google.com/local/writereview?placeid=...`.
- `resolve-place-id` edge funkcija auto-pronalazi MasterChess GBP listing.
- Maps stranice: `/community/map`, `/near-me`, `/chess/:city`, `/players/world`.

## 2. Šta NE radi kako treba (popravlja se sad)

**Problem A — Google review CTA je sakriven.**  
Trenutno se "Rate on Google" sekcija pojavi tek POŠTO korisnik već submituje na sajtu. Većina ljudi tu zatvara tab. Treba ih provući kroz Google **pre** nego što odu.

**Problem B — nema "smart routing" (a da ne krši Google TOS).**  
Trenutno svako ko ide na Google dobija isti link. Bolje: posle submita pokazujemo Google CTA SVIMA (5⭐ i 1⭐), ali jasno označimo "Loved it? Tell Google" + zaseban "Not great? Tell us why" mailto:feedback link. To je u skladu s Google TOS (ne smemo da gejtujemo samo pozitivne).

**Problem C — nema dokaza/trust signala iza CTA dugmeta.**  
Ne pokazuje "184 ljudi je već dalo recenziju na Googleu". Treba mali brojač + lista poslednjih Google review-a (preko Place Details API, `reviews` field).

**Problem D — `/reviews` strana ne prikazuje Google reviews uopšte.**  
Trebalo bi povući top 5 Google review-a (Place Details API) i ubaciti ih iznad in-site review-a, sa "View all on Google Maps" linkom.

## 3. Implementacija — "Google Review Funnel"

1. **Edit `RateMasterChess.tsx`**:
   - Posle uspešnog submita, NE redirektuj odmah na `/reviews`. Pokaži full-screen "Thank you" sa 2 dugmeta:
     - Primary (zlatno): "⭐ Now post it on Google (15 sec)" → otvara Google review URL u novom tabu
     - Secondary: "Skip → see all reviews"
   - Track oba klika (`gbp_review_click` / `gbp_review_skip`) preko `track()`.
2. **Novi component `GoogleReviewsBlock.tsx`**:
   - Povlači top 5 Google review-a iz nove edge funkcije `fetch-google-reviews` (Place Details API, field `reviews`).
   - Cache 6h u `site_config` da ne troši kvotu.
   - Render kao karusel sa Google logoom + "View all on Google →".
3. **Ubaciti `GoogleReviewsBlock`** na: `/reviews` (vrh strane), `/rate-masterchess` (iznad forme — social proof), homepage testimonials sekcija.
4. **Nova edge fn `fetch-google-reviews/index.ts`**: gateway poziv na `places/v1/places/{placeId}?fields=reviews,rating,userRatingCount`.

## 4. Nove Google Maps ideje (rangirano po ROI)

| # | Ideja | Zašto se isplati |
|---|------|-----------------|
| **A** | **Google Reviews na sajtu** (gore opisano) | Direktan trust signal, ↑ konverzija |
| **B** | **"Players in your city" widget** na profilu | Koristi geocoded `profiles.city` → "12 igrača iz Beograda" + mini mapa |
| **C** | **Static Map OG slike za tournamentse** | `/tournaments/:id` share link dobija mapu venue-a kao OG image (Static Maps API) |
| **D** | **Places Autocomplete za turnir venue** | Organizatori biraju lokaciju iz Google sugestija → tačni adress/lat/lng/place_id |
| **E** | **"Get directions" dugme** na svakom venue/turnir | Otvara Google Maps app sa rute od korisnika → ↑ mobile UX |
| **F** | **Pollen + Weather widget** na outdoor turnir stranicama (park chess) | Pollen API + Weather API kroz gateway |
| **G** | **Country leaderboard sa pravim zastavama na 3D globusu** | Već imamo `/players/world`, dodati WebGL globus (react-globe.gl) |
| **H** | **GBP weekly post auto-publish** sa najboljim review-om nedelje | Već postoji `publish-gbp-posts` fn — dodati "Review of the week" template |

## 5. Tehnički detalji

```text
Files to create:
  supabase/functions/fetch-google-reviews/index.ts
  src/components/GoogleReviewsBlock.tsx

Files to edit:
  src/pages/RateMasterChess.tsx        (funnel posle submita)
  src/pages/Reviews.tsx                (ubaci GoogleReviewsBlock na vrhu)
  src/components/TestimonialsSection.tsx (ubaci 1 Google review)
```

Edge funkcija koristi postojeći Google Maps connector (gateway URL + `LOVABLE_API_KEY` + `GOOGLE_MAPS_API_KEY`). Cache rezultata: 6h u `site_config` key `google_reviews_cache`.

## 6. Šta gradimo prvo?

Predlažem **Fazu 1 = Sekcija 3 (Google Review Funnel + GoogleReviewsBlock)** jer to direktno povećava broj Google review-a (= bolji ranking u Google Maps + AggregateRating zvezdice u Google Search).

Faza 2 = bilo koje 2-3 ideje iz tabele (A je već uračunato u Fazu 1).

**Reci mi: "Faza 1" da krenem odmah, ili izaberi i ideje iz tabele (npr. "Faza 1 + C + E").**
