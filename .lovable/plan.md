## 1. Boje & teksture — automatski, bez switcher-a

**Skidamo theme picker iz navbar-a.** Umesto izbora, sajt dobija jedan bogat, višebojni "MasterChess Live" izgled koji svi vide isto:

- Ukloniti `<SiteThemePicker/>` iz navbar-a (desktop + mobile), zadržati `applySiteTheme("live")` kao jedini bootstrap u `main.tsx`.
- Novi `live` theme u `src/lib/site-themes.ts` + odgovarajući blok u `src/index.css`:
  - **5 boja u paleti:** zlatna (#d4af37 akcenat), safir plava (#3b82f6 linkovi/CTA), smaragd (#10b981 "online/live"), korala (#fb923c upozorenja/timer), duboka noć (#0b1020 pozadina).
  - **Teksture:** suptilan noise/grain layer preko `body::before`, radial gold glow iza hero sekcija, dijagonalni "felt" pattern na karticama turnira, šahovska 8×8 vodena marka u footeru.
- Ostali themes/key-evi ostaju u kodu samo radi backward-compat (localStorage migracija → `live`), ali se nigde ne biraju.

## 2. End-to-end test DB Chess Cup sa 50+ igrača

Pun FIDE Dutch Swiss probni run, bez ljudi:

1. **Seed:** `tournament-seed-bots` pozvati sa `count=64` (već postoji u `TournamentTestHarness`). Botovi: realistični rating spread 1400–2400, FIDE ID placeholder, federation = SRB.
2. **9 rundi simulacije:** novi orchestrator edge function `tournament-simulate-full` koji u petlji zove `tournament-pair-round` → `tournament-simulate-round` × 9 i loguje izveštaj.
3. **Validacija (assertions u funkciji):**
   - svaki igrač igra svaku rundu (pairings count == ceil(N/2))
   - nijedan par se ne ponavlja
   - color balance ≤ 2 razlike, nikad 3 iste boje u nizu
   - bye: max 1 po igraču, najniže rangirani bez prethodnog bye-a
   - half-point bye request poštovan
   - Buchholz/Buchholz Cut1/Sonneborn/Progressive ručno preračunati i upoređeni sa DB vrednostima
4. **UI test harness:** dodati dugme "Simuliraj ceo turnir (9 rundi)" + "Audit izveštaj" u `TournamentTestHarness`, prikazuje JSON dijagnostiku i greške crveno.
5. **Purge** ostaje pre live eventa.

## 3. Više turnira (ne samo DB Cup)

Dodati 4 ponavljajuća turnira u `tournaments` tabelu + UI kartice na `/tournaments`:

| Naziv | Format | Vreme | Ritam |
|---|---|---|---|
| **MasterChess Monday Blitz** | 7-round Swiss | Pon 20:00 | 3+2 |
| **Tuesday Titled Arena** | 90-min Arena | Uto 19:00 | 3+0 |
| **Thursday 960 Chaos** | 5-round Swiss, Chess960 | Čet 20:00 | 5+3 |
| **Sunday Classical Open** | 5-round Swiss | Ned 17:00 | 15+10 |

Plus jednokratni **"Brakus Warm-Up"** 3 dana pre DB Cup-a (5 rundi blitz, free entry, top 10 dobija seed-prednost). Svaki ima auto-pairings, prize tier u Master Coins, i ulazi u zajednički "Tournaments hub" sa countdown-om.

## 4. Brutalne ideje (1 odabrati za prvu turu)

- **A. Live Bracket Wall** — `/tournaments/wall` veliki TV-mode prikaz svih aktivnih partija turnira u realnom vremenu, jedan klik → spectate.
- **B. Predict & Earn** — pred svaku rundu DB Cup-a gledaoci predviđaju ishode tabli, tačan pogodak = Master Coins. Drži publiku angažovanu 9 rundi.
- **C. "Last Pawn Standing"** — Brakus dan-1 sporedni event: knockout, eliminisani gledaju i navijaju sa chat reaction-ima, pobednik dobija ulaz u glavni turnir.
- **D. Sponsor Boards** — top 10 tabli svake runde imaju "presented by [partner]" overlay → monetizacija + razlog partnerima da promovišu link.

## Tehnički sažetak

- **Frontend:** uklanjanje `SiteThemePicker` (Navbar + mobile bottom bar), novi `live` token-set u `index.css`, noise/glow tekstura kao CSS layers, kartice turnira na `/tournaments`.
- **Backend:** `tournament-simulate-full` edge function, insert 4 recurring + 1 warm-up turnira (insert tool, ne migration), proširenje audit logike u `tournament-simulate-round`.
- **Test:** dugme "Simulate full Swiss" u `TournamentTestHarness`, prikaz audit JSON-a.

Reci samo koju "brutalnu ideju" (A/B/C/D) da uključim u prvi build — ostalo radim sve gore navedeno.
