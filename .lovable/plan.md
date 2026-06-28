## Cilj
Verifikovati da DB Chess Cup radi end-to-end (registracija → parovi po FIDE Dutch → 9 kola → Buchholz/Sonneborn → izvoz), dodati pravu integraciju sa **chesshost.app**, i osvežiti vizuelni identitet sa **5 živih tema** umesto samo zlatno-crne.

---

## 1. Tournament Engine — Full Test Harness

### 1a. Seed bot players (test mod)
- Nova edge funkcija `tournament-seed-bots`:
  - Parametri: `tournament_id`, `count` (default 32).
  - Kreira N "ghost" registracija sa `is_test_bot=true` flag-om u `tournament_registrations` (nova kolona, default false).
  - Imena/FIDE ID iz fiksne test liste (TestBot_0001 … TestBot_0032, rejtinzi 1200–2400).
- Admin dugme na `/admin/tournaments/:id` → "Seed 32 test bots" (vidljivo samo adminu).
- **Bitno**: bot redovi se filtriraju iz svih javnih leaderboard-a i email-flow-ova (`is_test_bot=false` filter), i brišu se jednim klikom "Purge test bots" pre live starta.

### 1b. Auto-play simulacija
- Edge funkcija `tournament-simulate-round`:
  - Za sve `tournament_pairings` u datom kolu gde su oba igrača `is_test_bot=true`, generiše rezultat po Elo verovatnoći (Glicko-lite).
  - Upisuje rezultat, pokreće postojeći `generateNextRound`.
- Admin može pokrenuti "Simulate all 9 rounds" → testira ceo tok za 30 sekundi.

### 1c. Validacija Buchholz/Sonneborn/Progressive
- Postojeći `calculateTiebreaks` već postoji; dodati **unit test** (`supabase/functions/tournament-pair-round/tiebreaks_test.ts`) sa fiksnim 8-igrača scenariom čiji su tačni Buchholz/Sonneborn izračunati ručno → assert da se brojevi poklapaju.
- Vizuelni "Tiebreak audit" panel na `/dragan-brakus/live` koji prikazuje formulu po igraču (pomaže arbitru objasniti rang).

---

## 2. ChessHost.app — prava integracija

Trenutno samo eksportujemo TRF(x) fajl za ručni upload. Plan:

### 2a. Bridge mod (radi odmah, bez API ključa)
- Postojeći `ChessHostBridge.tsx` proširiti:
  - Prikaz statusa svakog kola: TRF generisan ✓ / Parovi importovani ✓ / Rezultati uneti ✓.
  - "Open ChessHost" dugme otvara `https://chesshost.app/import` u novom tabu sa već kopiranim TRF u clipboard.
  - Posle kola, "Paste results" textarea → parsira TRF rezultat string i upisuje u `tournament_pairings`.

### 2b. API mod (ako chesshost.app ima public API)
- Provera dokumentacije pre implementacije. Ako postoji REST endpoint za `POST /tournament/{id}/round/{n}/pairings` → edge funkcija `chesshost-sync` sinhronizuje automatski svako kolo.
- Ako ne — ostajemo na bridge modu, koji je dovoljan za arbitra.

---

## 3. Vizuelni identitet — 5 živih tema

Trenutni `SiteThemePicker` ima 8 tema ali su sve tamne varijante. Korisnik traži **više boja, ljudskije, ne samo crno**.

Predlog 5 default tema (vidljive odmah u headeru kao swatch krug):

```text
1. Royal Sunset    — duboko ljubičasta + topli koralni akcent + krem pozadina
2. Forest Library  — tamno zelena drvo tekstura + zlato + ivory
3. Ocean Blueprint — denim plava + bela + neon turkiz
4. Terracotta Cafe — terakota + maslinasta + topla beige (svetla tema)
5. Midnight Gold   — postojeća (default, za nostalgiju)
```

- Refactor `src/lib/site-themes.ts`: svaka tema definiše **kompletan HSL set** (background, foreground, primary, secondary, accent, muted, border, card) — ne samo accent boju.
- `index.css` čita iz `data-theme` atributa na `<html>`.
- Sve shadcn komponente automatski preuzimaju nove tokene jer već koriste semantic vars.
- **Bitno**: tri od pet tema su **svetle** (Terracotta Cafe, delom Ocean Blueprint, Forest Library light variant) — sajt više neće delovati monohromatski.

---

## 4. Navbar — dodaci

Trenutno 5 sekcija po 3–4 linka. Predlog dodavanja:

- **Theme swatch row** u dropdown svake sekcije (top): 5 krugova u boji → instant theme change.
- **"Live Now" indikator** (zeleni puls) pored "Tournaments" ako trenutno teče bar jedno kolo.
- **Search ikonica** (Cmd+K palette već postoji, samo dodati vidljiv trigger na mobile bottom bar).

Bez novih sekcija — korisnik je tražio manje, ne više.

---

## 5. Test plan (posle implementacije)

1. Admin klikne "Seed 32 bots" na DB Chess Cup.
2. Klikne "Start Tournament" → generiše se 1. kolo (16 parova).
3. Klikne "Simulate round" 9 puta → svih 9 kola odigrano.
4. Otvara `/dragan-brakus/live` → leaderboard prikazuje finalni rang sa Buchholz/Sonneborn/Progressive vrednostima.
5. Eksportuje TRF → poredi sa ručno proveravanim primerom.
6. Klikne "Purge test bots" → svi ghost redovi obrisani, tabela spremna za live.
7. Menja temu kroz svih 5 paleta → svaka stranica čita tokene bez hardcoded boja.

---

## Pitanja pre implementacije

1. **ChessHost.app API**: imaš li credentials/dokumentaciju, ili idemo samo bridge mod (TRF copy-paste)?
2. **Test botovi**: hoćeš da ostanu posle testa kao "demo turnir" za nove posetioce, ili strogo purge pre starta?
3. **Svetle teme**: OK da 3 od 5 tema budu svetle pozadine (beli/krem), ili sve moraju ostati tamne sa različitim akcentima?
