## Zašto imaš malo igrača (realno)

Tvoj sajt je tehnički jak (MasterCourse, botovi, turniri, klanovi), ali pati od **cold-start problema**: novi posetilac dođe → vidi prazne lobije → ode. Plus, Google te još uvek slabo rangira jer je domen mlad (`masterchess.live`) i ima malo backlinkova.

Rešenje nije "još features" — rešenje je **3 paralelna kanala akvizicije** + **retention loop**.

---

## Plan: 3 kanala + retention (14 dana)

### KANAL 1 — SEO long-tail (besplatan, spor ali trajan)

**Cilj:** Da kad neko gugla "how to beat 1200 elo bot" ili "caro-kann trap", **mi** budemo na 1. strani.

1. **Aktiviraj već pripremljenu `/beat/{botId}` landing stranicu** za svih 9 botova (Bronze → GM). Svaka = 800 reči, unique opening trap, "Play this bot now" CTA.
2. **Pokreni Wave B blog seeding** — 12 SEO članaka (već planiranih):
   - "How to beat the London System as Black"
   - "5 Caro-Kann traps under 1500 elo"
   - "Best chess openings for beginners 2026"
   - itd.
3. **Submit sitemap u Google Search Console** (konektor je već dostupan, mogu da verifikujem domen i podnesem `sitemap_index.xml` za tebe).
4. **IndexNow ping** na svaki novi post (već imamo edge function).

**Očekivani efekat:** prvi organski poseti za 3–6 nedelja, ozbiljan rast za 2–3 meseca.

---

### KANAL 2 — Viralni share (brz, zavisi od postojećih igrača)

1. **`/vs/{code}` viralni link** (već postoji u memoriji kao feature) — posle svake partije: "Share this game" → generiše OG image sa finalnom pozicijom + rezultatom → kada neko klikne, vodi ga direktno u challenge mod protiv tebe.
2. **OG image generator** za svaku partiju (canvas → PNG → Twitter/WhatsApp/Discord preview izgleda profesionalno, ne kao prazan link).
3. **"Challenge a friend" dugme** posle pobede sa pre-popunjenim WhatsApp/Telegram/X share tekstom.

**Očekivani efekat:** K-faktor 0.2–0.4 (svaki igrač dovede 1 novog na svake 3–5 partija).

---

### KANAL 3 — Sadržajni hub (DailyChess_12 + News loop)

1. **`/news` feed** (već postoji) — aktiviraj **chess RSS auto-ingest** (Wave B): svaki sat ulazi 3–5 svežih chess vesti iz curated izvora → sajt deluje živo i kad nema igrača online.
2. **DailyChess_12 embed na Home** — već imaš stream hub, dodaj "Latest video" thumbnail u Home above-the-fold da posetilac odmah vidi sveži video sadržaj.
3. **Daily puzzle return-CTA** — kad reši dnevnu zagonetku: "Come back tomorrow for a new one" + opciono email/push reminder.

**Očekivani efekat:** Bounce rate ↓, daily returning users ↑, "ghost town" osećaj nestaje.

---

### RETENTION — da oni koji dođu ne odu

1. **Onboarding wizard** za prvi put (3 koraka: rating estimate → izaberi favorite opening → odigraj 1 partiju protiv preporučenog bota).
2. **Daily mission notification** (već postoji gamification, samo aktivirati push trigger).
3. **Email digest** posle 7 dana neaktivnosti: "Tvoj rating te čeka, evo 3 nove stvari na sajtu".

---

## Šta predlažem da uradimo prvo (ovaj sprint)

**Talas 1 (sad, ~1 dan rada):**
- ✅ Verifikuj domen u Google Search Console + submit sitemap (mogu odmah)
- ✅ Ship Wave B: RSS auto-ingest za `/news` + 12 seeded blog postova
- ✅ Aktiviraj `/beat/{botId}` SEO landing za svih 9 botova

**Talas 2 (sledeći sprint):**
- OG image generator + viralni share flow posle partije
- Onboarding wizard za nove korisnike
- Push notif za daily puzzle/mission

**Talas 3 (kad imaš ~100 DAU):**
- Email digest sistem
- Influencer outreach (chess streameri na YT/Twitch — DailyChess_12 je već u sistemu)
- Reddit/Discord community seeding (organski, ne spam)

---

## Šta NE preporučujem (i zašto)

- ❌ **Plaćene reklame (Google/Meta ads)** — dok god je retention nizak, palićeš pare. Prvo popravi onboarding + viral loop.
- ❌ **Fake aktivnost / ghost igrači u lobiju** — protivno tvojoj core constraint memoriji ("zero fake engagement"). Dugoročno ubija poverenje.
- ❌ **Redesign Home** — već si vetovao, i to je dobra odluka, problem nije u dizajnu.
- ❌ **Pominjanje Lichess/Chess.com u UI** — protivno brand policy memoriji.

---

## Pitanje za tebe pre nego što počnem

Koji **talas** prvo? Predlažem **Talas 1 (SEO + content)** jer je najjeftiniji u tvom vremenu, daje trajne rezultate, i koristi infrastrukturu koju već imaš pola izgrađenu. Talas 2 (viral share) je moćniji ali zahteva da prvo imaš bazu igrača koji će deliti.

Reci samo **"kreni Talas 1"** ili izaberi drugačiji redosled, pa krećem.
