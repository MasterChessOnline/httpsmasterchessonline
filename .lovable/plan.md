# Revert site logo + maximize Google Maps / GBP setup

You asked for two things:
1. **Revert the site logo back to the original MasterChess crown icon** (the Lucide Crown, not the hand-drawn PNG).
2. **For Google Maps / GBP — add everything**: weekly Google Posts, reviews, all extras.

---

## Part 1 — Revert site logo (frontend only)

**Files to change:**
- `src/components/Navbar.tsx` (line 252–264): replace the `<img src="/logo-crown-white.png">` block with the original Lucide `<Crown>` icon inside the gold-bordered tile — exactly as it was before.
- `index.html`: revert favicon + `apple-touch-icon` + `og:image` references back to the previous favicon/OG image (the splash, not the hand-drawn crown).
- `public/manifest.json`: revert PWA icons (`app-icon-192.png`, `app-icon-512.png`, maskable variants) back to the original generated icons.
- Regenerate `public/favicon.png`, `public/apple-touch-icon.png`, `public/app-icon-192.png`, `public/app-icon-512.png`, `public/app-icon-maskable-192.png`, `public/app-icon-maskable-512.png` using the original Crown-icon design (gold crown on dark bg, like before).

**What stays:**
- `public/logo-crown.png` and `public/logo-crown-white.png` stay on disk — they're only used for the **GBP logo upload**, not in the site UI.

---

## Part 2 — Maximize Google Business Profile (Google Maps)

### A. Weekly Google Posts — full year cadence
Pre-seed `gbp_posts` table with **52 posts** (1 per week for a full year), rotating across 4 themes:
- **Mon — Tournament announcement** (weekly Swiss / Arena)
- **Wed — Daily puzzle highlight**
- **Fri — Champion of the week / featured game**
- **Sun — Stat drop / community moment**

Each post: title (≤120 chars), body (300–500 chars, SEO keywords: "online chess", "free chess", "chess tournament"), CTA "Play now" → `https://masterchess.live`, scheduled date set forward weekly. Status = `scheduled` so the existing `publish-gbp-posts` cron picks them up.

### B. Reviews playbook
Create `docs/GBP_REVIEWS_PLAYBOOK.md` covering:
- Direct review link template: `https://search.google.com/local/writereview?placeid={PLACE_ID}` — with instructions for finding place ID after verification.
- **In-app review prompt** — add a small "⭐ Rate us on Google" card on `/rate` (existing `RateMasterChess.tsx`) that deep-links to the GBP review form for logged-in users who've played 5+ games.
- Post-tournament email/notification template asking winners to leave a Google review.
- 10 pre-written **review reply templates** (positive, negative, neutral, troll, bug report, feature request, ratings only, multilingual EN/SR).
- Schedule: reply to every review within 24h. Aim 10 reviews in week 1, 50 in month 1.

### C. New documentation
- `docs/GBP_WEEKLY_POSTS_CALENDAR.md` — the full 52-week editorial calendar (matches DB seed).
- `docs/GBP_REVIEWS_PLAYBOOK.md` — the reviews system above.
- `docs/GBP_MAX_CHECKLIST.md` — single "100% complete" master checklist consolidating:
  - Basic info, description, logo, cover
  - 14 images (already done)
  - 5 Products, 4 Services, 6 Q&A (already done)
  - Hours: 24/7
  - Attributes: Online service, Free, Identifies as LGBTQ+ friendly
  - Weekly post cadence
  - Reviews target & reply SLA
  - Insights monitoring (weekly check)
  - UTM tracking on website link: `?utm_source=gbp&utm_medium=knowledge_panel`
  - Posting from masterchess.live → GBP backlink via JSON-LD `LocalBusiness` schema added to `index.html`
  - Google Search Console linked to GBP

### D. JSON-LD LocalBusiness schema
Add `LocalBusiness` structured-data block to `index.html` (`<head>`) with:
- name, url, logo (crown), sameAs (social links), areaServed: Worldwide, priceRange: "Free", aggregateRating placeholder (filled in after first reviews).

### E. Light UI additions
- New `/rate` card variant: "Rate MasterChess on Google" with deep-link button (only shows for users with ≥5 games).
- Footer: add small "⭐ Review us on Google" link.

---

## Files touched

**Revert:**
- `src/components/Navbar.tsx` (logo block)
- `index.html` (favicon, OG, + add JSON-LD LocalBusiness)
- `public/manifest.json`
- `public/favicon.png`, `apple-touch-icon.png`, `app-icon-*.png` (regenerate as original Crown icon)

**GBP additions:**
- Migration: insert 52 weekly posts into `gbp_posts` (status=scheduled, dates Mon/Wed/Fri/Sun across the year)
- `docs/GBP_WEEKLY_POSTS_CALENDAR.md`
- `docs/GBP_REVIEWS_PLAYBOOK.md`
- `docs/GBP_MAX_CHECKLIST.md`
- `src/pages/RateMasterChess.tsx` (add Google review card)
- `src/components/Footer.tsx` (small "Review us" link)

## Out of scope
- Real GBP verification (manual, your Google account).
- Actual Place ID — added after Google approves the listing.
