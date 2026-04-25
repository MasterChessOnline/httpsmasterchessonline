# Fix All QA Findings + English-Only UI

Based on the full QA test, fix every bug found and ensure every UI string is in English.

## What gets fixed

### 1. Critical bugs

- **`/profile` 404** — add a `ProfileRedirect` page mounted at `/profile` that redirects to `/profile/{currentUserId}` (or `/login` if signed out).
- **Friends dropdown is mostly fake** — make it real:
  - `/friends` becomes a tabbed page: **All Friends · Add Friend · Requests · Challenges**
  - **Add Friend tab**: search users by username/display name, send request from results
  - **Requests tab**: incoming requests with Accept/Decline + outgoing pending list
  - **Challenges tab**: pick any accepted friend → opens existing `GameInviteDialog`
  - Dropdown links use hash anchors (`#add`, `#requests`, `#challenge`) and the page reads `location.hash` to open the right tab
  - "Group Match" is removed (no real feature behind it)
- **Custom Game** — relabel in dropdown to **"Play vs Bot · Custom"** with description **"Pick a bot, time control & color"**. Endgames relabel to **"All Lessons"** with description **"Browse every lesson topic"**. (Per user choice: just fix labels.)

### 2. Policy alignment (per user choice: "Coach yes, puzzles no")

- Keep **Coach** — but rename "AI Coach" → **"Coach"** everywhere (Navbar, search palette, `/coach` page header)
- Remove from search palette: **Daily Challenge**, **Guess the Move**, **Skill Tree**
- In Achievements, **filter out** any achievement whose name/description contains "puzzle" so it never shows up

### 3. Duplicate links → real filters

- **Leaderboard** reads `?tc=bullet|blitz|rapid|classical` and `?mode=online|bot` — pre-selects mode/sort accordingly. Time control variants in Compete dropdown link with these params.
- **Tournaments** reads `?filter=mine|starting|create` — `mine` shows only tournaments where current user is registered; `starting` orders by `starts_at` asc; `create` opens the Create dialog. Compete dropdown items get the right `?filter=` value.
- **PlayOnline** reads `?tc=bullet|blitz|rapid` and pre-selects the matching `timeControlIdx` (Bullet → 1+0, Blitz → 3+0, Rapid → 10+0). Play dropdown time-control items link with these params.

### 4. Hidden features → main navigation

- Add to **Compete** dropdown: **Community** (`/community`).
- Add to **Learn** dropdown: **Game Review** (`/game-review`), **Skill Tree** removed (per puzzle policy).
- Add to **Friends** dropdown: nothing new (cleaned up above).
- Add to **Footer**: **Community**, **About**.

### 5. Visual / minor

- **Achievements**: increase visual contrast between earned and locked. Earned cards get gold ring + saturated icon, locked cards stay heavily desaturated with a small lock icon.
- **Stats**: when `games_played === 0`, show **"Unranked"** badge (gray) instead of mapping default 1200 → "Intermediate".
- **Mobile hero title**: shrink `text-5xl` to `text-3xl` at <380px so "MASTERCHESS" stays on one line.
- **Stream Hub**: the empty right panel is the chat that only shows when live. Keep behavior, but render a placeholder card "Live chat opens when the stream goes live" so the space looks intentional.

### 6. React warnings

- Wrap `MissionRow` with `forwardRef` and forward the ref to its root `motion.div` so `AnimatePresence` can attach refs cleanly.

### 7. English-only audit

Translate all Serbian strings to English in:

- **`src/components/DailyMissions.tsx`**: "Dnevne misije" → "Daily Missions", "Prijavi se da bi otključao…" → "Sign in to unlock daily missions and rewards.", "Prijava" → "Sign In", `+X XP osvojeno!` → `+X XP earned!`, "Nije uspelo" → "Failed to claim", "Vidi sve misije →" → "View all missions →".
- **`src/pages/Missions.tsx`**: "Dnevne Misije" → "Daily Missions", "Ispuni misije, čuvaj streak, osvoji XP nagrade." → "Complete missions, keep your streak, earn XP rewards.", "Trenutni streak" → "Current streak", "dana" → "days", "Drži se! Ne prekidaj seriju." → "Keep it up! Don't break the chain.", "Igraj svaki dan da rasteš streak." → "Play every day to grow your streak.", "Najduži streak" → "Longest streak", "Tvoj rekord" → "Your record", "Spreman" → "Ready", "Štiti streak ako preskočiš dan" → "Protects your streak if you skip a day", "Iskorišćen" → "Used", "Vraća se posle nove pobede streak" → "Refills after a new win streak", "Kako rade misije?" → "How missions work", "Misije se resetuju svake noći u ponoć — nove svaki dan." → "Missions reset every midnight — new ones every day.", "Pobedi i partije protiv ljudi i botova računaju se za misije." → "Wins against humans and bots both count toward missions.", "Aktivnost svaki dan podiže tvoj streak. Streak Freeze te čuva ako jednom propustiš dan." → "Daily activity grows your streak. Streak Freeze protects you if you miss a day.", "Nakon ispunjenja misije, klikni Claim da pokupiš XP." → "Once a mission is complete, click Claim to collect your XP."

Bot display names like "Marko Petrović", "Nikola Jovanović" etc. are personal names and stay as-is — they're not UI strings.

## Files touched

- `src/App.tsx` — register `/profile` route
- `src/pages/ProfileRedirect.tsx` — NEW
- `src/pages/Friends.tsx` — full tab rewrite
- `src/components/Navbar.tsx` — dropdown labels, hash links, query params, removed "Group Match", added Community + Game Review
- `src/components/NavSearchPalette.tsx` — remove Daily Challenge / Guess the Move / Skill Tree, rename "AI Coach" → "Coach"
- `src/components/Footer.tsx` — add Community + About
- `src/pages/Coach.tsx` — header rename
- `src/pages/Leaderboard.tsx` — read `?tc=` + `?mode=` and apply
- `src/pages/Tournaments.tsx` — read `?filter=` and apply
- `src/pages/PlayOnline.tsx` — read `?tc=` and pre-select
- `src/pages/Achievements.tsx` — filter out puzzle achievements + stronger earned/locked contrast
- `src/pages/Stats.tsx` — Unranked label when 0 games
- `src/components/HeroSection.tsx` — responsive title sizing
- `src/pages/StreamHub.tsx` — placeholder for offline right rail
- `src/components/DailyMissions.tsx` — `forwardRef` on `MissionRow` + English strings
- `src/pages/Missions.tsx` — English strings

## Out of scope

- DB schema changes (Friends already has `friendships` table, search uses existing `profiles` table)
- New backend endpoints (everything uses existing tables)
- The "Coach" being renamed does not change the `/coach` route or the underlying chess-coach edge function
