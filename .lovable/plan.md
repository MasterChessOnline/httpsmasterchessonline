## Cilj

Dodati 12 malih ali jakih detalja koji odvajaju MasterChess od Chess.com/Lichess. Sve poštuje postojeća pravila: bez engine evaluacije u human-vs-human igri, bez fake podataka, Gold & Black 4D estetika.

---

## In-game UX sitnice (4)

1. **Last-move trail + capture spark**
   Kratak gold svetleći trag od `from`→`to` polja (fade 600ms) i mali "spark" particle burst kad se figura uzme. Implementacija: overlay sloj iznad board komponente, čisti CSS/Framer Motion, bez novih zavisnosti.

2. **Hover legal-move ghost preview**
   Kad držiš figuru iznad legalnog polja, prikaže se 35% prozirna verzija figure na ciljnom polju pre puštanja. Pomaže u Bullet/Blitz tempo. Toggle u Settings.

3. **Premove indikator (vizuelni)**
   Strelica + suptilan pulsirajući outline na polju gde si pripremio premove dok protivnik razmišlja. Otkazuje na klik praznog polja.

4. **Sound po tipu poteza**
   Različit zvuk za: move, capture, check, castle, promotion, game-end. Već postoji `chess-sounds.ts` — proširiti mapiranje. Master volume + per-type toggle u Settings.

---

## Post-game inteligencija (3) — bez engine-a

5. **Auto turning-point detekcija (heuristika, ne engine)**
   Označi do 3 "ključna momenta" partije na osnovu: materijal swing-a (ΔΔ ≥ 2), promene rezultata partije (mat threat, fork capture), prvog hanging capture-a. Prikazuje se kao chip strip iznad PGN replay-a u Game Review.

6. **Opening name + ECO instant pri kraju partije**
   Već imamo `openings-detector.ts` i Lichess explorer; finish-screen kartica: "You played: **Caro-Kann, Advance Variation (B12)** — explore opening →" sa CTA na Opening Explorer sa pre-loaded linijom.

7. **Momentum/material graph + share card**
   Mali sparkline materijala kroz partiju (bez eval-a) + dugme "Share match card" koje generiše OG-style sliku (već postoji `og-board-image.ts`) sa: krajnja pozicija, oba igrača, otvaranje, rezultat, ELO ±. Public link `/m/:id` (bez login-a).

---

## Profile & identity (3)

8. **Animated rank frame + peak ELO badge**
   Avatar dobija conic-gradient border u boji ranga (Bronze→GM), suptilna rotacija (12s linear). Pored trenutnog ratinga prikazuje "Peak: 1542" chip. Već postoji `peak_rating` u DB.

9. **Main opening + Play Personality auto-chip na profilu**
   Iz poslednjih 30 partija detektuje najčešće otvaranje za bele/crne i prikazuje ga kao chip (npr. "♔ Italian Game · ♚ Sicilian"). Personality (`play-personality.ts`) već postoji — istaknuti na top profila pored ranka.

10. **Country flair + last-seen "live" pulse**
    Mala zastavica pored imena (već imamo `country` u profiles), i zelena pulsirajuća tačka ako je user-online u poslednjih 5 min (preko Realtime presence channel-a, bez upisa u DB).

---

## Retention + accessibility (2)

11. **Smart in-app toasts (sonner)**
    - "Rival approaching your ELO" — kad neko iz follow liste dođe na ±15 ELO
    - "Friend just went online" — Realtime presence
    - "Rank up!" — kad pređeš tier
    - "Daily Mate streak protector" — 1 free skip nedeljno (localStorage flag, bez DB)
    Sve toggle-abilno u Settings → Notifications.

12. **Accessibility & comfort pack**
    - Color-blind board theme (deuteranopia-safe — dodati u `board-themes.ts`)
    - Large piece mode (+15% scale)
    - Dyslexia-friendly font toggle (OpenDyslexic via @fontsource)
    - Reduced-motion respekt + manuelni override
    - Focus mode (sakriva chat, taunts, ranking pulsations tokom partije)
    - Blindfold mode toggle (bez figura, samo notacija)
    Sve u Settings → Accessibility (nova sekcija).

---

## Tehnička sekcija

**Novi fajlovi:**
- `src/components/board/MoveTrail.tsx` (1, 2)
- `src/components/board/PremoveIndicator.tsx` (3)
- `src/lib/turning-points.ts` (5) — heuristika nad chess.js historijom
- `src/components/game/MatchSummaryCard.tsx` (6, 7)
- `src/components/profile/RankFrame.tsx` (8)
- `src/components/profile/MainOpeningChip.tsx` (9)
- `src/hooks/use-presence.ts` (10, 11) — Supabase Realtime presence channel `online-users`
- `src/components/SmartNotifier.tsx` (11) — sluša presence + ELO promene
- `src/lib/accessibility.ts` + Settings sekcija (12)

**Izmene:**
- `src/lib/chess-sounds.ts` — proširiti tipove
- `src/lib/board-themes.ts` — color-blind tema
- `src/pages/Settings.tsx` — Accessibility + Notifications sekcije, per-type sound toggle
- `src/pages/Profile.tsx` — RankFrame, peak chip, MainOpeningChip, country flair, presence dot
- `src/pages/GameReview.tsx` — turning points strip, opening card, momentum sparkline, share button
- `src/components/board/Board.tsx` (ili relevantna board komponenta) — integracija trail + ghost + premove

**Bez DB migracija** — sve koristi postojeće tabele i Realtime presence (in-memory, ne piše u DB). Time poštujemo "ZERO fake engagement data".

**Bez novih dependency-a** osim opcionog `@fontsource/opendyslexic` za accessibility font.

**Performanse:** sve animacije respektuju `prefers-reduced-motion`; presence channel se otkazuje na unmount.

---

## Nije obuhvaćeno (svesno)

- Engine eval/eval bar u human play (zabranjeno pravilima)
- Fake "online: 2,847" brojevi (zabranjeno — koristimo realne presence count-ove)
- Bilo kakav puzzle/tactics sadržaj