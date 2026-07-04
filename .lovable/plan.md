Plan za P0 popravku: registrovani igrači ne smeju više nikad da ostanu zamrznuti na Entry ekranu.

1. Zameniti ceo Entry sistem novim čistim flow-om
   - Ukloniti postojeću logiku koja zavisi od auth/profile/sessionStorage stanja.
   - Novi Entry će biti samo vizuelni overlay, bez API poziva, bez čekanja baze, bez blokiranja klikova.
   - Homepage će biti mountovan odmah ispod Entry-ja od prvog rendera.

2. Napraviti tvrd timeout koji uvek pušta korisnika dalje
   - Entry traje oko 3 sekunde.
   - Posle 5 sekundi maksimalno se Entry nasilno uklanja, bez obzira na auth/data stanje.
   - Ako ruta nije homepage posle timeout-a, automatski ide na `/homepage`.

3. Popraviti registered-user startup
   - Auth restore ne sme da blokira render.
   - Session se učitava best-effort, a profile/streak/coins/invites se učitavaju posle Entry-ja u pozadini.
   - Ako backend/auth kasni ili padne, korisnik ipak ulazi na homepage.

4. Ugasiti sve full-screen preklopnike tokom Entry-ja
   - `EntryQuickDashboard` se neće koristiti na entry path-u.
   - Globalni overlay-i kao title unlock, streak takeover, invite listener, smart notifier, welcome/onboarding modali neće moći da se mountuju dok se Entry ne završi.
   - Route loader ostaje mali non-blocking indikator, nikad full-screen.

5. Zaštita od redirect/render loop-a
   - `/`, `/home`, `/homepage` ostaju ista homepage ruta.
   - Entry neće ponovo pokretati redirect nazad na `/` ili login.
   - Event `mc:entry-finished` će se emitovati samo jednom po load-u.

6. Dodati jasne console logove za proveru
   - `Entry started`
   - `Auth restore started`
   - `Homepage mounted`
   - `Entry finished`
   - `Entry failsafe released`
   - `Background profile skipped/loaded`

7. Test posle implementacije
   - Guest load: Entry nestaje, homepage klikabilan.
   - Simuliran logged-in session: Entry nestaje, homepage klikabilan.
   - Direktno `/`, `/home`, `/homepage`.
   - Logout/login koliko preview dozvoli.
   - Provera da nema console error-a, redirect loop-a ili tamnog zamrznutog ekrana.