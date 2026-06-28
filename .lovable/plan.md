## Status: Turnir NIJE na Chess-Results.com

Pretražio sam chess-results.com za "Brakus", "DB Chess Cup" i "MasterChess" — **nema rezultata**. Razlog: Chess-Results ne prihvata automatske API submisije. Turnir mora ručno da pošalje arbitar/organizator (ili da se uploaduje `.tur` fajl iz Swiss-Managera).

To znači — ja ne mogu da "stavim" turnir na chess-results sa svoje strane. Ali mogu sve oko toga da pripremim tako da ti (ili arbitar) samo pošalješ jedan email i turnir bude objavljen za par sati.

---

## Plan: Chess-Results Submission Pack (auto-generisan)

### 1. Edge funkcija `tournament-chess-results-pack`
Jedna ruta koja vraća **kompletan ZIP/JSON paket** spreman za slanje na `chess-results@swiss-manager.at`:
- `DB_Chess_Cup_announcement.trf` (FIDE TRF sa svim poljima koje CR zahteva)
- `DB_Chess_Cup.tur` (Swiss-Manager native fajl — najbrži put, CR ga direktno učita)
- `announcement_email.txt` (popunjen email body na engleskom + srpskom)
- `tournament_details.json` (fallback metadata)

### 2. Novi tab "Chess-Results SRB" na `/dragan-brakus`
Trenutno postoji panel sa exportima, ali nedostaje:
- **Status badge**: "Pending submission" / "Listed on Chess-Results" (ručno toggle iz admina)
- **One-click "Generate submission pack"** dugme — skida sve fajlove odjednom
- **Pre-filled mailto:** link sa popunjenim subject/body — arbitar samo klikne Send
- **Link polje** za CR URL kad bude objavljen (čuva se u `tournaments.chess_results_url`)

### 3. DB migracija
- `tournaments.chess_results_url` (text)
- `tournaments.chess_results_status` (enum: not_submitted, submitted, listed)
- `tournaments.chess_results_submitted_at` (timestamptz)

### 4. Provera obaveznih polja koje CR traži
CR neće objaviti turnir ako fali ijedno od ovih — proveriću trenutni record u `tournaments` i popuniti šta nedostaje:
- Chief Arbiter (ime + FIDE ID) — **trenutno prazno**
- Organizer federation: SRB ✓
- Time control u FIDE formatu: `3+2` blitz ✓
- Rating type: FIDE Blitz / National / Unrated — **treba odluka**
- Place: "Beograd, Srbija" + venue (online ili fizička adresa)
- Tournament director email

### 5. Docs update
- `docs/CHESS_RESULTS_SUBMIT.md`: dodati tačan workflow ("Klik Generate → otvoriće se mail klijent → Send")
- Vremenski plan: pošalji najmanje 48h pre starta da bi turnir bio listovan na vreme

---

## Šta mi treba od tebe pre nego što počnem

Nekoliko podataka koja CR **obavezno zahteva** a kojih trenutno nema u bazi:

1. **Chief Arbiter** — ime i FIDE ID (može i tvoje ako si registrovan, inače treba neko sa FIDE arbiter titulom)
2. **Rating tip** — da li hoćeš da bude:
   - FIDE Blitz rated (treba prijava kod FIDE-a + arbiter sa licencom)
   - Nacionalno rated (preko ŠSS)
   - **Unrated/Friendly** (najlakše, ide odmah na CR bez dodatnih dozvola)
3. **Mesto održavanja** — online (`masterchess.live`) ili fizička lokacija?
4. **Tvoj kontakt email** za organizator polje

Reci mi te 4 stvari (ili "stavi unrated, online, ja sam organizator, email X") i kreniem sa implementacijom.
