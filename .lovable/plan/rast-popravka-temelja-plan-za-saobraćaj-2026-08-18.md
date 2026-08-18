# Rast: popravka temelja + plan za saobraćaj

## Šta je stvarno stanje (provereno danas)

- **Baza je pauzirana.** Registracija, prijava, online partije, turniri i sve što piše u bazu trenutno ne rade. Ovo je blokada broj 1 — dok ovo traje, svaki posetilac koji hoće nalog udara u zid.
- **Sajt JESTE indeksiran na Google-u.** Naslovna je "Submitted and indexed", poslednji crawl 17. avgusta, robots dozvoljava. Ranija tvrdnja "nije indeksiran" nije bila tačna.
- Pravi problem nije indeksiranje, nego **pozicija i klik-rata**: 19.07–15.08. → 1002 prikaza, 21 klik, CTR 2.1%, prosečna pozicija **34.8** (druga/treća strana Google-a).
- Postoje stranice sa odličnom pozicijom ali bez prikaza (`/play-from/banja-luka` poz. 1, `/about` poz. 5, `/bot/nikola-sakotic` poz. 1) i jedna sa mnogo prikaza a bez klikova (`/sr/sah-protiv-kompjutera-besplatno`: 130 prikaza, 1 klik, poz. 41).
- Upiti koji već donose prikaze su srpski: „besplatan šah", „šah protiv kompjutera", „besplatni internet šah".

## Korak 1 — Vrati bazu (bez ovoga ništa drugo nema smisla)

Bazu moraš ti da odmrzneš iz Cloud podešavanja (dugme View Backend). Kad je aktivna, provera:
- registracija email + Google radi do kraja,
- prijava na DB Chess Cup upisuje igrača,
- online partija se kreira i sinhronizuje.
Ako nešto pukne posle odmrzavanja, popravljam u istom koraku.

## Korak 2 — Otpornost kad baza ne radi

Da se ovakav ispad više ne pretvori u 100% izgubljenih posetilaca:
- Gost može da igra i beleži rezultat lokalno čak i kad backend ne odgovara (već delimično radi, dopuniti).
- Ako signup padne zbog backenda: umesto tihe greške, hvatamo email lokalno + jasna poruka „vratićemo ti se za par minuta", i automatski retry kad backend oživi.
- Mali health-check indikator u admin panelu da vidiš stanje bez pitanja.

## Korak 3 — CTR i pozicija (ovo donosi klikove, ne novi sadržaj)

Fokus na stranicama koje već imaju prikaze:
- Prepisati `title` i `description` za `/sr/sah-protiv-kompjutera-besplatno` i naslovnu tako da sadrže tačne upite iz Search Console-a („besplatan šah protiv kompjutera", „bez registracije") — 130 prikaza sa 1 klikom je čist gubitak.
- Dodati unutrašnje linkove sa naslovne i iz članaka ka stranicama koje su na poziciji 1–10 ali bez prikaza (gradovi, botovi, alati) — trenutno su siročići.
- Konsolidovati kanonik: `masterchess.live` bez kose crte vs sa njom — uskladiti da Google ne bira umesto nas.
- Sažeti tanke programske stranice: gde ima 5+ skoro identičnih strana, ostaviti jednu jaku (tanke duplikate Google drži na poziciji 40+).
- Dodati FAQ i HowTo strukturirane podatke na glavne „šah besplatno" strane — daje rich rezultat i veći CTR sa iste pozicije.

## Korak 4 — Konverzija posetioca u nalog

- „Create free account" ostaje posle prve odigrane partije (radi na `/ig`), ali dodati istu logiku i na `/play-guest` i naslovnu: posle 1. pobede iskače kartica „sačuvaj rezultat".
- Gost akumulira serije i rezultate lokalno; na signup ekranu piše šta konkretno gubi ako ne napravi nalog („3 pobede, streak 3, rating 780 — sačuvaj").
- Google jedan-tap odmah na signup ekranu kao prva opcija (forma ispod).
- Merenje: brojači „gost odigrao partiju" → „video signup" → „napravio nalog", vidljivi u admin panelu, da prestanemo da gađamo naslepo.

## Korak 5 — Dodatne ideje rasta (posle temelja)

- **Bing radi bolje od Google-a** (242 vs 25 poseta) — dodati Bing Places + IndexNow na svaku novu stranu, pa udvostručiti kanal koji već konvertuje.
- **Deljivi rezultat partije**: slika sa završnom pozicijom + „pobedio sam Newbie Nina" → link vodi na istu partiju za revanš.
- **Ponovni dolazak**: nedeljni email „tvoja partija čeka" za sve goste koji su ostavili email.
- **Lokalni fokus**: 5–6 najjačih gradskih strana (Banja Luka već poz. 1) sa pravim sadržajem umesto desetina praznih.

## Tehnički detalji

- Baza: `supabase--cloud_status` vraća paused; odmrzavanje je akcija korisnika, posle toga radim `read_query` proveru tabela `profiles`, `tournament_registrations`, `games`.
- SEO: promene u `index.html` i `Seo` komponenti po ruti; sitemap ostaje, IndexNow poziv posle batch-a.
- Konverzija: `InstantHeroBoard`, `PlayGuest`, `Signup` + lokalni brojači u `localStorage`, agregat u postojeću analitiku.
- Bez izmena u gameplay logici i bez novog dizajna naslovne.
