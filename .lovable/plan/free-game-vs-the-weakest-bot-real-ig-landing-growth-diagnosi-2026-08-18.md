# Free game vs. the weakest bot + real /ig landing + growth diagnosis

## Najvažnije prvo: baza je pauzirana

Provera stanja backenda upravo sada vraća: **hostovana baza je pauzirana**. Sve
provere baze (broj korisnika) su pale na timeout. Dok je pauzirana:

- registracija i prijava ne rade,
- online partije, turniri, rejting, DB Chess Cup ne rade,
- svaki posetilac koji klikne "Create free account" udara u grešku.

Prvi korak plana je da se backend vrati u aktivno stanje i da se prijava/registracija
testira uživo. Sve ostalo je besmisleno ako ovo ne radi.

## Šta se menja u aplikaciji

### 1. Homepage free partija — protiv najslabijeg bota, odmah

- Protivnik na naslovnoj tabli se menja sa `Nikola Sakotić` (3500) na
  **Newbie Nina (420)** — najslabiji bot na sajtu, da gost pobedi prvu partiju.
- Bot odgovara maksimalno brzo (kratko "razmišljanje"), bez čekanja.
- Isti najslabiji bot i na `/play-guest` (sada je tamo Pawn Pablo).
- Nikola bot ostaje kao izazov na `/play` (nije obrisan, samo nije prvi protivnik).

### 2. Prava `/ig` landing ruta za Instagram reklame

Trenutno `/ig` samo odmah preusmeri na `/play-guest`, pa se reklamni saobraćaj
ne može meriti odvojeno. Nova `/ig` stranica:

- jedan ekran, bez navbara i futera, tabla vidljiva bez skrolovanja,
- partija počinje prvim potezom (nula klikova), protivnik = najslabiji bot,
- **nema signup poziva do kraja prve partije** — samo tabla i mikro-tekst
  "Free · no signup",
- posle prve partije: puni ekran "Create free account" (Google + email),
  "Share result", "Play again",
- `?ref=` / `utm_*` parametri se čuvaju lokalno i vezuju za nalog pri
  registraciji, tako da vidiš koliko naloga je došlo sa IG reklame,
- `noindex` na `/ig` (reklamna stranica ne treba u Google), ostaje brz LCP.

### 3. "Create free account" na svakom ekranu

- Gost bar (fiksna traka pri dnu) na svim javnim stranicama, ne samo na nekim.
- Posle svake završene gostujuće partije: rezultat se "čuva" samo ako napravi
  nalog — jedna jasna poruka, bez više konkurentnih dugmadi.

### 4. Stabilizacija

- Fallback poteza ako engine zakaše (već dodato na naslovnoj) prenosi se i na
  `/play-guest`, da tabla nikad ne zamrzne.
- Provera da naslovna radi i kad je baza nedostupna (tabla i dalje igra, a
  dugmad za nalog prikazuju jasnu poruku umesto tihe greške).

## Zašto sajt 5 meseci ne raste — po brojevima

Poslednjih 30 dana (stvarni podaci projekta):

- **660 posetilaca / 1881 pregleda** — oko 20 posetilaca dnevno, bez rasta trenda.
- **Izvori: Direct 282, Bing 242, DuckDuckGo 47, Instagram 44, Google samo 25.**
  Google praktično ne dovodi saobraćaj — a Google je 90% tržišta. Bing indeksira,
  Google ne. To je najveći pojedinačni problem.
- **Najgledanije strane:** `/` 502, `/play-guest` 172, `/play` 153, a `/signup`
  samo 32 pregleda. Znači: ljudi dođu i igraju kao gosti, ali skoro nijedan ne
  stigne do registracije.
- **Bounce 44%, prosečna sesija 173 s** — zadržavanje nije katastrofa; problem je
  količina saobraćaja i konverzija u nalog.
- **Uređaji: desktop 544, mobile 175** — a Instagram saobraćaj je 100% mobilni,
  pa mobilna verzija mora biti prioritet za reklame.
- **Zemlje: US 95, IN 74, RS 69, RU 38, CN 37, BR 34.**

Dijagnoza u jednoj rečenici: nije problem u broju funkcija (sajt ih ima previše),
problem je što (a) baza je pauzirana i registracija trenutno ne radi, (b) Google
ne indeksira sajt, (c) gosti igraju ali ne prave nalog.

## Plan rada po prioritetu

1. Vrati backend u rad i testiraj registraciju/prijavu uživo (Google + email).
2. Najslabiji bot + instant partija na `/` i `/play-guest`.
3. Nova `/ig` landing sa signup-om posle prve partije i UTM praćenjem.
4. "Create free account" dosledno na svim javnim stranama.
5. Google indeksiranje: provera Search Console-a (indexing report), uklanjanje
   tankih auto-generisanih strana koje razblažuju sajt, interni linkovi ka 10
   strana koje imaju stvarnu vrednost.
6. Merenje: jedan admin ekran koji pokazuje samo 4 broja dnevno — posetioci,
   odigrane gost-partije, novi nalozi, vraćeni korisnici.

## Instagram reklame — koje države tagovati

- **Primarno: Srbija, BiH, Crna Gora, Hrvatska** — tvoja priča (13 godina, domaći
  kreator) najbolje konvertuje, jeftin CPM, isti jezik za komentare i DM-ove.
- **Skaliranje jeftino: Indija, Filipini, Indonezija, Brazil** — najniži CPM,
  ogromna šahovska publika na mobilnom.
- **Retargeting samo: US, UK, Nemačka** — skupo za hladan saobraćaj.
- Interesi: Chess, Magnus Carlsen, chess.com publika, "Queen's Gambit", Duolingo
  (učenje kroz igru). Format 9:16, 7-10 s: prvi potez → "Free, no signup" → CTA.
- Sav saobraćaj ide na `masterchess.live/ig` (sa `?utm_source=ig&utm_campaign=...`).

## Tehnički detalji

- `src/components/InstantHeroBoard.tsx`: `HERO_BOT` → `newbie-nina`, kraći
  `getBotThinkMs` cap.
- `src/pages/PlayGuest.tsx`: `GUEST_BOT` → `newbie-nina`, isti fallback potez
  u `catch` bloku kao na naslovnoj.
- `src/pages/IgLanding.tsx`: brisanje `navigate("/play-guest")` redirekta;
  stranica dobija sopstvenu instant tablu (izdvojena logika iz
  `InstantHeroBoard` u zajednički hook `useInstantBotGame`), `noindex` u `Seo`,
  UTM/ref upis u `localStorage` (`mc_attribution`) i čitanje pri registraciji.
- `src/components/GuestSignupBar.tsx`: montiranje na svim javnim rutama preko
  layout-a, a ne po stranici.
- Nema izmena u shemi baze; atribucija se upisuje u postojeći profil zapis pri
  prvoj prijavi.
