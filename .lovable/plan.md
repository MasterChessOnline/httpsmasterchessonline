## Problem

Trenutno su Play / Learn / Compete / Profile grupisani u jednom flex kontejneru sa `gap-2`, dok je **Friends** renderovan u zasebnom desnom kontejneru (zajedno sa Search/Notifications/Avatar dugmadima), takođe sa `gap-2`. Zato vizuelno ostaje veći razmak između **Profile** i **Friends** nego između ostalih stavki — Friends je odvojen od ostalih jer je deo "right side" grupe.

## Rešenje

Premestiti **Friends** dugme iz desne grupe u **glavnu navigacionu grupu** (uz Play, Learn, Compete, Profile), tako da svi nav linkovi dele isti `gap-2` i imaju jednako rastojanje. Search/Notifications/Avatar ostaju u desnoj grupi sami.

## Izmene

**`src/components/Navbar.tsx`** — jedan fajl:

1. U `desktop nav` kontejneru (linija ~243, `<div className="hidden lg:flex items-center gap-2">`) — nakon `.map(NAV_SECTIONS)` dodati render Friends dugmeta sa istim stilom kao ostale stavke.
2. Iz `Right side` kontejnera (linija ~389) **ukloniti** Friends IIFE blok (linije ~390–499), tako da desno ostanu samo Search, Notifications i Profile/Avatar dugmad.
3. Da se izbegne duplikat koda, izvući render-helper za nav-button + dropdown ili jednostavno uneti Friends sekciju u isti `.map` kroz `[...NAV_SECTIONS, FRIENDS_SECTION]` (već se tako koristi za mobilni meni na liniji 583).

Najčistija varijanta: spojiti Friends u isti map iteracijom `[...NAV_SECTIONS, FRIENDS_SECTION]` u desktop navu i obrisati duplirani blok desno. Friends `wide` je `undefined`, pa će dropdown imati 240px širine što odgovara postojećem stilu Friends panela.

## Rezultat

Razmak između svih nav stavki (Play ↔ Learn ↔ Compete ↔ Profile ↔ Friends) biće identičan (`gap-2` = 8px). Desni deo navbara ostaje sa Search + Notifications + Avatar.