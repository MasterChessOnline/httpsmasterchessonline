
# Make Google Maps show only masterchess.live + audit every review button

You asked for two things:

1. When someone searches **MasterChess on Google Maps**, the panel/web results should point **only to masterchess.live** — no other sites. Also: another Google account couldn't see the listing at all.
2. **Check every "Review" button** end-to-end so they all work.

---

## Why your other Google account sees nothing (read first)

This is **not a bug we can fix in code**. A Google Business Profile that hasn't passed verification is **only visible to the owner account** that created it. Other Google users see "no results" until Google approves the verification (postcard / video / phone).

What I'll do in code: make the path to verification as short as possible, plus a doc that spells out the manual steps you must do in business.google.com.

---

## Part 1 — Force every GBP surface to point to masterchess.live only

### A. Audit the 52 seeded weekly posts
Re-check every row in `gbp_posts` and rewrite any CTA URL so it is **always `https://masterchess.live/...?utm_source=gbp&utm_medium=post`** — no `lovable.app`, no `lovableproject.com`, no bare paths. Migration: `UPDATE gbp_posts SET cta_url = REPLACE(...)` for any stray domain, plus a CHECK constraint so future rows can't use a non-masterchess.live host.

### B. Lock the publisher edge function
`supabase/functions/publish-gbp-posts/index.ts` — before sending a post to GBP, reject any `cta_url` whose host isn't `masterchess.live`. Prevents accidents.

### C. JSON-LD + sitemap audit
- `index.html` `LocalBusiness` schema: confirm `url`, `logo`, `sameAs` all use `https://masterchess.live`.
- `public/sitemap.xml` + every sub-sitemap: confirm `<loc>` is `https://masterchess.live/...` only. Add a build-time guard in `scripts/generate-sitemap.ts` that throws if any URL isn't masterchess.live.

### D. Single "official link list" for GBP dashboard
New `docs/GBP_OFFICIAL_LINKS.md` — the only URLs you ever paste into the GBP dashboard fields:

```text
Website:          https://masterchess.live/?utm_source=gbp&utm_medium=website
Appointments:     https://masterchess.live/play?utm_source=gbp&utm_medium=appointment
Menu (Products):  https://masterchess.live/tournaments?utm_source=gbp
Reviews link:     https://search.google.com/local/writereview?placeid={PLACE_ID}
Social profiles:  (only masterchess.live + your real socials — nothing else)
```

### E. Verification fast-track doc
New `docs/GBP_VERIFICATION_FASTTRACK.md`:
- Why the listing is invisible to other accounts until verified.
- The exact 60-sec video script (already exists) + reshoot checklist.
- What to do if Google rejects (re-record showing `masterchess.live` URL bar + admin panel).
- Expected timeline (3–14 days).

---

## Part 2 — Audit every "Review" button in the app

I'll walk every surface and confirm the click → opens the Google review form. Where a button is missing, I add it.

| # | Surface | Current state | Fix |
|---|---|---|---|
| 1 | Footer "Review us on Google" | ✅ exists in `src/components/Footer.tsx` | verify env-var fallback, add `aria-label`, open in new tab with `rel="noopener"` |
| 2 | `/rate-masterchess` Google CTA card | ✅ exists in `src/pages/RateMasterChess.tsx` | confirm button works without sign-in, add small "Why?" tooltip |
| 3 | `/reviews` page hero | ❌ no Google CTA | add the same gold "Leave a Google review" button at the top |
| 4 | Post-game win toast | ❌ never asks | after ranked win #5, show toast: "Loved it? ⭐ Rate us on Google" — once per user (localStorage flag) |
| 5 | Tournament winner modal (`TournamentResultsModal.tsx`) | ❌ no CTA | add "Share the love — Google review" button for top-3 finishers |
| 6 | Profile menu (Navbar) | ❌ no entry | add "⭐ Review on Google" item below "Settings" |
| 7 | `/about` page | ❌ | add a small footer-style strip "Like MasterChess? Leave a Google review" |
| 8 | Achievements page | ❌ | when user unlocks "100 games" achievement, add Google-review nudge card |
| 9 | Settings → Help section | ❌ | add "Support us → Leave Google review" link |
| 10 | PWA install success | ❌ | after install, toast with Google-review link |

All buttons share **one constant** (`src/lib/google-review.ts`) so changing the Place ID later updates everywhere:

```ts
export const GOOGLE_REVIEW_URL =
  (import.meta.env.VITE_GOOGLE_REVIEW_URL as string | undefined) ??
  "https://www.google.com/maps/search/?api=1&query=MasterChess+masterchess.live";
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=MasterChess+masterchess.live";
```

Fallback now points to **Google Maps search** (not generic Google search) so even pre-verification, users land on Maps and can hit "Suggest an edit" → boosts your listing's signal.

### Tracking
Each button fires `track('gbp_review_click', { surface })` so you can see in `/admin/full-stats` which surfaces convert.

---

## Files touched

**Backend / config:**
- Migration: rewrite `gbp_posts.cta_url`, add CHECK constraint
- `supabase/functions/publish-gbp-posts/index.ts` — host guard
- `scripts/generate-sitemap.ts` — host guard

**Frontend:**
- `src/lib/google-review.ts` (new constant)
- `src/components/Footer.tsx` (use constant + a11y)
- `src/components/Navbar.tsx` (profile menu item)
- `src/pages/RateMasterChess.tsx` (use constant)
- `src/pages/Reviews.tsx` (hero CTA)
- `src/pages/About.tsx`, `src/pages/Achievements.tsx`, `src/pages/Settings.tsx` (small CTAs)
- `src/components/TournamentResultsModal.tsx` (winner CTA)
- Post-game toast hook (5th-win nudge)
- PWA install hook (post-install toast)

**Docs:**
- `docs/GBP_OFFICIAL_LINKS.md` (new)
- `docs/GBP_VERIFICATION_FASTTRACK.md` (new)
- `docs/GBP_MAX_CHECKLIST.md` (update with masterchess.live-only rule + 10-button table)

**Out of scope:** the actual Google verification (manual, your account) and obtaining the Place ID (set as `VITE_GOOGLE_REVIEW_URL` once you have it).
