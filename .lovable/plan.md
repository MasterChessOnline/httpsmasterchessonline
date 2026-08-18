# Prvi ekran koji zadržava igrača + ciljanje Google pretrage

Cilj: kad neko prvi put uđe na masterchess.live, u prve 3 sekunde vidi
jednu jasnu stvar (odigraj potez), a ne 15 sekcija. I da postoji
jednoznačan odgovor na pitanje "zašto baš ovaj sajt".

## 1. Očistiti prvi ekran (najveći uticaj)

Početna sada ima preko 20 sekcija na jednoj strani. Novi posetilac
skroluje kroz sve i odlazi.

- Prvi ekran za goste ostaje samo: naslov u jednoj liniji, živa tabla
  (Instant Hero Board) sa "ti si na potezu", i jedan CTA.
- Streak kartica se za goste prikazuje tek nakon prvog odigranog poteza
  (nagrada, ne još jedan blok pre igre).
- Sve ostalo (media hub, statistika, zajednica, turniri, YouTube, news)
  ide ispod prvog ekrana i grupiše se u 4 sekcije sa jasnim naslovima.
- Za prijavljene korisnike ostaje bogatiji dashboard — čišćenje se
  odnosi na prvi dolazak gosta.

## 2. Jasan odgovor "zašto baš MasterChess"

Jedna rečenica + tri razloga, vidljivo na prvom ekranu i ponovljeno na
`/manifesto`, `/ig`, `/signup` i u meta opisima:

- Igraš odmah, bez naloga i bez reklamnih prepreka.
- Bez motora i saveta u partijama protiv ljudi — čista ljudska igra.
- Sve je besplatno: turniri, analiza, treninzi, bez plaćenih nivoa.

## 3. Hook za povratak svaki dan

- Streak kartica ostaje, ali dobija jasnu nagradu: Day 3 = novi bot,
  Day 7 = bedž + coins.
- "Sutra u 20:00" prime-time podsetnik u istoj kartici.
- Za goste: poruka da streak nestaje bez naloga → registracija.

## 4. Ciljanje Google pretrage

- Istraživanje realnih upita: uzeti "striking distance" upite iz Search
  Console-a (pozicije 8-30) i njima prilagoditi naslove postojećih
  stranica — to je najbrži dobitak bez novih strana.
- Naslovi/opisi za ključne rute (`/play/online`, `/lobby`, `/watch`,
  `/beat/:bot`, `/chess-in/:grad`) prepisati po upitu, ne po brendu.
- Dodati FAQ blok ("Da li je besplatno?", "Mogu li igrati bez naloga?")
  na početnu i `/signup` sa FAQ strukturiranim podacima — daje prošireni
  rezultat u Google-u.
- Dopuniti `index.html`: prazne verifikacije za Bing i Yandex ostaju
  neispunjene; ako želiš, dodaću kodove kad ih pošalješ.

## 5. Provera da ceo sajt radi

- Proći kroz sve glavne rute u pravom browseru (gost i prijavljen):
  početna, `/play-guest`, `/play/online`, `/lobby`, `/watch`, `/puzzles`,
  `/signup`, turnir — i popraviti sve što pukne ili je prazno.
- Provera na telefonskoj širini (369px) jer većina saobraćaja sa
  Instagrama dolazi mobilno.

## Tehnički detalji

- `src/pages/IndexFull.tsx`: uvesti `isGuest` granu za prvi ekran,
  prebaciti `DailyHookCard` da se prikazuje uslovno, ostatak sekcija
  spakovati u 4 grupisane sekcije uz `LazyMount`.
- `src/components/DailyHookCard.tsx`: dodati milestone nagrade i
  prime-time red.
- Novi `src/components/WhyMasterChess.tsx` za tri razloga, koristi se na
  početnoj, `/ig` i `/signup`.
- `SeoFaqBlock.tsx` ponovo iskoristiti na početnoj i `/signup`.
- Search Console upiti preko postojeće `gsc-opportunities` funkcije;
  bez izmena baze.
- Provera rute Playwright-om, uz screenshot-e na 369px.
