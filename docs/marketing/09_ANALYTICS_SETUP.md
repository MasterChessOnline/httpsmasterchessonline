# Analytics Setup — GA4, pikseli, UTM, KPI tabela

Bez ovog, ne znaš šta radi. Vreme setup-a: **2h**. Bez izmena koda projekta.

## 1. GA4 (Google Analytics 4)

1. Idi na https://analytics.google.com → Create Property
2. Property name: `MasterChess`
3. Reporting time zone: `Europe/Belgrade`
4. Currency: `EUR`
5. Data stream → Web → URL: `masterchess.live`
6. Copy **Measurement ID** (format `G-XXXXXXXXXX`)

**Postavljanje na sajt** (opcija A — via Google Tag Manager, bez koda):
1. Napravi GTM container
2. Tag: GA4 Configuration → Measurement ID = tvoj G-XXX
3. Trigger: All Pages
4. Publish container
5. Dodaj GTM container ID u `index.html` `<head>` — **ovo je jedina izmena sajta**, jednokratna

**Opcija B** (direktno u kod): pitaj Lovable da doda `<script>` u `index.html` sa VITE_GA4_ID env var.

### Custom events za praćenje
Već postoji `src/lib/track.ts` u kodu — proveri da li emituje:
- `signup_completed`
- `game_started`
- `tournament_registered`
- `pwa_installed`
- `bot_defeated`

Ako ne — reci Lovable da doda emitovanje u odgovarajuće handlere.

## 2. Meta Pixel

1. Idi na https://business.facebook.com → Events Manager
2. Data Sources → Add → Web → Meta Pixel
3. Name: `MasterChess Pixel`
4. Copy Pixel ID
5. Setup: preko GTM (isti container kao GA4) → dodaj Custom HTML tag sa Meta Pixel snippet
6. Trigger: All Pages

**Standard events za konfigurisati**:
- `PageView` (automatski)
- `CompleteRegistration` (na signup)
- `Lead` (na DB Cup registraciju)
- `StartTrial` (na pokretanje prve igre)

## 3. TikTok Pixel

1. https://ads.tiktok.com → Assets → Events → Web Events → Create Pixel
2. Standard mode
3. Setup preko GTM, isto kao Meta

## 4. UTM konvencija (obavezna)

**Format**:
```
https://masterchess.live/?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

**Standardni source-i**:
| Source | Medium | Campaign primer |
|---|---|---|
| `reddit` | `organic` | `nikola_story` |
| `reddit` | `organic` | `db_cup_launch` |
| `google` | `cpc` | `search_en_bots` |
| `google` | `cpc` | `pmax_dbcup` |
| `meta` | `cpc` | `reels_founder` |
| `tiktok` | `cpc` | `hook_13yo` |
| `youtube` | `organic` | `dailychess12_stream` |
| `whatsapp` | `direct` | `friends_launch` |
| `press_blic` | `referral` | `nikola_interview` |
| `discord_gothamchess` | `organic` | `self_promo` |
| `gbp` | `organic` | `belgrade_local` |
| `email` | `newsletter` | `weekly_digest` |

**Alat za generisanje**: https://ga-dev-tools.google/campaign-url-builder/

**Uvek koristi UTM za spoljne linkove.** Bez toga ne znaš šta radi.

## 5. Conversion values u GA4

Idi na Admin → Events → Mark as Conversion:
- `signup_completed` ✓
- `tournament_registered` ✓
- `game_started` ✓
- `pwa_installed` ✓

Za PPC atribuciju:
- Idi na Ads Linking → Link Google Ads account
- U Google Ads → Tools → Conversions → Import from GA4

## 6. KPI Sheet template (Google Sheets)

Napravi novi sheet `MasterChess KPI Dashboard` sa tabovima:

### Tab 1: Daily
| Datum | Signups | DB Cup regs | DAU | Games played | Sessions | New from Reddit | New from Ads | New from Direct |
|---|---|---|---|---|---|---|---|---|

### Tab 2: Channel breakdown
| Nedelja | Reddit | Google Ads | Meta | TikTok | YouTube | GBP | Direct | Total |
|---|---|---|---|---|---|---|---|---|

### Tab 3: Ads ROI
| Kanal | Spent | Signups | CPA | LTV est. | ROI |
|---|---|---|---|---|---|
| Google Search EN | | | | | |
| Google PMax DB Cup | | | | | |
| Meta Reels | | | | | |
| TikTok | | | | | |

### Tab 4: Content performance
| Datum | Post | Platform | Views | Likes | Comments | Clicks | Signups |
|---|---|---|---|---|---|---|---|

**Update cadence**: dnevno (5 min posao pre spavanja).

## 7. Alerti (auto notifikacije)

U GA4 → Configure → Custom Insights → Create:

1. **"Signup drop 50%"** — Weekly signups drop > 50% vs previous week → email alert
2. **"Traffic spike 3x"** — Sessions > 3× dnevni prosek → email alert (znaš da je post postao viral)
3. **"Zero signups 24h"** — 0 signup u 24h → email alert (nešto slomljeno)

## 8. Weekly review ritual (subota 30 min)

1. Otvori KPI Sheet
2. Ažuriraj brojke iz GA4 + Ads platformi
3. Pitanja:
   - Koji kanal je najbolji CPA? → povećaj budžet
   - Koji je gori? → pauziraj ili menjaj kreativu
   - Koji Reddit post je uhvatio? → replikuj format
   - Koji A/B test je pobedio? → primeni
4. Napiši 3 stvari za sledeću nedelju

## 9. Šta NE meriti (distraction metrics)

- ❌ Pageviews (bez konverzije = beznačajno)
- ❌ Bounce rate (moderno GA4 ionako ne prikazuje)
- ❌ Social followers (bez klikova na sajt = vanity)
- ❌ Impressions bez CTR-a

**Meri samo**: signups, DB Cup regs, DAU, LTV. Sve ostalo je noise.
