Razlog zašto se i dalje zamrzava: Entry više nije jedini problem. Kada je igrač ulogovan, homepage odmah pokreće auth stanje + profile/streak + više homepage/nav upita + Framer Motion animacije. Entry overlay krene, ali ispod njega registrovani user aktivira teže efekte i backend pozive, pa glavna nit može da se zaguši i izgleda kao da se Entry zaledio. Takođe `Login`/`Signup` resetuju globalni Entry flag na `false`, što ponovo pali Entry baš u trenutku kada auth state i user data počnu da rade.

Plan popravke:

1. Napraviti Entry kao potpuno izolovan sistem
   - Entry ne sme da zavisi od login stanja, profila, baze, streak-a, coina, notifikacija, nav statsa ili homepage data.
   - Entry će biti samo jednostavan CSS overlay bez Framer Motion-a i bez poziva ka backendu.
   - Overlay ostaje `pointer-events: none`, ali više neće biti vezan za auth promene.

2. Ukinuti resetovanje Entry-ja posle login/signup
   - U `Login.tsx` i `Signup.tsx` ukloniti `prepareFreshEntry()` koji vraća `window.__mcEntryReleased = false`.
   - Posle login/signup direktno ide `/homepage` bez forsiranja novog Entry ciklusa u sred auth restore-a.
   - Ovo je najvažniji deo za registrovane igrače, jer trenutno baš posle login-a ponovo startuje Entry dok kreću svi user upiti.

3. Dodati pravi globalni hard-release pre React težih efekata
   - Uvesti mali helper za Entry state: jednom kada je released, više se ne vraća na false u istoj sesiji.
   - Na 5 sekundi maksimalno se nasilno skida overlay i šalje `mc:entry-finished`, bez obzira da li se homepage data učitala.
   - Ako ruta nije home ruta, Entry odmah release.

4. Odložiti sve registrovane-user upite dok Entry ne završi
   - Homepage `recentGames`, leaderboard, win streak računanje i navbar live stats ne smeju da startuju dok Entry ne pusti korisnika.
   - Za ulogovane igrače ti podaci će se učitati posle Entry release-a, uz timeout, bez blokiranja prvog ekrana.

5. Isključiti teške homepage animacije tokom Entry-ja
   - Na home ruti dok Entry traje: ne renderovati `ChessUniverseBackground`, parallax scroll transform, teške `motion` efekte i 3D slojeve.
   - Posle Entry release-a mogu da se uključe samo ako uređaj dozvoljava.

6. Dodati kill-switch protiv zamrznutog ekrana
   - Ako browser detectuje da Entry overlay postoji duže od 5s, uklanja se iz DOM-a i ide `/homepage`.
   - Ovo radi i ako React state update zakasni.

7. Testirati kao registrovan igrač i gost
   - Test 1: guest `/` → Entry nestaje, homepage klikabilan.
   - Test 2: ulogovana sesija iz storage-a → Entry nestaje, homepage klikabilan, nema zamrzavanja.
   - Test 3: login → `/homepage`, bez ponovnog zadržavanja na Entry ekranu.
   - Test 4: logout/login → isti rezultat.
   - Proveriti console da nema error loop-a i da se vide logovi: Entry started, Entry hard released, Homepage mounted.