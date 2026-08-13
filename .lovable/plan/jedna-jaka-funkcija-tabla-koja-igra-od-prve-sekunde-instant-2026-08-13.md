# Jedna jaka funkcija: "Tabla koja igra od prve sekunde" (Instant Hero Board)

Cilj: posetilac koji prvi put dođe na masterchess.live ne mora ni na jedan klik da bi počeo partiju. Tabla je na vrhu homepage-a i živa je — potez mišem = partija je počela. To jednim udarcem pokriva sve četiri stvari koje si izabrao: brzi ulaz u igru, razlog da se vrate, materijal za deljenje i sadržaj za Google.

## Kako to radi za igrača

1. Dolazi na `/` i vidi pravu tablu (ne sliku) sa porukom "Odigraj potez — partija počinje".
2. Prvi potez odmah pokreće partiju protiv bota na njegovom nivou, bez naloga, bez menija.
3. Tokom partije se nad tablom pojavljuje mali brojač poteza i streak srce: "pobedi i imaš dan 1 streak-a".
4. Na kraju partije jedna kartica sa tri stvari, u tom redu:
   - **Sačuvaj rezultat** (napravi besplatan nalog, jedno polje)
   - **Podeli** (slika rezultata, link `masterchess.live/vs/<kod>` za revanš)
   - **Igraj ponovo** (isti bot, jedan klik)
5. Ako zatvori sajt bez naloga, rezultat ostaje u pregledaču i sledeći put ga vidi kao "nastavi svoju seriju" — to je povratak.

## Zašto ovo, a ne pet manjih izmena

Sada posetilac prvo mora da shvati sajt, pa da klikne, pa da nađe protivnika. Svaki od tih koraka gubi ljude. Kada je tabla prvo što vidi i sama poziva na potez, prosečno vreme na sajtu i broj odigranih partija rastu — a odigrana partija je jedini trenutak kada čovek ima šta da podeli i razlog da se vrati.

## Šta se pravi (tehnički deo)

- Nova komponenta `src/components/InstantHeroBoard.tsx`: chess.js + postojeća tabla, "prvi potez pokreće", bot odgovara lokalno (postojeći bot sloj, bez Stockfish čekanja za prvih par poteza), Merida set, gold/black stil.
- Ubacuje se u `src/pages/IndexFull.tsx` iznad postojećeg heroja; `HomeProofRow` ostaje ispod nje. Nema redizajna Home-a — samo dodavanje bloka na vrh.
- Kraj partije: reuse `ShareWinCard` / `SharePositionCard` za sliku i postojeći `/vs/{code}` viralni link, plus CTA na `/signup` koji nosi rezultat kao parametar da se partija upiše na novi nalog.
- Gost stanje u `localStorage` (`mc_guest_streak`, poslednja partija) + prikaz "nastavi seriju" pri sledećoj poseti.
- SEO: `Instant play` blok dobija pravi H1/H2 tekst i `PlayAction` JSON-LD na `/`, tako da Google vidi "igraj šah online besplatno bez registracije" na samoj naslovnoj.
- Mobilna provera na 390px i desktop 1280px preko preview snimka.

## Šta se NE dira

Home dizajn ostaje (tvoj veto), navbar ostaje 5 glavnih linkova, nema AI pomoći u ljudskim partijama, nema lažnih igrača ni simulirane aktivnosti.
