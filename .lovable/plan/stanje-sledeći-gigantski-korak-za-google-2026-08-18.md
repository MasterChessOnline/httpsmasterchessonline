# Stanje + sledeći gigantski korak za Google

## Odgovor na pitanja

**Da li online radi? NE.** Hostovana baza je trenutno pauzirana. Dok je tako:
registracija, prijava, online partije, turniri i standings ne rade. Partije protiv
botova rade (sve je lokalno). Ovo mora prvo da se odblokira — nijedna marketing
ideja nema efekta ako posetilac ne može da napravi nalog.

**Da li su svi problemi rešeni?** Rešeno je ono što zavisi od koda: gost čuva
napredak lokalno, `/signup` mu pokazuje šta gubi, iskren baner kad backend padne,
bolji naslovi/opisi za Google, gradovi ulinkovani u futeru. Ostaje: pokretanje baze
i nedostatak masovnih stranica koje Google voli.

## Šta radim posle odobrenja

### 1. Provera i otpornost backenda
- Posle tvog "resume" proverim stanje, pa automatski pošaljem sačuvane email adrese
  iz reda čekanja i vratim online funkcije.
- Turnirske i online strane dobijaju jasno stanje "privremeno nedostupno" umesto
  praznog ekrana.

### 2. Masovne stranice na Google-u (kao chess.com)
Postoji već: otvaranja, gradovi, srpske landing strane, `/beat/:bot`. Dodajem četiri
nova tipa stranica koje chess.com i slični koriste za milione poseta:

| Tip | Primer rute | Zašto |
| --- | --- | --- |
| Šahovski termini / rečnik | `/chess-terms/en-passant` | ogroman dugorepni saobraćaj, lako se rangira |
| Poznati majstori i njihove partije | `/players/magnus-carlsen` | stalna pretraga imena |
| Slavne partije sa replay pločom | `/games/immortal-game` | ljudi traže konkretne partije |
| Mat obrasci i taktike | `/tactics/back-rank-mate` | „kako dati mat" pretrage |

Svaka stranica: kratko objašnjenje, **interaktivna tabla** (odigraj/ponovi poziciju),
FAQ blok za rich rezultate, interni linkovi i CTA „create free account".

### 3. Skriveni pojačivači (ovo chess.com radi, mi ne)
- **Sitemap index + auto-generisanje** svih novih stranica, IndexNow ping na Bing/Yandex.
- **Breadcrumb + Article/FAQ JSON-LD** na svakoj generisanoj strani (bogatiji izgled u pretrazi).
- **Interni „related" blok** na dnu svake strane — nema više strana bez linkova.
- **Sličica za deljenje po strani** (og slika) da linkovi na WhatsApp/IG izgledaju ozbiljno.
- **„Rešeno danas" dnevni sadržaj** na zagonetkama — Google voli strane koje se menjaju.

### 4. Zadržavanje posetioca (vreme na sajtu)
- Posle svake partije protiv bota: predlog „sledeći protivnik / naredna zagonetka"
  umesto praznog ekrana.
- Mini serija od 3 zadatka na svakoj SEO strani — posetilac ostane minutima, a ne sekundama.

## Tehnički detalji
- Novi generatori u `src/lib/` po uzoru na `seo-cities.ts` i `seo-landings-en.ts`;
  po jedna ruta sa `:slug` parametrom u `src/App.tsx` za svaki tip stranice.
- `scripts/generate-sitemap.ts` dobija unose iz tih generatora, pa se sitemap
  automatski proširuje pri svakom build-u.
- Zajednička komponenta strane (tabla + FAQ + related linkovi + CTA) da se ne
  duplira kod po tipovima.
- Bez izmena u pravilima igre i bez ikakvih lažnih podataka o aktivnosti.

## Prvo od tebe
Pokreni (resume) hostovanu bazu iz Cloud podešavanja — zatim odmah proveravam da
online partije, registracija i turniri rade.
