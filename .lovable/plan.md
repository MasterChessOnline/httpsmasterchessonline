# Homepage cleanup & reorder

## 1. Remove donation from hero
- Delete `<HeroDonationCard />` (and its import) from `src/pages/Index.tsx` — it sits under the title and feels heavy/awkward.
- Keep `SupporterCTA` further down so donations are still discoverable, just not in your face.

## 2. Bring back Spin the Wheel
- `HomeSpinWheelSection` is imported in `Index.tsx` but never rendered. Mount it inside the main content area, near the bottom (right above Share / Supporter CTA), wrapped in `<React.Suspense>` + `LazyMount` to stay performant.

## 3. New homepage order (top → bottom)
Hero → Logo + tagline → Play Online / vs Bots CTAs → Install app → Human note → Nikola challenge → Live status

Main content:
1. Daily Challenge (puzzle + missions)
2. Daily King banner
3. Quick Match (time controls + secondary modes)
4. Your Performance (if logged in)
5. Recent Games (if logged in)
6. Leaderboard
7. **Spin the Wheel** ← reintroduced here
8. Between matches (training shortcuts) — moved down so it doesn't break the play flow
9. Share MasterChess card
10. Supporter CTA
11. FAQ

Rationale: hero stays focused on PLAY (no donation noise). Daily ritual → quick play → personal stats → social proof → reward loop (spin) → learn → share/support → FAQ.

## Files touched
- `src/pages/Index.tsx` — remove import + render of `HeroDonationCard`, add `<HomeSpinWheelSection />` in new position, move the "Between matches" `<section>` below Leaderboard.

No backend, no styling system, no other pages affected.
