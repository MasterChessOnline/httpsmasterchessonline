
# Plan: Make uploaded crown the official MasterChess logo + maximize GBP asset pack

## 1. Adopt new logo sitewide
- Upload `logo_8.png` (hand-drawn double-crown "M") to Lovable Assets CDN as the canonical brand mark
- Replace logo references in:
  - `index.html` favicon + `<link rel="icon">` + apple-touch-icon
  - OG image / Twitter card meta (`og:image`)
  - Header/Navbar component (find current logo usage)
  - Footer logo
  - Loading screen / splash (if exists)
  - PWA `manifest.json` icons (192, 512)
  - Login/Signup glassmorphic card brand mark
- Generate 3 sized variants (512, 192, 1024 with white bg for GBP) via edit_image

## 2. Generate additional GBP images (beyond the existing 5)
Add to `/mnt/documents/gbp/`:
- `masterchess-logo-official.png` — the uploaded crown, cleaned, 1024×1024, white bg
- `masterchess-discord.jpg` — mock Discord community screenshot
- `masterchess-admin.jpg` — admin dashboard mockup (proves real platform)
- `masterchess-mobile.jpg` — phone showing masterchess.live in browser
- `masterchess-founder.jpg` — "Built by Nikola, 13" Human Soul story card
- `masterchess-live-players.jpg` — live player counter / online lobby
- `masterchess-tournament-bracket.jpg` — Battle Royale 8-player bracket
- `masterchess-puzzle.jpg` — daily puzzle screen
- `masterchess-bot-personalities.jpg` — 9 bots gallery

Total: existing 5 + new 9 = **14 images** for GBP

## 3. Verification video script
Create `docs/GBP_VERIFICATION_VIDEO_SCRIPT.md` — exact 30-sec screen-recording shot list (homepage → Play → tournament → /admin → /admin/gbp-posts) for GBP video verification

## 4. Expand GBP asset pack doc
Update `docs/GOOGLE_BUSINESS_PROFILE_ASSET_PACK.md`:
- New logo reference
- All 14 image filenames + intended GBP slot (logo / cover / "by owner" gallery / Products / Services)
- **Products section** (5 entries): Free Online Chess, Daily Tournaments, AI Game Review, Chess Puzzles, Bot Practice
- **Services section** (4): Ranked Play, Tournaments, Lessons, Community
- **Q&A pack** (6 pre-written Q+A pairs to paste into GBP)
- **Hours**: Open 24 hours
- **Attributes**: Online service, LGBTQ+ friendly, Identifies as women-led? (no — skip)
- Video verification script link

## 5. Seed Google Posts in DB
Insert 4 starter scheduled posts into `gbp_posts` table (Mon tournament / Wed puzzle / Fri champion / Sun stats) so `/admin/gbp-posts` is pre-populated and ready to publish day-1 after verification

## Technical notes
- Logo: hand-drawn crown PNG, transparent — keep PNG, use as-is for favicon
- For GBP upload (Google requires square, no transparency for logo slot) — generate a 1024×1024 white-background variant via `edit_image`
- Won't touch `src/integrations/supabase/client.ts` or other auto-gen files
- Skipping Discord (per earlier user instruction "uradi sve osim discorda")

## Out of scope
- Actual GBP verification (manual, requires Google account)
- Real Discord screenshot (user excluded Discord)
