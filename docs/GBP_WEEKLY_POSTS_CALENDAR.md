# MasterChess — Google Business Profile Weekly Posts Calendar

**Goal:** Post 4×/week on Google Business Profile for 13 weeks (52 posts total) to keep the knowledge panel fresh and rank for chess-related local + branded queries.

## Schedule (rotating themes)

| Day  | Theme       | Time (UTC) | UTM campaign |
|------|-------------|------------|--------------|
| Mon  | Tournament  | 16:00      | `tournament` |
| Wed  | Puzzle      | 16:00      | `puzzle`     |
| Fri  | Champion    | 16:00      | `champion`   |
| Sun  | Community   | 16:00      | `community`  |

All posts CTA → `https://masterchess.live?utm_source=gbp&utm_medium=post&utm_campaign={theme}` so GBP traffic is attributable in analytics.

## Content templates (rotated weekly)

### Monday — Tournament announcement
1. Weekly Swiss Tournament — Join Free
2. Arena Battle Royale — 8 Players, 1 Winner
3. Free Blitz Tournament — Every Saturday
4. Sunday Classical Tournament

### Wednesday — Daily Puzzle
1. Daily Chess Puzzle — Mate in 2
2. Tactic of the Week — Knight Fork
3. Endgame Drill — King + Pawn vs King
4. Puzzle Rush — How Many Can You Solve?

### Friday — Champion / Featured Game
1. Champion of the Week
2. Featured Game of the Week
3. Player Spotlight — Rising Star
4. Game of the Week — Brilliant Sacrifice

### Sunday — Community
1. Community Stat Drop
2. Weekly Chess Moments
3. Clan of the Week
4. Weekly Recap

## Auto-publishing

All 52 posts are pre-seeded in `gbp_posts` with `status='scheduled'`. The `publish-gbp-posts` Supabase Edge Function (cron every 15min) flips them to `ready_to_post` at the scheduled time. Until the GBP API connector is wired, an admin opens `/admin/gbp-posts`, clicks **Copy**, and pastes into business.google.com → Add update.

## SEO keywords baked into every post

- "chess online", "free chess", "play chess online"
- "chess tournament", "chess puzzle", "chess analysis"
- "MasterChess", "masterchess.live"

## Reusing the calendar

After week 13, run `npm run seed:gbp-posts` (or re-execute the same SQL seed with shifted dates) to extend another quarter.
