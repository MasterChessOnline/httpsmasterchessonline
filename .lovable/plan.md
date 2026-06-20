# MasterChess Phase 5 — Discord + GSC + Google Maps

Three parallel tracks. Each track ships end‑to‑end (UI + backend + docs) so you can verify before moving on.

---

## Track A — Discord (community spine)

### A1. Login with Discord
Lovable Cloud's managed OAuth supports **Google + Apple only**. Discord login requires switching this project to a self-hosted Supabase Auth — a big architectural change I do not recommend. Instead I'll ship **Discord account linking** (already-logged-in MasterChess user clicks "Link Discord" → OAuth2 popup → we store `discord_user_id`, `discord_username`, `discord_avatar` on `profiles`).

Files:
- migration: add `discord_user_id`, `discord_username`, `discord_avatar`, `discord_linked_at` to `profiles`
- edge fn `discord-oauth-callback` (exchanges `code` for token, fetches user, upserts)
- `src/pages/Settings.tsx` — new "Connected accounts" card with Link/Unlink Discord button
- secrets: `DISCORD_CLIENT_ID` (public, in code), `DISCORD_CLIENT_SECRET` (add_secret)

### A2. Discord bot (`!play !rank !stats !tournament !join !challenge`)
Bot cannot run inside Lovable (no always-on Node host). I'll ship:
- public read endpoints the bot calls: edge fns `public-stats`, `public-rank`, `active-tournaments` (no auth, cached headers)
- complete bot source in `bot/discord-bot/` (Node + discord.js) with the 6 commands wired to those endpoints
- updated `docs/DISCORD_BOT_SETUP.md` with Railway one-click deploy steps

### A3. Real-time sync via webhooks
Extend existing `discord-webhook-publish` triggers:
- `online-games` finish → post "🏆 {winner} beat {loser} ({rating change})" to `#results`
- `tournaments` `status='active'` transition → @everyone ping
- `tournament_titles` insert → winner shoutout + role hint

### A4. Auto-role mapping (Pawn → Grandmaster)
- new edge fn `discord-sync-roles` (cron every 15 min): for every linked user, computes rank from rating + wins + title, calls Discord REST `PUT /guilds/{id}/members/{user}/roles/{role}`
- secrets: `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_ROLE_PAWN` … `DISCORD_ROLE_GRANDMASTER`
- mapping: Pawn (new), Knight (5W), Bishop (20W), Rook (any tournament reg), Queen (top 10%), King (top 1%), Grandmaster (season winner from `season_results`)

---

## Track B — Google Search Console (SEO loop)

### B1. Landing pages with full meta
- `/play` already exists → verify/rewrite title+desc+OG to the spec
- `/tournaments` → same
- `/puzzles` already exists → verify
- `/ranked` exists (Phase 3) → verify
- each gets unique `<Seo>` block with title, description, OG image, JSON-LD `WebPage`/`Game`

### B2. Sitemap auto-regen on new tournaments
- `scripts/generate-sitemap.ts` already shards; add `sitemap-tournaments.xml` (already in plan, now actually wired)
- new edge fn `regenerate-sitemap-tournaments` triggered by DB trigger on `tournaments` insert/update (writes to a Storage bucket `public-sitemaps`, served via redirect from `/sitemap-tournaments.xml`)
- add to `sitemap_index.xml`

### B3. GSC verification + submission (automated where possible)
- add Google site-verification `<meta>` to `index.html` (you paste the token)
- edge fn `submit-sitemaps-gsc` (already exists) — add cron weekly Monday 06:00 UTC
- new admin page `/admin/seo-console` showing last submission status per sitemap shard

### B4. Search-query → keyword loop
- edge fn `fetch-gsc-queries` (weekly cron): pulls top 50 queries with impressions but CTR < 2%
- writes to new table `seo_query_opportunities (query, impressions, ctr, suggested_page, picked_up_at)`
- `/admin/seo-console` lists them with "Insert into /play copy" button (manual click — no auto-rewrite of public pages)

### B5. Setup docs
Updated `docs/GOOGLE_SEARCH_CONSOLE_SETUP.md` with the 4-step verification → submission → query-loop flow.

---

## Track C — Google Maps (trust + community)

Connect `google_maps` connector first. Then:

### C1. `/community/map` — Global Chess Community Map
- pulls `profiles` with `country` + `city` (already on profile)
- clusters with `@googlemaps/markerclusterer`
- click pin → mini profile card (avatar, rating, "Challenge" button)
- only opted-in users shown (new `profiles.show_on_map` boolean, default false, settings toggle)

### C2. `/clubs/map` — Chess Clubs map
- `clubs` table already has location? if not, add `lat`, `lng`, `country`, `city`
- pins per club, click → /clubs/:id

### C3. `/tournaments/map` — Tournament regions heat-layer
- aggregate `tournament_registrations` JOIN `profiles.country` → heat layer (Maps `visualization.HeatmapLayer`)

### C4. Google Business Profile
Manual step; new `docs/GOOGLE_BUSINESS_PROFILE.md` updates with exact category ("Game publisher"), opening hours (24/7), photo specs, posting cadence.

---

## Order of execution

1. **Track B first** (cheapest wins, no external account setup needed) — landing pages + sitemap + GSC docs.
2. **Track A** — DB migration → settings UI → callback edge fn → webhook expansion → role-sync cron → bot source + docs. Requires you to add Discord secrets after I scaffold.
3. **Track C** — connector connect → `show_on_map` toggle → 3 map pages → business profile doc. Requires you to approve `google_maps` connector.

Pause after each track for verification.

---

## Technical notes

- New tables: `seo_query_opportunities` (with grants + RLS admin-only).
- New columns on `profiles`: `discord_*` (4), `show_on_map` (bool), `map_lat`, `map_lng` (numeric, nullable).
- New edge functions: `discord-oauth-callback`, `discord-sync-roles`, `public-stats`, `public-rank`, `active-tournaments`, `regenerate-sitemap-tournaments`, `fetch-gsc-queries`.
- New cron jobs: `discord-sync-roles` (15 min), `submit-sitemaps-gsc` (weekly), `fetch-gsc-queries` (weekly).
- New secrets you'll add when prompted: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`, `DISCORD_ROLE_*` (7 role IDs).
- Connectors to link: `google_maps` (already may exist), `google_search_console` (already linked per existing fn).
- No payments, no native app, no framework migration.

Reply **"Start Track B"**, **"Start Track A"**, or **"Start Track C"** (or "All" to run sequentially).