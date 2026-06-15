# Plan: Fer Spin the Wheel + ručno aktiviran spin

## Šta je problem
- Server RPC `claim_daily_spin` daje **25 coina u 35%** slučajeva i **50 coina u 25%** = 60% spin-ova završi na jedno od ta dva polja. Zato deluje "uvek isto".
- Klijent dodatno preusmerava 35% rezultata sa 25 → Mystery polje, ali distribucija ostaje skewed.

## Šta menjam

### 1. Server: ravnomernija raspodela
Migracija — **`claim_daily_spin`** dobija ravniju distribuciju preko 7 nivoa (zbir = 100):

```
25   →  18%   (bilo 35%)
50   →  18%   (bilo 25%)
100  →  20%   (bilo 18%)
250  →  18%   (bilo 12%)
500  →  14%   (bilo 6%)
1000 →   8%   (bilo 3%)
2500 →   4%   (bilo 1%)
```
Svako polje sada ima realnu šansu — više nikad ne deluje "uvek 25/50". Najveće nagrade i dalje ostaju retke (4–8%) da bi spin ostao uzbudljiv.

Isto rebalansiranje za **`spin_wheel_paid`** (100 → 30% umesto 40%).

`claim_weekly_spin` i `spin_wheel_legendary` ostaju nepromenjeni (već su balansiraniji).

### 2. Klijent: ukloniti hardkodovani re-routing
- U `HomeSpinWheelSection.tsx` i `SpinWheel.tsx` ukloniti liniju `if (coins === 25 && Math.random() < 0.35) return 4` — pošteno mapiranje: pobednički index = polje sa istim coin iznosom.

### 3. Spin = uvek ručno (potvrda)
Pregled koda potvrđuje: spin se već pokreće isključivo klikom korisnika na "SPIN THE WHEEL" dugme. Nema auto-spina. Ako želiš još "fizičkiji" feeling (drag-to-spin gest prstom), to mogu dodati kao sledeći korak — javi.

## Fajlovi
- migracija (DB): `claim_daily_spin` + `spin_wheel_paid`
- `src/components/HomeSpinWheelSection.tsx` — ukloniti random re-routing
- `src/pages/SpinWheel.tsx` — ukloniti random re-routing

Krećem?