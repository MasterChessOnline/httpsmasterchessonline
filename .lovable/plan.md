# "Strava za šah" — Social-First diferencijator

## Zašto to pobeđuje chess.com

Chess.com i lichess tretiraju partiju kao **izolovan događaj**: odigraš, dobiješ rating, kraj. MasterChess tretira šah kao **socijalni feed** — svaka partija stvara sadržaj koji se deli, na koji prijatelji reaguju, koji gradi rivalstva. To je model koji Strava koristi za trčanje, Letterboxd za filmove, BeReal za slike.

**Zašto chess.com to neće uraditi:** oni imaju 150M korisnika i optimizuju za "još jedna partija". Njihov proizvod je *igračnica*. Naš je *zajednica*. Oni ne mogu da promene identitet bez rizika, mi možemo da ga izgradimo od nule.

**Kada te neko pita "zašto MasterChess?":**
> "Chess.com je gde igraš. MasterChess je gde **postoji** tvoj šahovski život — feed, prijatelji, rivalstva, momenti."

---

## Tri stuba koja gradimo

### 1. Match Story (deliljiva kartica posle svake partije)
Automatski generisana estetska kartica sa:
- Rezultat + protivnik + rating change
- **"Move of the Game"** — najbolji potez sa GIF animacijom table (2s loop)
- Tvoje "vibe" tagovi (npr. „Beast Mode", „Comeback", „Blunder Recovery" — izračunato iz eval swing-ova)
- Watermark: masterchess.live/@username
- Dugmad: **Share** (WhatsApp/X/IG story) i **Save** (u tvoj profil)
- Radi za sve partije: online, vs bot, turnir

**Efekat:** svaka odigrana partija je potencijalni post na IG/X sa linkom nazad. Viralni loop.

### 2. Feed prijatelja (`/feed`)
Timeline stil (kao IG), ali samo šah:
- Match Stories tvojih prijatelja / ljudi koje pratiš / iz kluba
- Auto-događaji: „Marko je dostigao Blitz 1500", „Ana je pobedila u turniru", „Petar ima 7-win streak"
- Klupski događaji: novi članovi, novi turnir, nova vest
- **Reakcije**: 🔥 🧠 🤯 😂 ♟️ (jedan tap)
- **Komentari** ispod story-ja
- Push notifikacija: „Ana ti je reagovala na partiju"

**Efekat:** ljudi otvaraju MasterChess **iz navike, ne samo da bi igrali** — što je metrika koja ubija chess.com u zadržavanju.

### 3. Rivalries (H2H sa prijateljima)
Automatski praćeno na svakom profilu:
- „Ti vs Marko: **7-3-1** u Blitzu" (progress bar sa istorijom)
- „Najduži win streak protiv njega: 4"
- „Sledeći put kad ga pobediš → Rivalry badge"
- Dugme: **„Izazovi ga sada"** → direktan match
- Widget na `/feed` kartici: „Marko je pobedio Anu 3-2 ove nedelje"

**Efekat:** pretvara prijateljstvo u redovnu petlju igranja. Ljudi se vraćaju **jer imaju konkretnog protivnika koga hoće da pobede**, ne apstraktni rating.

---

## Šta gradimo u ovoj iteraciji (MVP)

Redosled:

**1) Match Story generator**
- Nova ruta `/game/:id/story` — SSR-styled kartica (Canvas API za GIF export)
- Trigger: posle svake završene partije (`online_games`, `bot_games`) — dugme „Share Story"
- Backend: analiza `online_game_moves` za „move of the game" (najveći eval swing u tvoju korist)
- Kartica koristi Gold & Black estetiku, banner sa avatarima oba igrača, animiranu tablu

**2) Feed stranica**
- Nova ruta `/feed` (glavna landing za ulogovane, uz `/`)
- Nova tabela `feed_items`: (user_id, kind, payload jsonb, visibility, created_at)
  - `kind`: `match_story | rating_up | tournament_win | streak | club_join | badge_earned`
- Auto-populate preko trigera na `online_games`, `rating_history`, `tournament_registrations`, `player_badges`
- Nova tabela `feed_reactions`: (feed_item_id, user_id, emoji)
- Nova tabela `feed_comments`: (feed_item_id, user_id, body)
- Realtime subscribe za live reakcije
- Filter: **Friends / Clubs / Global**

**3) Rivalries**
- Nova tabela `rivalries` (agregat, populated triggerom na `online_games`):
  - (user_a, user_b, wins_a, wins_b, draws, last_played_at, streak_holder, streak_count)
  - „user_a < user_b" konvencija (deterministički par)
- Widget na `/u/:username` profilu (samo ako je ulogovan): tvoj H2H sa njim
- Novi tab `/rivals` — lista svih tvojih rivalstava
- „Rivalry Badge" — kad neko odigra ≥10 partija sa jednim igračem
- Push notifikacija kad rival odigra partiju bez tebe („Marko igra bez tebe, pridruži se")

---

## Ne radimo (kasnije, ako MVP pali)
- Chess Clips (video export) — Canvas GIF je za sada dovoljan
- Squad play 2v2/3v3 — velika mehanika, tek posle validacije
- Watch Together sa voice — voice već postoji, integracija u feed kasnije
- Weekly Recap DM — posle 1000 aktivnih korisnika (nema smisla ranije)

---

## Tehnički detalji

**Nove tabele (jedna migracija):**
```
feed_items       (id, user_id, kind, payload jsonb, visibility, created_at)
feed_reactions   (feed_item_id, user_id, emoji, created_at)  -- unique(item, user, emoji)
feed_comments    (id, feed_item_id, user_id, body, created_at)
rivalries        (id, user_a_id, user_b_id, wins_a, wins_b, draws, last_played_at, streak_holder_id, streak_count)
match_story_cache (game_id, kind, best_move_ply, best_move_swing, tags text[], created_at)
```

Sve sa GRANT + RLS: public read za feed_items gde je `visibility='public'`, friends-only kad je `'friends'`. Insert samo za sopstvenog user_id.

**Realtime:** `ALTER PUBLICATION supabase_realtime ADD TABLE feed_reactions, feed_comments;`

**Nove rute:**
- `/feed` — glavni timeline
- `/rivals` — svi tvoji rivali
- `/game/:id/story` — deljiva kartica (public, indexable)
- Widget `<RivalryCard/>` na `/u/:username`

**Trigger funkcije:**
- `after_game_end` na `online_games` → insertuje `feed_item(kind='match_story')` + update `rivalries`
- `after_rating_change` → ako je delta ≥50 ili prelazi tier → insert `feed_item(kind='rating_up')`
- `after_tournament_win` → insert `feed_item(kind='tournament_win')`
- `after_badge_earn` → insert `feed_item(kind='badge_earned')`

**Match story kartica:**
- React komponenta koja renderuje na Canvas
- Export: PNG (za IG story 1080×1920) i GIF (za X/WhatsApp, 800×800, 2s loop table + best move)
- SSR-friendly meta tags → link deljen na WhatsApp/X pokazuje pravi preview

**Fajlovi:**
- `supabase/migrations/xxxx_social_feed.sql`
- `src/pages/Feed.tsx`
- `src/pages/Rivals.tsx`
- `src/pages/MatchStory.tsx` (deljiva stranica)
- `src/components/feed/FeedItem.tsx`
- `src/components/feed/ReactionBar.tsx`
- `src/components/feed/CommentThread.tsx`
- `src/components/social/RivalryCard.tsx`
- `src/lib/matchStory.ts` (analiza best-move, tag detekcija)
- `src/lib/storyCanvas.ts` (PNG/GIF render)
- update `src/pages/PublicPlayer.tsx` (RivalryCard)
- update `src/App.tsx` (rute)
- update `src/pages/OnlineGameEnd.tsx` (dugme „Share Story")

---

## Kako meriti da li radi

Ove metrike su **jedini** validan signal:
- **D7 retention** za korisnike koji su videli feed vs oni koji nisu (A/B)
- **Prosečan broj Match Story share-ova po korisniku nedeljno** (target: ≥1)
- **Rivalry rematch rate** — % rivalstava koja odigraju partiju ≤7 dana od prethodne (target: 40%)
- **DAU/MAU ratio** — target: ≥25% (chess.com je ~15%, lichess ~20%)

Ako nakon 4 nedelje feed nema ≥30% dnevno aktivnih koji ga otvore, ubijamo feature i vraćamo se drugom stubu.
