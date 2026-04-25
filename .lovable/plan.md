# Reorder Navbar Right Side

Promeniti raspored desne strane navbara tako da bude:

```text
MasterChess → Play → Learn → Compete → Profile → Friends → 🔍 → Play Now → Streak → Exit
```

## What changes

Trenutno je redosled: `🔍 → Play Now → Friends → Streak → Exit`
Treba da bude: `Friends → 🔍 → Play Now → Streak → Exit`

Friends padajući meni se pomera **levo od search lupe**, čime postaje vizuelno deo glavne navigacije (nastavak posle Profile), a search + Play Now ostaju kao primarna akciona zona desno.

## Technical changes

**File: `src/components/Navbar.tsx`**

Unutar `{/* Right side */}` containera (red ~387), preraspodeliti elemente sledećim redom:

1. Friends dropdown blok (premešten ispred search dugmeta)
2. Search button (lupa)
3. Play Now button
4. StreakIndicator + Sign Out

Dodatno: pozicioniranje Friends dropdown panela treba prilagoditi — trenutno koristi `right-0` jer je bio krajnji desni element. Pošto više nije sasvim desno, ali je i dalje blizu desne ivice navbara, ostavlja se `right-0` kako se panel ne bi prelio van ekrana (panel je 320px širok).

Niko drugi ne menja se — Profile dropdown, mobilna verzija, search palette, footer ostaju netaknuti.

## Out of scope

- Boje, ikone, sadržaj padajućih menija
- Mobilna verzija (drawer već lista sve sekcije ispravnim redosledom)
- Search palette i Footer
