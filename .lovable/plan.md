## Sledeći korak: Optimizacija stranica koje već rangiraju (najveći ROI sada)

GSC podaci pokazuju da postoje stranice koje **već rangiraju ali ne donose klikove** jer su title/meta loši. Prepravka ovih tagova = klikovi za 2-3 nedelje (bez čekanja na indeksiranje).

### Šta menjam

**1. Home (`/`) — query "master chess"**
- Trenutno: 719 impresija, poz. 11.9, samo 8 klikova (1.1% CTR)
- Cilj: poz. 5-7, CTR 5%+ = ~35 klikova/mesec iz jednog query-ja
- Novi `<title>`: `MasterChess — Play Free Online Chess | Multiplayer, Bots, Tournaments`
- Nova `<meta description>`: poziv na akciju + "13-year-old founder" hook + ključne reči

**2. `/openings/nimzo-indian-defense` — query "Kasparov vs Karpov 1985 E20"**
- 29 impresija, poz. 8, 0 klikova
- Dodaj sekciju "Famous Games: Kasparov vs Karpov 1985" sa PGN-om
- Title: `Nimzo-Indian Defense (E20) — Kasparov vs Karpov 1985 Analysis`
- H1 koji match-uje query

**3. `/elo/2200`, `/elo/1600`, `/elo/1500`, `/elo/600` — ELO queries**
- Imaju impresije, 0 klikova
- Title format: `What is {ELO} Chess Rating? Skill Level & How to Reach It`
- Dodaj FAQ schema (FAQPage JSON-LD) — Google često prikazuje rich snippet

**4. `/famous-games/carlsen-anand-game-6-2` — Carlsen-Anand query**
- Poz. 11.7, 0 klikova
- Title: `Carlsen vs Anand Game 6 (2014 WC) — Move-by-Move Analysis`

**5. `/tools/stockfish-online` — "stockfish.online fen depth"**
- Title: `Free Stockfish Analysis Online — FEN & Depth Tool`

### Tehnička izvedba
- Svaka stranica koristi react-helmet-async (već postoji u projektu)
- Dodajem FAQPage JSON-LD na ELO stranice za rich snippets
- Posle deploya: ponovo submit u GSC (automatski)

### Kredita: ~10-15
### Rezultat: 50-150 dodatnih klikova/mesec za 2-4 nedelje (bez ikakvog drugog rada)

### Šta NE radim
- Nove stranice (već ih ima 1000+)
- Backend izmene
- AI funkcionalnost

---

Odobravaš? Napiši "kreni" ili reci šta da promenim.
