# OPERACIJA "1000 IGRAČA ZA 30 DANA"

Cilj: svaki dan merljiv rast aktivnih igrača. Plan kombinuje **(A) tehničke fiče koje same po sebi dovode igrače sa Google-a i društvenih mreža**, i **(B) operativne korake (Search Console, Maps, reklame)** koje radimo paralelno.

---

## 1. KILLER IDEJA — "Chess Heatmap of the World" + Live City Battle

Jedna velika, viralna stvar koja istovremeno rešava SEO, Google Maps i FOMO:

```text
┌──────────────────────────────────────────────────────┐
│  /chess-map  →  Interaktivna Google mapa sveta       │
│  • Svaka tačka = grad sa registrovanim igračem        │
│  • Klik na grad → leaderboard tog grada               │
│  • "City vs City" nedeljni duel (Beograd vs Zagreb)   │
│  • Auto-generisan /chess/{grad} SEO landing za 200+   │
│    gradova (LocalBusiness JSON-LD → Maps pack)        │
└──────────────────────────────────────────────────────┘
```

Zašto radi: Google indeksira 200+ gradskih stranica → Maps pack rezultati → lokalni igrači klikću → vide "5 igrača iz tvog grada online" → registracija iz FOMO-a.

---

## 2. ŠTA GRADIMO (tehnički, ovog ciklusa)

### A. Growth-engine fiče
1. **`/chess-map`** — Google Maps JS API, markeri po gradovima, klik → city leaderboard.
2. **`/chess/{city}` programatske stranice** — 50 najvećih gradova Balkana + EU; `LocalBusiness` + `BreadcrumbList` JSON-LD; "X igrača iz {grad}a online".
3. **City vs City duel** — nedeljni event, auto-pairing igrača iz dva grada, share kartice za pobedu.
4. **Auto Share Cards** — posle pobede generiše PNG ("Pobedio sam u 18 poteza na masterchess.live"), native share + download → Instagram/WhatsApp viralnost.
5. **`/vs/{username}` lični challenge link** — svaki igrač dobija ličnu URL koju deli; klik → instant partija → registracija.
6. **"Beat Nikola" certifikat** — ko pobedi 13-godišnjeg osnivača, dobija PNG sertifikat sa potpisom → emocija → share.

### B. SEO i indeksiranje
7. **IndexNow ping** — automatski na svaku novu stranicu (puzzles, city pages, blog) → Bing/Yandex indeksiraju u 24h.
8. **Daily Puzzle blog post** — automatski svaki dan nova stranica `/puzzle/{datum}` sa rešenjem → dugorepi keywords → Discover trafik.
9. **FAQ JSON-LD svuda** — već postoji na age guides, raširiti na sve glavne stranice → rich snippets u Google rezultatima.
10. **hreflang sr/en** — duple verzije ključnih stranica za srpski + engleski trafik.

### C. Konverzija & retencija
11. **TonightArenaBanner refresh** — sa live brojem prijavljenih ("47 igrača već unutra") → social proof.
12. **Push notif "5 igrača iz tvog grada upravo igra"** — geo-lokalizovan trigger.
13. **Email "We miss you" sekvenca** — 3, 7, 14 dana neaktivnosti → "Tvoj rival {ime} te izazvao".
14. **Discord widget na home-u** — live broj online članova → "živ" osećaj.

### D. Cleanup (manje je više)
15. Sakriti iz Navbar/Footer prazne fiče (Battle Royale, Clans, Stream Hub) dok ne imaju kritičnu masu igrača — fokus na Play / Puzzles / Tournaments / Map.

---

## 3. ŠTA TI (USER) RADIŠ PARALELNO (operativno, van koda)

Ovo ja **ne mogu** da uradim umesto tebe, ali bez ovoga rast je spor:

| # | Akcija | Vreme | Efekat |
|---|--------|-------|--------|
| 1 | **Google Search Console** — verifikuj domen, submit sitemap_index.xml, request indexing za top 20 stranica | 30 min | Indeksiranje za 3-7 dana umesto 30 |
| 2 | **Google Business Profile** — kreiraj "MasterChess" kao online business, kategorija "Chess club", region Srbija | 20 min | Pojavljivanje u Maps pretrazi "chess near me" |
| 3 | **Google Ads — €5/dan kampanja** na keywords: "chess online", "šah online besplatno", "play chess Serbia" | 15 min setup | 30-80 klikova/dan, ~10 registracija/dan |
| 4 | **Meta Ads — €5/dan** sa "13-godišnji osnivač" videom → Lookalike audience šahisti SR/HR/BA/SI | 30 min | Viralni potencijal, jeftina cena po klik na Balkanu |
| 5 | **TikTok** — 1 video dnevno: Nikola igra, "beat me", "puzzle dana" → link u biou | 15 min/dan | Najjeftiniji organski trafik 2026 |
| 6 | **PR pitch** — Netokracija, Startit, Telegraf "13-godišnjak iz SR napravio šah platformu" | 1h jednom | 1 članak = 500-2000 poseta + backlink |
| 7 | **Reddit** — r/chess, r/serbia, r/beginnerchess: "I built this, feedback?" | 30 min | 200-1000 poseta po post-u |
| 8 | **Product Hunt launch** — utorkom, pripremi assets nedelju ranije | 4h priprema | 1000-3000 poseta na dan launch-a |

---

## 4. TEHNIČKI DETALJI (za AI/dev čitaoca)

- **Mapa**: `@vis.gl/react-google-maps` + `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` (već dostupan). City data iz `src/data/cities.ts` (nadograditi postojeći). Markeri grupisani po regiji.
- **City pages**: dinamički route `/chess/:city`, content iz tabele `cities` + live count iz `profiles` po `city_slug` koloni (dodati migraciju).
- **Share cards**: server-side render preko nove edge funkcije `generate-share-card` koja koristi `@vercel/og` ili Satori → vraća PNG.
- **IndexNow**: `public/indexnow-{key}.txt` + edge funkcija `ping-indexnow` koja se okida na nove redove u `daily_puzzles` i `cities`.
- **City vs City**: nova tabela `city_battles` (week_start, city_a, city_b, score_a, score_b) + cron edge fn nedeljom.
- **`/vs/{username}`**: route koji čita `profiles.username` → "Izazvao te je {ime}, prihvati za 3...2...1".

---

## 5. REDOSLED IMPLEMENTACIJE (predlog)

Ako odobriš plan, gradimo ovim redom (svaki korak je samostalno koristan, mogu da stanem između):

1. **Cleanup nav/footer** (15 min) — odmah čistiji utisak
2. **`/vs/{username}` challenge link** (1h) — najlakše viralno
3. **Auto Share Card posle pobede** (2h) — viralni motor
4. **`/chess-map` sa Google Maps** (3h) — glavna atrakcija
5. **`/chess/{city}` programatske stranice** (2h) — SEO masa
6. **IndexNow + GSC sitemap submit pomoć** (1h)
7. **City vs City duel sistem** (3h) — retencija
8. **"Beat Nikola" certifikat** (1h) — emocija

---

## PITANJE ZA TEBE

Reci samo **"kreni"** pa idem redom 1→8, ili napiši broj/brojeve koje hoćeš odmah (npr. "1, 2, 4"). Takođe potvrdi: hoćeš li ti odraditi listu iz sekcije 3 (Search Console, Ads, TikTok), ili ti treba detaljan vodič korak-po-korak za neki od njih?
