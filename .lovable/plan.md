
# Mega SEO + Promo Sprint — Sve odjednom

Idemo na sve tri ose: srpski/engleski SEO paralelno + sav tehnički polish + share-after-win viral mehanizam. Realan rok: 1 build sesija.

---

## A. Srpski/regionalni SEO landing strane

Sve nove `/sr/` strane sa unique title/description/canonical/hreflang. Targetiraju keywords gde **nema konkurencije** na srpskom/balkanskom Googlu.

```
/sr/sah-online                       "Šah online besplatno"
/sr/sah-protiv-prijatelja            "Igraj šah protiv prijatelja preko linka"
/sr/sah-bez-registracije             "Šah bez registracije — 1 klik"
/sr/sah-protiv-kompjutera            "Šah protiv kompjutera (9 nivoa)"
/sr/sah-za-pocetnike                 "Šah za početnike — naučite za 5 min"
/sr/sah-pravila                      "Pravila šaha — kompletan vodič"
/sr/sah-otvaranja                    "Najbolja šahovska otvaranja"
/sr/sahovski-rejting                 "Šahovski ELO rejting kalkulator"
```

Sve linkovane iz footera (sr-Latn sekcija), sve u sitemap, sve sa `<link rel="alternate" hreflang="sr">` na engleskim parnjacima.

## B. Engleske "for X" landing strane

```
/chess-for-kids                      "Free Chess for Kids — Safe, Ad-Free"
/chess-for-beginners                 "Learn Chess from Zero — Free Lessons"
/chess-no-signup                     "Play Chess Online — No Signup Required"
/chess-no-ads                        "Free Chess with No Ads, No Tracking"
/play-chess-vs-friend                "Play Chess vs Friend via Link (1 click)"
/free-online-chess                   "Free Online Chess — 2026"
```

## C. Openings "for beginners / counter" mini-landing

20 najpopularnijih otvaranja → `/openings/{slug}/for-beginners`. Već imamo `OPENING_SEO` data, samo treba route + template. Svaka strana: 3 ključna poteza + 2 zamke + CTA "Try in trainer".

## D. Tehnički SEO polish (utiče na SVE strane)

1. **FAQ schema na home** — JSON-LD `FAQPage` sa 6-8 najčešćih pitanja ("Is MasterChess free?", "Do I need to sign up?", "Can I play against friends?"). Google često prikazuje FAQ rich snippet.
2. **hreflang tagovi** — svaki par EN/SR ima `<link rel="alternate" hreflang>`.
3. **Internal linking footer** — masivni footer sa 60+ linkova na sve key strane (Google tretira footer linkove kao site-wide signal).
4. **`sameAs` u Organization JSON-LD** — Instagram, TikTok, YouTube, GitHub, ProductHunt profili (svi koji postoje).
5. **Breadcrumbs JSON-LD** na svakoj kategorijskoj strani (openings, bots, mates).
6. **Image alt audit** — `<img>` bez alt-a dobijaju default smislen alt (sajt-wide grep + popravka).
7. **WebSite SearchAction schema** — Google može prikazati search box ispod našeg rezultata.

## E. Share-after-win — slika sa pozicijom + QR

Trenutni share blok je tekstualni (već uradili). Nadograđujem:

- **Canvas-generated PNG** sa: finalna pozicija + tvoj username + rezultat + ELO + "Beat me at masterchess.live/vs/{slug}" + QR kod (qrcode npm paket, mali).
- Download dugme (sačuva sliku) + native `navigator.share()` na mobile (otvori IG/WhatsApp/etc) + Instagram Story link (`instagram://story-camera` deep link sa stickerom).
- Ovo je **jedini** razlog zbog kog bi neko prosledio sajt dalje van usmenog deljenja.

## F. Brand authority outreach (lista za TEBE)

Pripremim ti listu sa **30 mesta** gde da postaviš link u sledećih 7 dana. Stranica `/promotion-checklist` (private, samo za tebe) sa kopirajućim postovima:

- Reddit r/chess, r/SideProject, r/InternetIsBeautiful, r/AnarchyChess, r/chessbeginners — pre-napisani postovi
- ProductHunt — pre-napisana launch kopija
- HackerNews "Show HN" — naslov + 3 kometara
- Wikipedia stub draft (treba ti 3 reliable source — ja ti dam strukturu)
- IndieHackers, DEV.to, Medium — gotovi članci za copy/paste
- Quora 10 pitanja sa pre-napisanim odgovorima
- Chess Discord serveri lista (top 20)

---

## Tehnički deo

```
src/pages/sr/SahOnline.tsx                  (NOVO)
src/pages/sr/SahProtivPrijatelja.tsx        (NOVO)
src/pages/sr/SahBezRegistracije.tsx         (NOVO)
src/pages/sr/SahProtivKompjutera.tsx        (NOVO)
src/pages/sr/SahZaPocetnike.tsx             (NOVO)
src/pages/sr/SahPravila.tsx                 (NOVO)
src/pages/sr/SahOtvaranja.tsx               (NOVO)
src/pages/sr/SahovskiRejting.tsx            (NOVO)

src/pages/landing/ChessForKids.tsx          (NOVO)
src/pages/landing/ChessForBeginners.tsx     (NOVO)
src/pages/landing/ChessNoSignup.tsx         (NOVO)
src/pages/landing/ChessNoAds.tsx            (NOVO)
src/pages/landing/PlayChessVsFriend.tsx     (NOVO)
src/pages/landing/FreeOnlineChess.tsx       (NOVO)

src/pages/OpeningForBeginners.tsx           (NOVO — /openings/:slug/for-beginners)
src/lib/seo-faq.ts                          (NOVO — FAQ data)
src/components/HomeFaqSection.tsx           (NOVO — FAQPage + visible accordion)
src/components/SeoMegaFooter.tsx            (NOVO — 60+ link footer)
src/components/SharePositionCard.tsx        (NOVO — canvas PNG generator + QR + share)

src/App.tsx                                  + 16 novih ruta
scripts/generate-sitemap.ts                  + sve nove strane u sitemap
index.html                                   + sameAs[] u Organization, WebSite SearchAction
src/components/MatchResultModal.tsx          ucitaj SharePositionCard umesto tekst-only

src/pages/PromotionChecklist.tsx            (NOVO — privatna /promo-checklist sa svim copy-paste materijalom)

bun add qrcode @types/qrcode
```

## Procene

- ~16 novih SEO strana → 6-12 nedelja do prvih top-10 rangiranja za pojedine long-tail
- FAQ + breadcrumbs + sameAs → moguć **rich snippet** za 2-4 nedelje
- Canvas share card → 5-15% korisnika koji pobede će prosediti (industry standard za share-after-win)
- Promotion checklist → tvojih 7 dana × 30 platformi = realan šut na ProductHunt #1 daily + 5-10 backlink-ova trajno

---

## Šta NE radim (svesno)

- Ne ciljam "chess" keyword direktno — nemoguće.
- Ne pravim fake reviews / fake user counts.
- Ne diram home layout (tvoj veto).
- Ne dodajem nove gamification sisteme.
- Ne pravim novi feature dok ove SEO/viral baze ne odradi sledećih 4 nedelje.

---

## Sledeći korak

Klikni **Implement plan**. Idem redom: srpski strane → engleski landing → openings → tehnički schema/footer → canvas share card → promotion checklist. Realno 1 build sesija, posle toga ti igraš svoj content posao.
