Plan:

1. Potpuno ukloniti Entry splash overlay iz aplikacije
   - Izbaciti `EntrySplash` render iz root aplikacije.
   - Ukloniti import `EntrySplash` iz `App.tsx`.
   - Ne prikazivati više nikakav full-screen Entry ekran na `/`, `/home`, `/homepage`, `/index`.

2. Ukloniti sve čekanje na Entry release
   - U `App.tsx` ukloniti/pojednostaviti `useEntryReleased`, `EntryDeferredChrome`, `EntryDeferredMobileNav`, i `RootDeferredOverlays` logiku koja čeka `mc:entry-finished`.
   - Chrome, mobile nav i overlay komponente će se normalno mountovati bez Entry gate-a.

3. Ukloniti Entry zavisnost sa homepage-a
   - U `IndexFull.tsx` ukloniti `entryReleased` state i event listener za `mc:entry-finished`.
   - Homepage data može da se učitava odmah, ali uz postojeće timeout zaštite da ne blokira UI.
   - Heavy background ostaje kontrolisan samo preko `allowHeavy`, ne preko Entry stanja.

4. Ukloniti Entry čekanje iz auth flow-a
   - U `AuthContext.tsx` ukloniti `runAfterEntryRelease` čekanje.
   - Profil i streak se učitavaju u pozadini posle auth restore-a, bez blokiranja početnog ekrana.

5. Ostaviti `EntrySplash.tsx` neupotrebljen ili obrisati ako nema više importova
   - Ako nema referenci, ukloniti fajl da se Entry ne može slučajno vratiti kroz stari import.

6. Provera
   - Proveriti `/index`, `/homepage`, `/` kao guest i sa registrovanom sesijom.
   - Cilj: nema blank/gradient ekrana, nema `data-entry-splash`, nema čekanja na `mc:entry-finished`, homepage je odmah interaktivan.