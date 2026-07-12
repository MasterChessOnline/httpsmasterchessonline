Plan:

1. Ukloniti preostali `EntryQuickDashboard`
   - Izbaciti komponentu iz aplikacije ako je negde renderovana.
   - Obrisati `src/components/EntryQuickDashboard.tsx` ako nema drugih legitimnih referenci.
   - Time registrovani igrači više neće dobijati nikakav full-screen entry/dashboard overlay posle logina.

2. Ukloniti Entry routing/logging iz `App.tsx`
   - Ukloniti `entryLog`, `isHomeEntryPath`, `EntryDeferredChrome`, `EntryDeferredMobileNav` i sve `MasterChess Entry` startup logove.
   - Navbar, mobile nav i ostali root elementi se mountuju odmah, bez entry provere i bez posebnog home-entry puta.

3. Direktan homepage render
   - `/`, `/home`, `/homepage`, `/index` vode direktno na homepage sadržaj.
   - Nema intermediate splash-a, nema čekanja, nema `mc:entry-finished`, nema `__mcEntryReleased`, nema `data-entry-splash`.

4. Ukloniti Entry tragove iz auth/profila
   - U `AuthContext.tsx` preimenovati/ukloniti `entryLog` i `MasterChess Entry` poruke da auth više nema nikakvu Entry semantiku.
   - Auth ostaje brz: cached session odmah prikazuje stranicu, profil/streak se učitavaju u pozadini i ne blokiraju UI.

5. Očistiti neblokirajuće preostale reference
   - Proveriti i ukloniti samo stvarne UI/startup Entry reference.
   - Ne dirati normalne reči `entry` koje znače bazni zapis, fee, queue entry, opening entry itd.

6. Verifikacija
   - Pokrenuti proveru kroz browser za `/index` i `/` sa trenutnom preview sesijom.
   - Potvrditi da nema full-screen overlay-a, nema Entry teksta/atributa/eventa, homepage je odmah vidljiv i interaktivan za registrovane igrače.