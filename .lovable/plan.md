# MasterChess Eksplozija — 6-nedeljni growth plan

Cilj: od "ghost town" do 1000+ aktivnih igrača mesečno. Sve što ja mogu sam da uradim u kodu (bez tvog marketinga). Fokus: **viralnost + SEO + retencija**, ne kopiranje chess.com-a (oni imaju 15 god prednosti — bespotrebno).

## Zašto baš MasterChess? (naš "unfair advantage")
1. **Social-first feed** (već napravljen) — chess.com nema Strava-stil feed
2. **Balkanska duša** — Nikolin FounderNote, srpski jezik na landing stranicama
3. **Zero-friction play** — /play-guest odmah, bez signupa
4. **Bez reklama, bez pop-up-a za pretplatu** — čist "no clutter"
5. **Match Story kartice** — svaki meč = shareable content

---

## FAZA 1 — Viralne petlje (nedelja 1-2)

### 1.1 Match Story auto-share posle SVAKE partije
- Posle svake online partije, modal: "Podeli svoj meč" sa preview Match Story kartice
- Dugmad: Copy link, Download PNG, Share to WhatsApp/X/IG Stories
- URL: `masterchess.live/game/:id/story` (već postoji) → OG image za lepim preview u chat-ovima
- **Ključno**: OG image mora da se generiše server-side (edge function `og-match-story`) da bi WhatsApp/Discord/X pokazali preview

### 1.2 Referral sistem "Pozovi prijatelja"
- Svaki user dobija `masterchess.live/i/{username}` link
- Ko se registruje preko linka → oboje dobijaju 500 coins + "Founder's Circle" badge (prvih 1000)
- Nova tabela `referrals`, widget na Home za ulogovane

### 1.3 "Beat me if you can" challenge linkovi
- Iz profila: "Challenge me" → generiše `/vs/{code}` link (već imamo /vs/) sa pre-set time control
- Prijatelj otvori link → odmah u igri, bez logina (guest)
- Posle partije guest vidi "Napravi nalog da sačuvaš rating" → conversion

---

## FAZA 2 — SEO eksplozija (nedelja 2-4)

Long-tail keywordi su ključ. Chess.com dominira "chess online" (KDI 90+), ali gubi na dugim frazama.

### 2.1 Auto-generisane landing stranice
- **`/otvaranje/{slug}`** — 50+ stranica: "Sicilijanska odbrana", "Kraljev gambit"... svaka sa objašnjenjem, glavnim varijantama, "Vežbaj sada" CTA
- **`/beat/{botId}`** — već postoji, dodati 9 stranica ("Kako pobediti bot Magnusa 2000 ELO")
- **`/puzzle/{theme}`** — "Mat u 2 poteza", "Vilica", "Skriveni napad"... zagrevanje za /puzzles
- **`/vs/{username}`** javni profili već rade — dodati JSON-LD `Person` schema

### 2.2 sitemap.xml + robots.txt
- Dinamički sitemap sa svim javnim rutama (klubovi, igrači, otvaranja, puzzle teme)
- Automatski se update-uje edge funkcijom nightly

### 2.3 Balkanski SEO focus
- Copy na srpskom (ćirilica + latinica) za landing stranice
- Meta tags: "šah online besplatno", "igraj šah bez registracije", "šahovski turniri Srbija"
- Semrush kaže: manje konkurencije, veći konverzija

---

## FAZA 3 — Retencija & habit loop (nedelja 4-5)

### 3.1 Daily streak & push
- "Igraj 1 partiju danas" — streak counter na Home
- Web Push notifikacija u 19h: "Tvoj rival [X] je online" ili "Streak ti ističe za 2h"
- Već imamo SmartNotifier — proširiti

### 3.2 Weekly Recap email
- Nedeljom u 20h: "Ove nedelje: 12 partija, +45 ELO, 3 pobede protiv [rivali]"
- Match Story kartica u emailu → ljudi se vraćaju
- Resend transakcioni email (već postoji infra)

### 3.3 Onboarding koji NE gubi ljude
- Prva stvar posle signupa: **jedna partija protiv bota** (ne tutorial, ne setup)
- Posle prve pobede: "Otključao si Bronze badge" + share prompt
- Tek onda pitanja o rating/stilu

---

## FAZA 4 — Content & community lock-in (nedelja 5-6)

### 4.1 Leaderboards koji se menjaju uživo
- `/leaderboard` — Global, Balkan, Ovaj mesec, Ova nedelja, Po otvaranju
- Realtime update (Supabase Realtime već imamo)
- "Ti si #47 u Srbiji ovog meseca" — motivacija za povratak

### 4.2 Auto-turniri svaki dan
- Cron: Blitz Arena u 20h, Rapid Arena nedeljom u 15h
- Auto lobby, auto pairing — igrač samo klikne "Join"
- Već imamo tournament engine — samo scheduling

### 4.3 "Chess Moments" auto-highlight
- Posle partije, ako je bilo `eval swing > 3` → auto-post na /feed sa animiranim GIF-om te poteza
- Community reagije → dopamin loop

---

## Šta konkretno mogu SAM da uradim (bez tebe)

Sve gore navedeno je 100% kod. Ono što NE mogu sam:
- Marketing na TikTok/YouTube (to ti radiš + DailyChess_12 partnerstvo)
- Plaćene reklame
- Sadržaj u blogu (mogu skelet, ne kvalitetne članke)

---

## Prioritet — šta pravimo PRVO?

Predlažem redosled po ROI:

**Sprint 1 (odmah, 1 turn):**
- OG image edge function za Match Story (viralno u chatovima)
- Share modal posle svake partije
- Referral sistem osnovni

**Sprint 2:**
- 50 SEO landing stranica za otvaranja
- Dinamički sitemap.xml
- Balkanski meta tags

**Sprint 3:**
- Daily streak + push
- Weekly recap email
- Live leaderboards

## Tehnički detalji

- **Edge functions**: `og-match-story` (Deno + satori/@vercel/og port), `weekly-recap-cron`, `sitemap-generator-cron`, `daily-arena-cron`
- **Nove tabele**: `referrals(referrer_id, referred_id, reward_claimed, created_at)`, `daily_streaks(user_id, current_streak, last_played_at)`, `share_events(user_id, target, game_id)`
- **RLS + GRANT** na svakoj novoj tabeli
- **SEO**: react-helmet-async već postoji; svaka landing stranica dobija unique title/desc/OG/JSON-LD

## Metrike uspeha (posle 6 nedelja)

- 30% novih korisnika dolazi preko share/referral linkova
- 100+ landing stranica indexirano u Google-u
- D7 retencija ≥ 25%
- Bar 1 viralni share event dnevno (WhatsApp preview klik-through)

---

**Reci mi: krećemo sa Sprint 1 (viralni share + referral)?** Ili biraš drugi sprint prvo?
