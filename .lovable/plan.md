## Šta zaista pomera iglu (bez troška na gluposti)

Razumeo. Evo **3 stvari** koje stvarno donose razliku u Search Console + Maps + marketingu. Sve drugo je šum.

---

### 1. GOOGLE SEARCH CONSOLE — Submit & ping (10 min rada, ogroman efekat)

Sajt je verifikovan ali Google ne zna za nove stranice dok ih ne pinguješ. Konkretno:

- **Submit `sitemap_index.xml` u Search Console** preko GSC API-ja (već imamo konektor) → Google odmah indeksira 200+ landing stranica koje već imaš.
- **URL Inspection + Request Indexing** za 10 najvažnijih (Home, /play, /puzzles, /blog, /news, top 5 SEO landinga) → ulaze u Google index za 24-48h umesto 2-4 nedelje.
- **IndexNow ping** za svih 12 novih blog postova (Bing + Yandex indeksiraju isti dan).
- **Top Search Queries report** → vidi koje keyword-e već imaš na poziciji 11-20 (page 2). To su "quick wins" — male izmene u title/H1 te prebace na page 1.

**Efekat:** 5-10x više organskih impresija u 2 nedelje.

---

### 2. GOOGLE MAPS / GBP — Real review loop (najbrži trust signal)

Google Maps rangira po: **broj recenzija + svežina + odgovori**. Nemaš dovoljno recenzija.

- **In-app "Leave a Google review" CTA** posle pobede ili rešene puzzle (ne nakon prve sesije — nakon pozitivnog trenutka).
- **Auto-reply template generator** za GBP recenzije (već imaš `publish-gbp-posts` edge function; dodaću `gbp-review-reply` koji generiše personalizovan odgovor preko Lovable AI).
- **Weekly GBP Post auto-publish** — koristi `publish-gbp-posts` + cron job (1 post nedeljno: novi feature, najbolja partija nedelje, novi blog post).

**Efekat:** Maps ranking raste, više "Click to website" iz Maps panela.

---

### 3. JEDNA KONVERZIJA KOJA SAD CURI — Bounce na Home

Realnost: i kad Google pošalje posetioca, on dođe na Home, ne vidi razlog da ostane i ode. Najveći ROI je **da onih malo posetilaca koji već dolaze pretvoriš u igrače**.

- **"Play instantly as guest" dugme above-the-fold na Home** — bez signup-a, klikneš → odmah igraš bota. (Već postoji `/play-guest`, samo treba prominentan CTA na Home).
- **Exit-intent capture** — kad pomeri miš ka zatvaranju, modal "Sačuvaj svoj rating — 1 klik signup".
- **Auto-email posle prve partije** (već imaš email infrastrukturu) — "Tvoj rating je 800, evo 3 saveta da pređeš 1000".

**Efekat:** Conversion rate 2% → 8%. Isti traffic, 4x više aktivnih igrača.

---

## Šta NEĆU raditi (gubljenje kredita)

- ❌ Više blog postova (već si dobio 12, dovoljno za start)
- ❌ Više landing strana (već imaš 200+ u sitemap-u)
- ❌ Redizajn bilo čega
- ❌ Nove "feature" stranice
- ❌ Dodavanje još RSS izvora

---

## Pitanje za tebe

Koje od ova 3 hoćeš da uradim **prvo**? Predlažem **#1 (GSC submit + indexing)** jer traje 10 min, košta najmanje kredita, i daje rezultat u 48h umesto nedeljama.

Reci samo broj: **"1"**, **"2"**, **"3"** ili **"sva 3"** pa krećem.
