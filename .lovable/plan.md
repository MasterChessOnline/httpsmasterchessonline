## Iskren profesionalni pogled

Pre plana — jedna istina: **1000 stvarnih, istovremenih igrača "do sutra" nije realno** ni za jedan novi šah sajt na svetu. Chess.com je do prvog 1000 stigao za mesece, Lichess za skoro godinu, i to sa već postojećom publikom. Ono što JESTE realno za 7-14 dana uz agresivan rad:

- **50-200 registrovanih igrača**
- **5-20 istovremeno online u peak satima (20-22h)**
- **1-3 turnira sa 8-30 učesnika**

To je tačka odakle sajt prestaje da deluje "prazno" i počinje sam sebe da hrani. Sve ispod toga je marketing, ne tehnika.

---

## Zašto nema igrača — prava dijagnoza

1. **Cold-start.** Multiplayer sajt bez publike = svaki novi posetilac vidi prazno i ode za 30s.
2. **Nema dnevnog rituala.** Ljudi se vraćaju gde znaju da će NEKO biti. Trenutno ne znaju.
3. **SEO još nije sazreo.** Google indeksiranje + ranking traje 2-8 nedelja. Impresije rastu, klikovi tek dolaze.
4. **Nema spoljnog izvora saobraćaja.** Sajt nema TikTok/IG/YouTube tok koji svakodnevno gura ljude unutra.
5. **Previše funkcija, premalo jasnog "šta da radim odmah".** 150+ ruta zbunjuju novog korisnika.
6. **Nula društvenog dokaza.** Nema recenzija, nema "X igrača igralo danas", nema vidljive zajednice.

---

## Šta DODATI (po prioritetu, ne sve odjednom)

### A. Konverzija i zadržavanje (najvažnije)
1. **"Tonight 20:00 Arena" countdown blok** na Home — fiksan termin svaki dan kad SVI dolaze.
2. **Guest-to-signup flow** — gost može da odigra 1 partiju bez naloga, posle pobede ga molimo za signup sa share karticom.
3. **Push notifikacija "Your friend is online"** — kad neko iz tvojih friends/clan-a uđe.
4. **Email "We miss you — Tonight 20:00 arena"** za sve registrovane koji nisu igrali 3+ dana.
5. **Welcome onboarding (60s)** — bot partija → puzzle → kreiraj challenge link. Jasan 3-koraka tok.

### B. Viralni loop (svaki igrač dovodi sledećeg)
6. **Auto share-kartica posle pobede** (PNG sa rezultatom, board pozicijom i QR/link) — jedan klik = Instagram/WhatsApp.
7. **Challenge link na Home-u** kao primarni CTA (sada postoji, ali nije istaknut).
8. **"Beat me" landing** za svakog korisnika (`/beat/{username}`) — share na društvene mreže.
9. **Referral nagrade** — pozoveš 3 osobe = otključavaš ekskluzivan piece set.

### C. Spoljni saobraćaj
10. **TikTok/Shorts dnevni postovi** (skripte već postoje u `docs/TIKTOK_SCRIPTS.md`) — 14 dana zaredom.
11. **Google Business Profile** sa postom 2x nedeljno — donosi lokalne klikove odmah.
12. **PR pitch portalima** (Netokracija, Startit, B92 Tehno) — priča "13-godišnjak iz Srbije napravio šah sajt" je jaka.
13. **Instagram šahovskim profilima u Srbiji** — direktna poruka, ponuda za turnir za njihove pratioce.

### D. Reklame (kad imaš budžet, ne pre)
14. **Meta (Instagram/Facebook) ads** — €5-10/dan, target: muškarci 14-45 godina, interes "chess" u Srbiji, Bosni, Crnoj Gori, Makedoniji, Hrvatskoj. Najbolji ROI od svih platformi za šah.
15. **Google Ads samo na brendirane upite** — "masterchess", "nikola sakotic chess". €1-2/dan. Ne na "play chess online" (preskupo, Chess.com tu plaća €5+ po kliku).
16. **NE TROŠITI** na: Twitter ads, LinkedIn ads, YouTube ads (skupo, nizak ROI za šah).
17. **TikTok Spark Ads** — booster za organske klipove koji rade dobro. €5/dan posle 7 dana organskog testiranja.

### E. Google Maps integracija
18. **Connector već postoji**. Predlog: stranica `/play-near-me` (već u kodu `NearMe.tsx`) — pokazuje šah klubove + lokalne MasterChess turnire na mapi. **SEO zlato** za "šah klub Beograd", "chess club Novi Sad" itd.
19. **Embeddovati mapu na `/community-map`** sa pravim aktivnim igračima po gradovima (samo ako ih ima — bez lažiranja).
20. **Google Business mesto** sa lokacijom + mapa link u footeru.

---

## Šta UKLONITI/SAKRITI (smanji buku)

1. **Sakriti rute koje nemaju content** dok ne bude publike: Battle Royale, Clan System, Stream Hub, Team Battles, Spectator Bets — sve to izgleda mrtvo bez igrača i kvari prvi utisak.
2. **Skinuti sve placeholder/dev rute** iz Navbar-a (Brag, Confessions, Pitch, BuiltByAKid, IgBonus, IgLanding ako se ne koriste).
3. **Footer — smanjiti broj linkova za 50%**. Trenutno previše opcija = zbunjenost.
4. **Skinuti "Coming Soon" stranice** iz produkcijskog Navbar-a.
5. **Sakriti "Live Player Counter" kad je 0** (već radi tako — dobro).
6. **Lažni rejtovi, lažni počeci, lažna aktivnost — nikad ih ne dodavati** (već je pravilo projekta, držimo se).

---

## Realan vremenski plan — 14 dana

**Dan 1-2 (tehnika u sajtu):**
- Tonight Arena countdown blok na Home
- Guest play onboarding
- Auto share-kartica posle pobede
- Sakriti prazne rute iz Navbar-a/Footera

**Dan 3-7 (sadržaj + marketing):**
- 2 TikTok/Shorts klipa dnevno
- 10 PR mailova portalima
- Google Business post 2x nedeljno
- Direct message 20 IG šah profilima

**Dan 8-14 (skaliranje):**
- Pokrenuti €5/dan Meta ads
- Prvi javni turnir "MasterChess Weekend Arena 20:00"
- Pratiti analytics, duplirati ono što radi, sečći ono što ne

---

## Konkretne stvari za realizaciju u kodu (ovaj plan)

1. **`TonightArenaBanner` komponenta** na Home, ispod hero-a, sa countdown-om do 20:00.
2. **`PostGameShareCard` komponenta** — automatski iskoči posle pobede sa download/share dugmadima.
3. **`GuestPlayOnboarding`** — gost → 1 partija → soft signup prompt.
4. **`NavbarCleanup`** — premestiti retko korišćene rute u "More" dropdown, ostaviti samo: Play, Puzzles, Tournaments, Learn, Community.
5. **`/play-near-me` aktiviranje sa Google Maps** — već postoji ruta, treba samo Maps integracija + SEO meta.

Sve ostalo iznad (TikTok, Meta ads, PR, GBP) NE ide u kod — ide u dokumentaciju i radiš ručno. Dokumenti `docs/TIKTOK_SCRIPTS.md`, `docs/PR_PITCHES.md`, `docs/GOOGLE_BUSINESS_SETUP.md` već postoje.

---

## Iskren završetak

Sajt je tehnički spreman. **Problem nije kod — problem je marketing van sajta i jedan fiksan termin u danu kad svi dolaze.** Najveći skok igrača neće doći od još jedne komponente, već od:
- prvog viralnog TikTok klipa (jedan klip može doneti 200+ signup-a),
- jednog članka na Netokraciji ili Startit-u,
- prvog "Tonight 20:00" turnira sa 8 igrača (od kojih svaki dovede po 1 prijatelja).

Reci samo "kreni" i pravim tih 5 stvari u kodu (Tonight Arena, ShareCard, GuestOnboarding, Navbar cleanup, NearMe + Maps). Ostalo radiš ti van sajta — bez tog dela ni najbolji kod neće dovesti igrače.