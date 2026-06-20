# GBP Verification — Why other accounts see "no results"

If you searched **"MasterChess"** on Google Maps from a different Google
account and saw nothing, that's expected. **Unverified Business Profiles
are visible only to the owner account that created them.** Other users
see them only after Google approves verification.

## Timeline

| Step                         | Typical time      |
|------------------------------|-------------------|
| Submit verification          | Day 0             |
| Video review by Google       | 3–5 business days |
| First-pass approval          | Day 5–7           |
| Rejection → resubmit         | +5–7 days         |
| Listing public on Maps       | Day 7–14          |

## Fastest path (video verification)

Google now prefers video over postcards for digital-only businesses.

### Shot list (60 seconds, one continuous take, no edits)

1. **0:00–0:05** — Show your phone's lock screen → unlock → open browser.
2. **0:05–0:15** — Type `masterchess.live` in the URL bar. Show it loads.
3. **0:15–0:30** — Scroll the homepage so logo + tournaments + leaderboard are visible.
4. **0:30–0:45** — Sign in. Open `/admin` or `/dashboard` to prove you own it.
5. **0:45–0:55** — Open `/contact` page showing `contact@masterchess.live`.
6. **0:55–1:00** — Show your face (optional — boosts trust).

**Don't** edit, don't cut, don't add music. Single continuous clip.

## If Google rejects

Common reasons + fixes:

| Rejection reason                  | Fix                                                                       |
|-----------------------------------|---------------------------------------------------------------------------|
| "Couldn't confirm ownership"      | Reshoot showing the URL bar `masterchess.live` AND an admin page logged in |
| "Business not eligible"           | Confirm category = "Software company", not "Game store"                   |
| "Conflicts with existing listing" | Reply to support — you are the canonical `masterchess.live`               |
| "Insufficient evidence"           | Add `/about` page in the video showing founder name + photo               |

## After approval

1. Get your **Place ID** at https://developers.google.com/maps/documentation/places/web-service/place-id (search "MasterChess").
2. Set the env var `VITE_GOOGLE_REVIEW_URL` to:
   `https://search.google.com/local/writereview?placeid={YOUR_PLACE_ID}`
3. Every review button in the app updates automatically (Footer, `/rate-masterchess`, `/reviews` hero).
4. Paste the URLs from `docs/GBP_OFFICIAL_LINKS.md` into the dashboard.
5. Schedule weekly posts (already seeded — see `docs/GBP_WEEKLY_POSTS_CALENDAR.md`).

## Verify it worked

Open Google Maps in an **incognito window** and search "MasterChess".
You should see:

- ✅ Logo (crown)
- ✅ Website button → `masterchess.live`
- ✅ "Write a review" button live
- ✅ At least 3 photos
- ✅ Description in English

If any of these are missing — Google indexing is still catching up.
Wait 48h and recheck before opening a support ticket.
