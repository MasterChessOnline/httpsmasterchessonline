# Plan: Settings → Appearance cleanup

## 1. Samo Wood Classic + Merida otključani po defaultu
U `src/lib/chests.ts`:
- `FREE_BOARD_KEYS` → samo `"classic"` (Dark Wood = wood classic)
- `FREE_PIECE_KEYS` → samo `"merida"`

Sve ostalo postaje zaključano i mora se otvarati preko **Reward Chests** (`/chests`). Postojeći zaključavajući overlay i toast → navigate("/chests") već rade.

## 2. Pregledni, isto-veliki tile-ovi
Trenutno se kartice "razbacuju" jer:
- preview blokovi nemaju fiksiranu visinu (board je `aspect-square`, ali piece preview je fluidan 2 reda)
- opis je `line-clamp-2 min-h-[2.2em]` što na mobilnom udvostručuje visinu nekih kartica

Rešenje — u `BoardThemeCard.tsx` i `PieceStyleCard.tsx`:
- Wrap preview-a u **`aspect-square`** kontejner za oba tipa kartica → identična slika i visina
- Opis: `line-clamp-1` (umesto 2), bez `min-h` → svuda jedan red
- Naslov: ostaje 1 red sa `line-clamp-1`
- Padding kartice: `p-3` → `p-2.5` za tighter izgled na mobilnom

## 3. Manji board swatch na mobilnom
- Trenutno board zauzima ceo `w-full aspect-square` (cela širina ćelije). Ostavljam tako jer onda baš sve kartice imaju **identičnu** kvadratnu sliku — i pieces i boards.

## Fajlovi
- `src/lib/chests.ts` — sužen FREE_*_KEYS set
- `src/components/settings/BoardThemeCard.tsx` — uniform preview area + jedan red opisa
- `src/components/settings/PieceStyleCard.tsx` — isto + aspect-square wrap oko PieceSetPreview
- (PieceSetPreview se ne dira — samo se obmota wrapper-om koji ga centrira)

## Šta korisnik primećuje odmah
- Otvori Settings → Appearance: sve kartice (i board i pieces) su **iste veličine, isti grid, isti tip slike** (kvadrat).
- Aktivan ostaje samo "Dark Wood" board i "Merida" figure. Ostali imaju 🔒 katanac sa "Chest" oznakom — klik vodi na `/chests`.

Krećem?