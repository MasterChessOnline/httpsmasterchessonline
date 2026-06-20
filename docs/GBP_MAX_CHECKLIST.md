# MasterChess — GBP "100% Complete" Master Checklist

Single source of truth for shipping the Google Business Profile to maximum strength. Tick each box in business.google.com after verification.

## ✅ Basics
- [ ] Name: `MasterChess`
- [ ] Category: `Software company` (primary), `Game publisher` (secondary)
- [ ] Description (750 chars) pasted from `GOOGLE_BUSINESS_PROFILE_ASSET_PACK.md`
- [ ] Website: `https://masterchess.live?utm_source=gbp&utm_medium=knowledge_panel`
- [ ] Email: `contact@masterchess.live`
- [ ] Hours: **Open 24 hours, every day**
- [ ] Service area: Worldwide / Europe / Serbia
- [ ] No physical location

## ✅ Media (14 images)
- [ ] Logo: `masterchess-logo-official.png`
- [ ] Cover: `masterchess-cover.jpg`
- [ ] 12 "by owner" gallery images uploaded (see asset pack)
- [ ] Verification video (60s) — see `GBP_VERIFICATION_VIDEO_SCRIPT.md`

## ✅ Products (5)
- [ ] Free Online Chess
- [ ] Daily Tournaments
- [ ] AI Game Review
- [ ] Chess Puzzles
- [ ] Bot Practice

## ✅ Services (4)
- [ ] Ranked Online Play
- [ ] Tournaments & Events
- [ ] Chess Lessons
- [ ] Community & Clubs

## ✅ Q&A (6 pre-answered)
- [ ] All 6 questions from the asset pack posted + answered as owner

## ✅ Attributes
- [ ] Online service: ON
- [ ] Free Wi-Fi: N/A (skip)
- [ ] Wheelchair accessible: N/A (skip)
- [ ] LGBTQ+ friendly: ON

## ✅ Posts (52-week calendar pre-seeded)
- [ ] `gbp_posts` table seeded with 52 posts (`status='scheduled'`)
- [ ] `publish-gbp-posts` cron running every 15 min
- [ ] Mon/Wed/Fri/Sun cadence verified at `/admin/gbp-posts`
- [ ] Editorial calendar reviewed → `GBP_WEEKLY_POSTS_CALENDAR.md`

## ✅ Reviews
- [ ] Place ID captured → `VITE_GOOGLE_REVIEW_URL` env var set
- [ ] `/rate` page surfaces "Rate on Google" button
- [ ] Footer carries "⭐ Review us on Google" link
- [ ] Reply templates loaded → `GBP_REVIEWS_PLAYBOOK.md`
- [ ] Weekly reply ritual on calendar (Mon 10min)
- [ ] Targets: 10 reviews week 1, 50 month 1, 150 month 3

## ✅ Schema / structured data
- [ ] `LocalBusiness` JSON-LD live in `index.html` (verified ✓)
- [ ] `Organization` JSON-LD live (verified ✓)
- [ ] `FAQPage` JSON-LD live (verified ✓)
- [ ] `WebApplication` JSON-LD live (verified ✓)
- [ ] `Person` (Nikola Šakotić) JSON-LD live (verified ✓)
- [ ] After first reviews → add `aggregateRating` to `LocalBusiness` JSON-LD

## ✅ Integration
- [ ] GBP linked to Google Search Console (same property)
- [ ] GBP linked to Google Analytics (UTM-tagged links only)
- [ ] GBP linked to YouTube channel (DailyChess_12)

## ✅ Maintenance
- [ ] Insights checked weekly (search vs. direct, photo views, calls/clicks)
- [ ] Posts refreshed quarterly (re-run the calendar seed with shifted dates)
- [ ] Photos rotated monthly (3 new images per month)
- [ ] Description refreshed every 6 months

## Score targets
| Metric                          | Target            |
|---------------------------------|-------------------|
| GBP completeness                | 100%              |
| Profile views / month           | 5,000+ by month 3 |
| Website clicks / month from GBP | 1,000+ by month 3 |
| Stars                           | ≥4.7              |
| Reply rate                      | 100% within 24h   |
| Posts per week                  | 4                 |
