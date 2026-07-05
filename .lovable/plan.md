Plan: kompletno resetovanje Entry sistema da registrovani igrači nikad više ne ostanu zamrznuti.

1. Zameniti Entry potpuno novim, ultra-jednostavnim overlay-em
   - `EntrySplash` će biti samo vizuelni sloj bez auth-a, baze, profila, coina, streak-a, invite-a ili bilo kakvog čekanja.
   - Neće koristiti `sessionStorage` za odluku da li da pusti korisnika.
   - Homepage ostaje mountovan odmah ispod Entry-ja.
   - Overlay će imati `pointer-events: none`, tako da nikad ne blokira klikove.

2. Uvesti tvrdu globalnu zaštitu od zamrzavanja
   - Normalno trajanje Entry-ja: oko 2.5–3 sekunde.
   - Maksimalno trajanje: 5 sekundi.
   - Ako bilo šta zapne, Entry se nasilno skida i ruta ide na `/homepage`.
   - Globalni event `mc:entry-finished` se šalje samo jednom.

3. Popraviti najverovatniji uzrok za registrovane igrače
   - Neću dozvoliti da `AuthProvider`, profile fetch, streak update, leaderboard, recent games ili realtime subscribes blokiraju prvi prikaz homepage-a.
   - Auth restore ostaje best-effort u pozadini.
   - Ako backend/auth kasni, korisnik se ipak odmah pušta na homepage.

4. Privremeno ukloniti/suspendovati problematične overlay-e tokom Entry-ja
   - `EntryQuickDashboard` se neće koristiti u startup flow-u.
   - `TitleUnlockGate`, `GameInviteListener`, `StreakFlexController`, notifier-i i onboarding modali se mountuju tek posle Entry release-a.
   - Ako Entry failsafe pusti korisnika, overlay-i i dalje čekaju idle/fallback, ali homepage je već klikabilan.

5. Učiniti homepage sigurnim za prvi render
   - Prvi ekran homepage-a mora da se prikaže bez čekanja na podatke registrovanog naloga.
   - Svi home podaci se učitavaju u pozadini uz timeout i bez fatalnih grešaka.
   - Ako query failuje, samo se preskoči taj blok, bez tamnog ekrana.

6. Srediti login/signup redirect
   - Posle login/signup ide direktno na `/homepage` ili validan `redirect`.
   - Ne sme biti redirect loop-a između `/`, `/home`, `/homepage`, `/login`.

7. Dodati jasne debug logove za proveru
   - `Entry started`
   - `Homepage mounted`
   - `Entry finished`
   - `Entry failsafe released`
   - `Auth restore started/done/skipped`
   - `Home background data skipped/loaded`

8. Testiranje posle implementacije
   - Guest load na `/`, `/home`, `/homepage`.
   - Simuliran registrovan korisnik sa postojećom auth sesijom.
   - Login pa povratak na homepage.
   - Provera da Entry nestane za najviše 5 sekundi, homepage ostane klikabilan, nema tamnog/frozen ekrana i nema console error loop-a.