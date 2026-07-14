Problem najverovatnije nije više stari Entry overlay, nego homepage render za ulogovane korisnike: čim auth pronađe registrovanog igrača, puni se teži `IndexFull` sa framer animacijama, velikim hero backgroundom, lazy sekcijama i više backend poziva. Ako neki deo tog inicijalnog rendera/animacije zaglavi, korisnik vidi samo šareni background i ništa dalje.

Plan popravke:

1. Zadržati Entry, ali ne dozvoliti da registrovani korisnici ostanu na praznom/šarenom ekranu
   - Ne vraćati nikakav blokirajući splash.
   - Homepage mora uvek odmah da prikaže stabilan sadržaj i dugmad, čak i dok se auth/profil/data učitavaju.

2. Prebaciti home rute na sigurni fast shell
   - `/`, `/home`, `/homepage`, `/index` koristiti `IndexFast` kao prvi render.
   - `IndexFast` odmah prikazuje jednostavan homepage shell, pa tek posle idle vremena pokušava da učita `IndexFull`.
   - Ako `IndexFull` zapne, shell ostaje vidljiv umesto šarenog praznog ekrana.

3. Ojačati fallback za `IndexFull`
   - U `IndexFast` dodati error boundary oko lazy `IndexFull`.
   - Ako se desi runtime greška samo kod registrovanih igrača, fallback ostaje normalna homepage verzija.

4. Smanjiti rizik u registrovanom `IndexFull` renderu
   - Ugasiti heavy animated background i parallax dok je korisnik tek ušao.
   - Backend podatke na home strani držati striktno non-blocking i timeout-safe.
   - Ne renderovati user-only performance blok dok profil nije stvarno spreman.

5. Proveriti auth flow
   - `AuthContext` ostaje brz: cached session odmah pušta UI, profil i streak idu u pozadini.
   - Ako background profil/streak/coins request ne uspe, ne sme da blokira ulaz na sajt.

6. Verifikacija
   - Testirati `/` i `/index` u browseru kao guest i sa registrovanom sesijom.
   - Potvrditi da nema praznog šarenog ekrana, homepage dugmad se vide odmah, nema runtime grešaka, i registrovan korisnik može da klikne dalje na Play/online.