## Zašto trenutno nemaš aktivne igrače

Glavni problem nije samo SEO. Problem je što šah sajt ima **cold-start**: ljudi dođu, vide da nema protivnika, odu, i zato novi igrači ne ostaju dovoljno dugo da naprave “živu sobu”.

Najverovatniji uzroci:

1. **Nema kritične mase u isto vreme**
   - Multiplayer radi samo kad su bar 2 stvarna igrača online u isto vreme.
   - Ako jedan igrač uđe i čeka 20-60 sekundi bez protivnika, najčešće ode.

2. **Google donosi spore posete, ne instant zajednicu**
   - SEO može da dovede ljude, ali tek za nedelje/mesec dana.
   - Za aktivne igrače treba dnevni ritual: TikTok/Shorts, Discord, školske grupe, turniri u zakazano vreme.

3. **Home verovatno ne gura dovoljno “instant play”**
   - Ako korisnik mora da razmišlja gde da klikne, gubiš ga.
   - Najjači CTA treba da bude: `Play as Guest`, `Challenge a Friend`, `Daily Puzzle`, `Join Tournament`.

4. **Nema događaja koji okuplja ljude u isto vreme**
   - Nasumični matchmaking je prazan kad nema publike.
   - Bolje je zakazati: “Tonight 20:00 Blitz Arena” i gurati taj link svuda.

5. **Nema dovoljno viral loop-a**
   - Svaka partija treba da stvori novi ulaz: share link, challenge link, rezultat za Instagram/TikTok, “beat me” link.

6. **Ne smeš lažirati brojke**
   - Bot-fill, fake players i lažni online counter bi kratkoročno izgledali bolje, ali ruše poverenje i već je zabranjeno pravilom projekta.
   - Bolje je prikazivati “No live games — start one” nego lažnu aktivnost.

## Šta bih prvo uradio

### 1. Popraviti homepage funnel
Dodati jasniji blok iznad fold-a ili odmah ispod hero sekcije:
- `Play as Guest` kao najbrži ulaz
- `Challenge a Friend` za viral link
- `Daily Puzzle` za ljude kad nema protivnika
- `Join Tonight Arena` za okupljanje u isto vreme

Cilj: korisnik ne sme da dođe i vidi “prazan sajt”; uvek mora imati akciju.

### 2. Dodati “scheduled play” mehaniku
Napraviti sekciju za dnevne termine:
- “Daily Blitz Arena — 20:00”
- countdown
- share dugme
- link koji možeš slati po Instagramu, TikToku, školskim grupama i portalima

Cilj: ne čekamo da ljudi slučajno dođu istovremeno, nego ih dovodimo u isti sat.

### 3. Ojačati guest-to-signup put
Ako čovek igra kao gost:
- posle partije ponuditi “Save your rating / create profile”
- posle pobede ponuditi share karticu
- bez obaveznog signup-a pre prve akcije

Cilj: prvo igra, pa tek onda nalog.

### 4. Napraviti “empty lobby” da ne izgleda mrtvo
Kad nema live games:
- umesto samo “No live games”, prikazati 3 korisne akcije:
  - Start instant game
  - Send challenge link
  - Train while waiting

Cilj: praznina se pretvara u akciju.

### 5. Marketing akcije van sajta
Ovo je važnije od još jedne SEO stranice:
- svaki dan 2 TikTok/YouTube Shorts klipa 14 dana
- jedan javni turnir dnevno u isto vreme
- poslati 20 PR emailova iz već napravljenog `docs/PR_PITCHES.md`
- pisati školskim/šahovskim Instagram stranicama
- objaviti priču: “13-year-old founder from Serbia builds MasterChess”

Cilj: dobiti prve prave ljude, ne samo impresije na Google-u.

## Plan implementacije u aplikaciji

1. **Homepage conversion block**
   - Dodati/pojačati sekciju sa 4 akcije: Guest Play, Challenge Friend, Daily Puzzle, Tonight Arena.
   - Bez redizajna celog Home-a.

2. **Empty state za live/spectate/lobby**
   - Kad nema igrača, prikazati korisne akcije i share link umesto mrtve poruke.

3. **Daily arena promotion**
   - Dodati vidljiv “Daily Blitz Arena 20:00” blok sa countdown-om i share CTA.
   - Koristiti postojeće turnir/tournament rute ako već postoje, bez velikog backend refaktora.

4. **Viral share copy**
   - Dodati bolji tekst za challenge/share dugmad: “Can you beat me on MasterChess?”
   - Cilj je da svaki korisnik dovede bar još jednog.

5. **PR/marketing checklist page za tebe kao admin alat**
   - Ako već postoji admin SEO/marketing deo, dodati listu dnevnih akcija: TikTok, Shorts, portal email, Google Business post, tournament share.

## Najkraći odgovor

Nemaš igrače zato što multiplayer sajt bez početne publike izgleda prazan. Google pomaže, ali ne rešava “u isto vreme online” problem. Prvo treba napraviti da svaki posetilac odmah ima šta da radi, zatim ih okupljati u zakazano vreme i gurati share/challenge loop svaki dan.