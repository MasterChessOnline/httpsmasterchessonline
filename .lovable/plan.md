## Kratak odgovor na pitanje o Google plaćanju

**NE moraš da plaćaš Google mesečno.** Chess.com nije popularan jer plaća Google — popularan je jer ima:
1. 20+ godina starosti domena i milione backlink-ova
2. Ogroman volumen sadržaja (puzzle, lessons, video)
3. Viralni krug korisnika koji prirodno dele

Google **organska pretraga = besplatna**. Plaćanje (Google Ads) je opcija samo ako hoćeš da kupuješ klikove — skupo i prestane čim staneš da plaćaš. **Bolja investicija = SEO + share viralnost + backlink-ovi**, što ti sajt već pravi temelj za.

Ako želiš ipak da uložiš par evra: $30–50/mo na Google Ads sa ciljem "play chess online free" je dovoljno za test, ali ne pre nego što popraviš sve dole.

---

## Plan: bolji share + masivni promo paket

### 1. Share button — dodaj sve popularne aplikacije
Trenutno `FloatingShareButton` ima samo 4 (WhatsApp, Telegram, X, Facebook). Dodaj:
- **Viber** (`viber://forward?text=...`)
- **Instagram** (Web Share API native, fallback: copy + "Open Instagram" CTA, jer IG nema direct share URL)
- **Facebook Messenger** (`fb-messenger://share?link=...`)
- **Reddit** (`https://reddit.com/submit?url=...&title=...`)
- **LinkedIn** (`https://linkedin.com/sharing/share-offsite/?url=...`)
- **Email** (`mailto:?subject=...&body=...`)
- **SMS** (`sms:?body=...` — radi na telefonu)
- **Native share** dugme (Web Share API) na vrhu menija na mobilnom — otvara OS share sheet sa SVIM instaliranim aplikacijama (TikTok DM, Snapchat, Discord, itd. — sve odjednom)

**UX:** kategorizovati u tabove: "Messaging" / "Social" / "Other". Grid 3 kolone umesto 2. Detect mobile → prikaži native share kao prvi CTA.

### 2. Inteligentni share tekst
Trenutni tekst je generičan ("Check out MasterChess..."). Dodaj kontekstno-svestan tekst po stranici:
- Na `/play/online?gameId=X` posle pobede: "Just won my chess game in X moves on MasterChess! 🏆"
- Na `/puzzles`: "Try this chess puzzle — can you solve it?"
- Na opening pageu: "Learning the Ruy Lopez on MasterChess"
- Sa pre-generated OG screenshot pozicije/krunisanog kralja → ljudi dele LEPU sliku, ne URL

### 3. Referral incentive
Već imaš referral system (`useReferralTracker`). Dodaj:
- Posle share: "You'll get 100 coins when your friend signs up"
- Counter na `/profile`: "X friends invited"
- Top 10 referrers leaderboard

### 4. Promo IDEJE (zero-budget viralnost)

**A) TikTok/Reels strategy (najjače za chess danas)**
- DailyChess_12 kanal već imaš → pravi 30–60s shortove: "Beat Magnus in 8 moves" pozicije, blunder reactions, speed runs
- Svaki video završava sa "Play this on masterchess.live"
- Cilj: 3 shortova/dan, 30 dana = test viralnosti

**B) Reddit guerilla**
- Postuj korisne stvari na: r/chess (1M+), r/chessbeginners, r/AnarchyChess (humor!), r/SideProject
- NE spamuj link — pravi value posts: "I made a free site with no ads/puzzles — here's why and how" + screenshot
- AMA "13-year-old built chess platform" — to je gold story

**C) Hacker News + Product Hunt launch**
- Post na "Show HN: I'm 13 and built a chess platform"
- Launch na ProductHunt — ako uspe top 5, donosi 5–10k posetilaca u 1 dan + ozbiljne backlinks
- Pre toga: imaj 3 svedočenja iz `site_ratings`

**D) Discord/Twitch chess servere**
- Pojavi se u chess Discord-ovima (Eric Rosen, Levy Rozman fanovi, BotezLive)
- Ponudi besplatan custom turnir za njihovu zajednicu na MasterChess

**E) Linkbait sadržaj (besplatni SEO)**
- Blog post: "I analyzed 1000 chess games — here's what beginners blunder"
- "Why Stockfish 16 plays the King's Indian like a maniac"
- "Free chess tools comparison (no brand names)" — privlači backlink-ove

**F) Streameri (mikro-influenseri)**
- DM 20 chess streamera ispod 5k followers
- "Hey, here's free Streamer Mode na našem sajtu — try it"
- 2–3 će prihvatiti

### 5. SEO tehnike koje još fale

**A) Backlink-ovi**
- Submit na: chess.org/links pages, web directory-je, GitHub awesome lists, free-chess-resources kompilacije
- Pomenuti na Wikipedia "Chess servers" stranici (ako ispuniš notability)

**B) Schema additions (od prošlog plana, nedovršeno)**
- BreadcrumbList po detail page-ovima
- Real `lastmod` iz DB u sitemap-u

**C) Featured snippets**
- "How to play chess" guide stranica strukturisana sa `<dl>` parovima → Google često uzima u Knowledge Panel
- "Chess piece values" stranica → ti već imaš `/piece-values`, samo schema + FAQ

**D) Brzina (Core Web Vitals)**
- Tvoj LCP image (hero) preload-uj sa `fetchpriority="high"` (već imaš za icon)
- Lazy-load YouTube embed (Facade pattern — placeholder slika dok user ne klikne)

### 6. Email captura / lifecycle
- Imaš `process-email-queue` edge function → koristi je
- Weekly "best games of the week" email automation
- Post-signup: 7-day onboarding sekvencija sa tipovima

### 7. PWA install push
- Već imaš `InstallAppButton` — promo na home dan posle prve posete
- Push notifications za turnire (već imaš `push-triggers`) — proveriti da je opt-in CTA vidljiv

### 8. Social proof na home
- "X games played today" live counter (iz `online_games` table count)
- "Y players online right now" (iz `use-presence`)
- Real, ne fake. Brojevi su mali u početku — to je OK, izgleda autentično.

---

## Konkretno šta da kodiram (build mode)

1. **`FloatingShareButton.tsx`** — proširi sa Viber, Messenger, Reddit, LinkedIn, Email, SMS, native Web Share kao primary
2. **`src/lib/share.ts`** — kontekstno-svesni share tekstovi po path-u
3. **`src/components/ReferralRewardBanner.tsx`** — novi banner na `/profile` sa referral statusima
4. **`src/components/LiveStatsStrip.tsx`** — pravi brojevi (games today, players online) iznad testimonials
5. **`src/pages/Press.tsx` / nova `Promo.tsx`** — public "Press Kit" sa screenshot-ovima, logo download, "submit us to your blog" CTA
6. **YouTube facade** — lazy load embeds (perf win)

## Šta NE diram
- Gold/black dizajn
- Brand policy (nikakvo "lichess/chess.com" ime)
- Nikakvi lažni brojevi

## Garancije
- Sve organski, bez plaćanja Google-a
- Share menu radi na svim popularnim aplikacijama (preko Web Share API + direct deep linkovi)
- SEO + viralnost win bez riskovanja brand policy-a

OK da krenem?