# Odgovori na 5 pitanja + plan za poslednjih 5 kredita

## Prvo: pravi brojevi (analitika 8.7 – 7.8.2026)

| Metrika | Vrednost |
|---|---|
| Posetioci (30 dana) | **532** (~18/dan) |
| Pregleda strana | 1454 (2.73 po poseti) |
| Bounce | 47% |
| Prosečna sesija | 156 s |
| Desktop / mobile | 536 / 137 (mobilnih samo ~20%) |
| Novi nalozi (poslednje merenje) | ~13 u 30 dana → konverzija ~2.4% |
| Online partije (7 dana) | 1 |
| Email / push pretplate | 0 / 0 |

Izvori: Direct 375, Bing 170, DuckDuckGo 27, **Google samo 26**, Instagram 19, ChatGPT 12.
Najgledanije: `/` 405, `/play-guest` 139, `/play` 108, `/analysis` 46, `/play/online` 42.
Zemlje: RU 115, US 104, IN 57, RS 52 — publika je globalna, ne balkanska.

(Bazu danas nisam mogao da pročitam — konekcija je pucala; brojevi naloga su iz prethodnog merenja i treba ih ponovo potvrditi.)

## Odgovori

1. **Da li ljudi dolaze?** Ne dovoljno: ~18/dan. Na tom nivou nijedna nova funkcija ne može da napravi rast — problem je i marketing i konverzija istovremeno.
2. **Da li početna strana objašnjava sajt?** Delimično. Ima jasno "Play Online" dugme, ali nema u jednoj rečenici *zašto MasterChess a ne drugi* i nema dokaza (broj partija, ko je online, ko je Nikola). 47% bounce i 2.7 strane po poseti to potvrđuju.
3. **Da li postoji razlog da se vrati sutra?** Tehnički da (turnir, zagonetke, TV), ali praktično **ne** — 0 email i 0 push pretplata znači da nema nijednog kanala kojim možemo da ga pozovemo da se vrati.
4. **Da li ima aktivnih igrača?** Ne. 1 online partija u 7 dana, 42 posete `/play/online`. Skoro svi koji kliknu "Play Online" ne nađu nikoga.
5. **Da li ljudi čuju za sajt?** Malo. Google daje 26 poseta u 30 dana, Bing 170 — dakle Google nas praktično ne prikazuje, i nema nijednog stabilnog kanala osim direktnog.

**Reklame:** ne. Slažem se — sa 18 posetilaca dnevno reklame samo usporavaju sajt i kvare poverenje. Tek posle stabilnih ~500 posetilaca dnevno.

## Plan za 5 kredita (bez novih velikih funkcija)

### 1. Početna strana: 5-sekundna jasnoća
- Ispod H1 jedna rečenica koja kaže zašto je MasterChess drugačiji (bez motora u ljudskoj partiji, bez reklama, bez pretplate).
- Jedan primarni CTA "Play Now" (odmah partija), sekundarni "Create free account". Trenutna tri jednako jaka dugmeta cepaju pažnju.
- Kratak "proof" red: broj registrovanih igrača + koliko je online sada (stvarni podaci, bez izmišljanja).
- Bez redizajna ostatka Home strane.

### 2. Registracija u najmanje koraka
- Skratiti formu na email + šifra (+ Google), sve ostalo posle prve partije.
- Posle registracije korisnik ide direktno u partiju, ne na praznu stranu.

### 3. Mobilni prikaz
- `/`, `/play-guest`, `/play/online` proveriti na 390px: veličina dugmadi, navbar, tabla bez horizontalnog skrola. Mobilnih je samo 20% — verovatno zato što je iskustvo lošije.

### 4. "Play Online" nikad prazan
- Kad nema protivnika, odmah ponuditi bota iste jačine + link za poziv prijatelja + "obavesti me kad neko uđe". (Osnov postoji, treba dovesti do kraja i pojačati vidljivost.)

### 5. Jedan kanal za povratak korisnika
- Email polje na jednom mestu koje stvarno upisuje red u `email_preferences`, pa dnevna zagonetka mejlom počne da radi. Bez toga svaka poseta je jednokratna.

## Tehnički detalji
- Izmene su pretežno u `src/pages/Index.tsx` (copy + CTA hijerarhija + proof red), stranama za prijavu/registraciju, i responzivnim klasama na `/play-guest` i `/play/online`.
- Proof brojevi se čitaju iz postojećih tabela (`profiles`, presence hook) — bez novih tabela.
- Pre bilo koje tvrdnje o brojevima naloga ponovo pročitati bazu (danas je konekcija padala).

## Šta NE radimo
- Nikakve reklame na sajtu.
- Ne redizajniramo Home iz temelja.
- Ne pravimo nove SEO strane dok Google ne počne da indeksira postojeće.
- Nikakvi lažni igrači ni izmišljena aktivnost.
