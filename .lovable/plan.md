
# MasterChess — Brutalno iskrena analiza rasta

## Glavni problem (zašto nema ljudi)

Sajt je **funkcionalno ogroman** (40+ stranica, klanovi, battle pass, battle royale, turniri, gamification, AI coach, opening trainer, story mode, missions, ranks, titles, chests, spin wheel, beat nikola, daily king, stream hub...) ali **prazan**. To je #1 razlog odlaska:

1. **Niko nije online** → "ghost town effect". Novi posetilac otvori /play, vidi 0 ljudi u queue, ode za 8 sekundi. Chess.com ima 100k+ online stalno — tvoj competitive moat je **nemoguć** dok ne rešiš cold-start.
2. **Previše dugmadi, premalo razloga da se vratiš sutra**. Klasičan "feature soup". Korisnik ne razume šta je core loop.
3. **Nula SEO trafika** za "chess online", "play chess free" — to su brutalno teški KW (KDI 80+). Nemaš šanse direktno; moraš ići na long-tail.
4. **Nema viralnog mehanizma**. Referrals postoje ali nemaju incentive snagu. Nema share-after-win, nema embed widgeta, nema "chess card" koji ljudi šeruju van sajta.
5. **Mobile signup gate** = bounce. Već ste delom rešili guest play, ali konverzija nije merena.

## SKINI (manje je više)

Ove stvari **razvodnjavaju** proizvod i ubijaju fokus. Ukloniti ili sakriti iza /more:

- **Battle Royale, Team Battles, Arena, Tournaments** za neulogovane — 0 igrača = mrtva soba. Sakriti dok nema baze. Ostaviti samo "Quick Match" + "Play Bot".
- **Spin Wheel, Chests, Battle Pass, Missions, Skill Tree, Achievements, Titles, Badges** — previše paralelnih progression sistema. Zadržati JEDAN (preporuka: Battle Pass kao master meta-progression). Ostalo merge ili obrisati.
- **Stream Hub, DailyChess_12 integracija** na home — niko ne dolazi na chess sajt da gleda tvoj YouTube. Premestiti u footer ili /about.
- **Beat Nikola, Daily King, Style Twin, Chess DNA, Play Personality, Style Quiz** — gimmicks. Zadržati 1 (Chess Card jer je share-friendly).
- **Clubs/Clans** dok nema 1000+ aktivnih — prazni klubovi izgledaju gore nego nijedan.
- **LivePlayerCounter / LiveSocialProof / TrustStrip** na home kada vraćaju 0 — sakrij komponente umesto "Be the first to play today" (to **potvrđuje** da je prazno).
- **Exit-intent modal sa "Founder badge"** — badge nema vrednost ako niko ne vidi profile.

## DODAJ (brutalno fokusirano na rast)

### A. Cold-start fix (najvažnije)
1. **Bot lobby kamuflaža** — kada je queue prazan, automatski match sa botom **bez da igrač zna** (osim u rated). Nema laži u brojkama, ali postoji **uvek protivnik za 3 sekunde**. To je *jedini* način da preživiš pre-traction fazu. (Etika: prikaži malu "Practice opponent" oznaku posle partije.)
2. **Async/Correspondence chess** — 1 potez dnevno. Ne treba ti istovremena publika. Ovo je tajni kanal koji je doneo lichess hiljade igrača u ranim danima.
3. **Single-link challenge** — `masterchess.live/vs/abc123`. Generiši link, pošalji prijatelju na WhatsApp, igrate bez registracije. Najjači viralni mehanizam u chess prostoru i **nemaš ga**.

### B. SEO long-tail (jedini realan organski kanal)
Targetiraj stotine niskovolumnih stranica koje **niko ne pokriva dobro**:
- "How to beat [bot name] chess" — po botu (već imate 9 botova)
- "[Opening name] for beginners trap" — postoji opening trainer, generiši landing po openingu sa video embed
- "Chess rating calculator [country]"
- "Play chess vs friend no signup" — ovo je 8k/mo i niko ne dominira
- Programmatic SEO: 1 stranica po gradu/zemlji ("Play chess online from Belgrade")

Već imate sitemap-e za openings/mates/glossary/players — proveriti da li su zaista indeksirane (Search Console).

### C. Viral mehanizmi
1. **Share-after-win card** — auto-generisana slika sa potezima + QR za rematch. Auto-popup posle pobede. (Imate ChessCard, ali nije u win-flowu.)
2. **Embed widget** — `<iframe>` mini-board za blogove/forume sa "Powered by MasterChess". Free distribution.
3. **Daily puzzle widget za druge sajtove** (čak iako "no puzzles" policy važi za sajt — embed za eksterne sajtove je drugačiji use case; ALI ovo krši tvoju core constraint, pa preskoči ako je sveto).
4. **Referral 2.0** — daje konkretno: "Pozovi 3 prijatelja, dobijaš permanent piece set". Trenutni referrals nema dovoljno mrkve.

### D. Retention (D1/D7)
1. **Push notifications koji rade** — već imate scaffolding, ali real trigger: "Tvoj prijatelj X je online" i "Tvoj turnir počinje za 5 min". Ostalo spam.
2. **Streak insurance** — 1 free freeze nedeljno. Smanjuje rage-quit pri prekinutom streaku.
3. **"Continue where you left off"** na home za uloovane — 1 dugme, ne 47 kartica.

### E. Konverzija (signup)
1. **Magic link / Google one-tap** — već imate Google, dodajte one-tap prompt.
2. **Play first, signup after 1st win** — guest može odigrati 3 partije, signup gate tek kada želi rating ili coins.
3. **Mobile signup u 1 polju** — samo email, password kasnije ili magic link.

## UNAPREDI

- **Home page** — trenutno overload. Redizajn na: hero "Play in 5 seconds" → board widget koji odmah radi → 3 CTA (vs friend / vs bot / quick match). Sve ostalo dole.
- **Onboarding** — 0 koraka. Prvi put na sajtu: 30s skill check pa preporučen bot ili matchmaking range.
- **Realna metrika "playing now"** — koristite `usePresence` (Realtime presence) umesto online_games count. Već imate hook, koristi se nedovoljno.
- **Performance** — 40+ stranica + Stockfish WASM + framer-motion svuda = sporo na mobile. Audit Core Web Vitals.
- **i18n** — ako ciljaš srpski/balkan market prvo, prebaci default na sr-Latn i SEO strane za "šah online besplatno".

## Tehnička dela (kratko)

```
src/pages/Index.tsx         → drastičan redizajn (instant-play hero)
src/components/HomeSpinWheelSection.tsx, DiscoverStrip, TrustStrip → ukloniti ili konsolidovati
src/hooks/use-online-game.ts → dodati "phantom bot fill" kada queue > 8s prazan
src/pages/PlayGuest.tsx      → generator /vs/{shortcode} linkova
supabase: tabela `challenge_links` (id, fen, creator_ip, created_at, claimed_by)
src/pages/Async.tsx (NOVO)   → correspondence chess (1 potez/dan)
Programmatic SEO route: /play-from/:city → SSG-like generisanje preko sitemap-a
```

## Predloženi redosled (4 nedelje)

1. **Nedelja 1** — Skini noise sa home, jedan jasan CTA, share-link `/vs/xxx`.
2. **Nedelja 2** — Bot-fill u matchmaking queue, async chess MVP.
3. **Nedelja 3** — Share-after-win card auto-popup + embed iframe.
4. **Nedelja 4** — Programmatic SEO landing pages (50–200 strana long-tail).

## Šta NE raditi

- Ne dodavati nove feature dok rast nije rešen. Imate ih 3x previše.
- Ne reklamirati plaćeno (Google Ads) dok cold-start nije fiksiran — bacate novac.
- Ne polirati klanove/turnire dok nema 100+ DAU.

---

**Pitanja pre implementacije:**
1. Šta ti je top prioritet sledećih 2 nedelje — **rast (novi useri)** ili **retention (postojeći)**?
2. Da li si OK sa "phantom bot fill" idejom (etično ali kontroverzno), ili strogo držimo "ZERO fake engagement"?
3. Koliko ti je sveta "No Puzzles" policy — blokira nekoliko najjačih SEO/viral kanala?
4. Da li redizajn home da bude **radikalan** (sve dole, samo board + CTA) ili inkrementalan?
