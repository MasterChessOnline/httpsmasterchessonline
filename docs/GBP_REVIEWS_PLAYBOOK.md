# MasterChess — Google Business Profile Reviews Playbook

> Reviews drive the GBP knowledge-panel star rating, increase click-through from Google Search, and signal trust to first-time visitors. This playbook is a turnkey system to get them and reply to them.

---

## 1. The direct review link

After verification, find your Place ID at: https://developers.google.com/maps/documentation/places/web-service/place-id

Then construct your review URL:

```
https://search.google.com/local/writereview?placeid={YOUR_PLACE_ID}
```

Save it as a single env var or constant (`VITE_GOOGLE_REVIEW_URL`) and use it everywhere below.

---

## 2. Where the review link lives in the app

| Surface                          | Trigger                                          | Component                       |
|----------------------------------|--------------------------------------------------|---------------------------------|
| `/rate` page — "Rate on Google"  | Always visible for logged-in users with ≥5 games | `RateMasterChess.tsx`           |
| Footer — small star link         | Always visible                                   | `Footer.tsx`                    |
| Post-tournament winner modal     | Tournament finished, user placed top 3           | `TournamentResultsModal.tsx`    |
| 7-day-active push notification   | User opened app on 7 distinct days               | `push-triggers` edge function   |
| Welcome email (after 1st win)    | Triggered by first ranked win                    | `send-welcome-email` edge fn    |

---

## 3. Targets (first 90 days)

| Milestone         | Target | Why                                         |
|-------------------|--------|---------------------------------------------|
| Week 1            | 10     | Critical mass — unlocks star display        |
| Month 1           | 50     | Beats 90% of competitors                    |
| Month 3           | 150    | Top-tier knowledge panel ranking            |
| Reply SLA         | 24h    | Google factors response speed into ranking  |
| Average rating    | ≥4.7   | 4.7+ is the "trust threshold"               |

---

## 4. Reply templates

Copy → paste → personalize the bracketed parts.

### Positive ⭐⭐⭐⭐⭐
> Thank you, {name}! 🙏 We built MasterChess for players exactly like you — real games, no ads, no noise. See you on the board.

### Positive — mentions specific feature
> Glad you're loving the {feature}, {name}! It's one of our favorites too. If you have ideas to make it even better, drop them in /community.

### Neutral ⭐⭐⭐
> Thanks for the honest review, {name}. Mind sharing what would push it to 5 stars? Reply here or email contact@masterchess.live — we ship updates weekly.

### Negative ⭐⭐
> Sorry we let you down, {name}. We'd love a second chance. Can you email contact@masterchess.live with what went wrong? Every report goes straight to the founder.

### Negative ⭐ (specific complaint)
> That shouldn't have happened, {name}. We've logged it and our team is on it. Could you email contact@masterchess.live with your username so we can make it right?

### Negative ⭐ (troll / spam)
> We don't have a record of an account matching this review. If you're a real user, please email contact@masterchess.live and we'll resolve any issue directly. — MasterChess team

### Bug report
> Thanks for flagging this, {name} — fix going out in the next deploy. Track the changelog at masterchess.live/about.

### Feature request
> Great idea, {name}! Added to the public roadmap. Vote for it (and suggest more) at masterchess.live/community.

### Rating only (no text), positive
> Thanks for the stars, {name}! 🏆

### Rating only (no text), negative
> Sorry to see only {N} stars, {name}. We'd love to understand what's missing — email contact@masterchess.live and we'll dig in.

### Serbian (RS audience)
> Hvala ti, {name}! Drago nam je što uživaš. Vidimo se na tabli. ♟️

---

## 5. Avoid these mistakes

- ❌ Generic copy-paste replies — Google detects and demotes them
- ❌ Asking for reviews via incentives (coins, XP) — violates Google policy
- ❌ Buying reviews — bannable offense
- ❌ Replying with emoji only — counts as no reply
- ❌ Flagging reviews you simply disagree with — only flag policy violations

---

## 6. Weekly review ritual (every Monday, 10min)

1. Open business.google.com → Reviews
2. Reply to every new review (use templates above)
3. Flag any policy violations
4. Add 2-star and 3-star feedback to the product backlog
5. Update the 90-day review-count dashboard in `/admin`

---

## 7. Funnel diagram

```text
Player wins game ─► Toast: "Loved it? ⭐ Rate us on Google"
                                  │
                                  ▼
                        VITE_GOOGLE_REVIEW_URL
                                  │
                                  ▼
                Google review form (signed-in Google user)
                                  │
                                  ▼
                  Review appears in knowledge panel
                                  │
                                  ▼
                   Owner replies within 24h (templates)
```
