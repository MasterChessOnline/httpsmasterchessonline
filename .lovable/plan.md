
# Dragan Brakus Humanitarian Blitz — Implementation Plan

A focused Wave 1: ship this specific event on top of the existing tournament engine, plus four reusable upgrades (FIDE fields, check-in, extended tiebreaks, TRF export).

## What gets built

### 1. Database (single migration)
Add to `tournaments`:
- `checkin_opens_at timestamptz`, `checkin_closes_at timestamptz` (nullable — opt-in per tournament)
- `roster_locked_at timestamptz`
- `is_humanitarian boolean default false`, `organizer_label text`

Add to `tournament_registrations`:
- `checked_in boolean default false`, `checked_in_at timestamptz`
- `fide_id text`, `fide_title text`, `fide_blitz_rating int`, `federation text`, `birth_year int`
- `buchholz_cut1 numeric default 0`, `progressive_score numeric default 0`, `performance_rating int`

Add to `profiles`:
- `first_name text`, `last_name text`, `fide_id text`, `fide_title text`, `federation text`, `birth_year int`, `club text`

Cron-style trigger (or extend existing watchdog edge function) to auto-remove non-checked-in players at `checkin_closes_at`.

### 2. Tiebreak engine
Extend `recalc_tournament_tiebreaks(_tid)`:
- **Buchholz Cut 1**: Buchholz minus lowest opponent score
- **Progressive Score**: sum of running score after each round
- **Performance Rating**: standard FIDE Tournament Performance formula using opponents' `rating_at_join`
- **Direct Encounter**: resolved at sort time in the standings query (not a stored column)

Update standings sort order: Score → Buchholz → Buchholz Cut 1 → Sonneborn → Progressive → Wins → Direct Encounter.

### 3. Event seeding
Insert one tournament row:
- Name: "Dragan Brakus Humanitarian Blitz"
- starts_at: 2026-06-30 17:00 Europe/Belgrade
- checkin_opens_at: 16:45, checkin_closes_at: 16:55
- 3+2 blitz, 9 Swiss rounds, signature event
- Description with full schedule + humanitarian dedication

### 4. Frontend pages

**`src/pages/TournamentRegister.tsx`** (route `/tournaments/:id/register`)
Extended form: first/last name, email, country, city, club, FIDE ID (manual, numeric validation only), birth year, title dropdown (—/CM/FM/IM/GM/WCM/WFM/WIM/WGM), blitz rating. On submit: update profile + create registration. No FIDE auto-lookup (per user choice).

**`src/components/tournaments/CheckInPanel.tsx`**
Shows on the existing tournament detail page when `checkin_opens_at ≤ now ≤ checkin_closes_at`. Big "Check In" button → flips `checked_in = true`. Live countdown to close. Warning banner if user registered but not checked in.

**Standings table upgrade** (existing tournament detail page)
Add columns: Federation, Title, Buchholz Cut 1, Progressive, Performance. Keep mobile-friendly with horizontal scroll.

### 5. Admin / organizer actions
Extend `manage-tournament` edge function with actions:
- `force_checkin` — admin checks in a player
- `remove_unchecked` — fired by client at `checkin_closes_at` (idempotent, also covered server-side)
- `export_trf` — returns FIDE TRF16 format string
- `export_pgn` — concatenated PGN of all finished games

Add a compact "Organizer Tools" panel on the tournament page, visible only to users with `admin` or `organizer` role, with download buttons for TRF + PGN + CSV standings.

### 6. TRF export (FIDE-compliant)
Edge function `tournament-export-trf` generates the standard TRF16 layout:
```
012 Tournament Name
022 City
032 Federation
042 Date start
052 Date end
062 Number of players
072 Number of rated players
082 Number of teams
092 Type: Individual: Swiss-System
102 Chief Arbiter
112 Deputy Chief Arbiter
122 3 min + 2 sec
132 Round dates
001 [board] [sex] [title] [name] [rating] [fed] [fide id] [birth] [score] [rank] [results...]
```
Output downloadable as `.trf` for arbiter to upload to Chess-Results Serbia manually (per spec §11–12).

### 7. Event landing
`src/pages/DraganBrakus.tsx` at `/dragan-brakus`:
- Hero with dedication, date/time, time control, prize info
- Full minute-by-minute schedule (from spec §2)
- Register CTA → `/tournaments/:id/register`
- Awards list (§13)
- SEO meta + JSON-LD `SportsEvent`

Add to sitemap generator.

## Explicitly NOT in this wave
- FIDE auto-verification (user chose manual entry)
- Anti-cheat enhancements beyond what `tournament_anti_cheat_flags` already provides
- Cross-table view (TRF export covers Chess-Results upload)
- Email notifications / certificates PDF generator
- Spectator betting hooks for this event

These can become Wave 2 after the June 30 event proves the flow.

## Files touched

**New**
- `supabase/migrations/<ts>_dragan_brakus_tournament.sql`
- `supabase/functions/tournament-export-trf/index.ts`
- `src/pages/DraganBrakus.tsx`
- `src/pages/TournamentRegister.tsx`
- `src/components/tournaments/CheckInPanel.tsx`
- `src/components/tournaments/OrganizerTools.tsx`

**Modified**
- `supabase/functions/manage-tournament/index.ts` (new actions)
- `src/pages/TournamentDetail.tsx` (mount CheckInPanel + OrganizerTools, new standings columns)
- `src/hooks/use-tournament.ts` (expose new fields)
- `src/App.tsx` (routes)
- `scripts/generate-sitemap.ts` (add `/dragan-brakus`)

## Risks / open items
- Performance Rating calc needs opponents' starting ratings — already stored as `rating_at_join`, so good.
- Bye handling in tiebreaks: bye counts as a win worth 1.0 with no opponent contribution to Buchholz (FIDE standard) — will preserve current behavior.
- The existing auto-start cron handles round transitions; check-in cutoff will reuse it.
