# DB Chess Cup — Prize Structure (single source of truth)

This document is the canonical reference for prize categories and payouts in the
**Dragan Brakus Cup**. Marketing copy and the in-app prize ladder mirror these values.

All prizes are paid in **Master Coins** (MasterChess internal currency) + cosmetic
unlocks. No cash, no crypto, no real-money payouts.

---

## Overall (rank-based)

| Place | Coins  | Extras |
|-------|--------|--------|
| 1st   | 50,000 | 1-year MasterChess Pro · "DB-Cup Champion 2026" animated title (12 mo) · 1-on-1 founder lesson on /news · animated trophy on profile |
| 2nd   | 25,000 | Brakus Silver badge |
| 3rd   | 15,000 | Brakus Bronze badge |
| 4–10  | 2,000 each | Top-10 Brakus Knight badge |

## Special categories (parallel prizes — a player can win both overall and a special)

| Category         | Criterion                                                              | Prize |
|------------------|------------------------------------------------------------------------|-------|
| Brilliancy       | Best game, community vote after the event                              | 10,000 + homepage feature 7 days |
| Biggest Upset    | Largest rating-difference win (winner < loser by ≥150 Elo)             | 5,000 + Upset Hunter badge |
| Fighting Spirit  | Top-50 finisher with the fewest draws                                  | 5,000 + Warrior badge |
| Junior U16       | Highest-placed player born ≥ 2010                                       | 5,000 + Junior Cup badge |
| Veteran 50+      | Highest-placed player born ≤ 1976                                       | 5,000 + Veteran Crown badge |
| Country Cup      | Top-3 countries by sum-of-top-5 player scores                          | National team badge for every member of the country's top-5 |
| Ambassador       | Most confirmed tournament invites via `/tournament_invites`            | 10,000 + permanent "Brakus Ambassador" profile flair |
| Lucky Survivor   | Random pick from everyone who played all 9 rounds                      | 5,000 |
| Founder's First  | First 20 to register (one-off)                                          | "Founder's Knight" badge (lifetime) |
| Predictions Pot  | Users who staked on the eventual champion                              | Split the pot proportionally to stake |

## Total guaranteed pool

* Overall:   50k + 25k + 15k + 7 × 2k = **104,000 coins**
* Special:   10k + 5k + 5k + 5k + 5k + 10k + 5k = **45,000 coins** (+ country team badges)
* Predictions pot: variable (user-funded, 100% redistributed)

= **≥ 149,000 coins of guaranteed prizes per edition.**

---

## Data model

Prize rows live in `public.tournament_prizes` with the new `category` column:

* `'overall'`        — place_from / place_to drive the ladder
* `'brilliancy'`     — awarded post-event by admin via `AdminTournament`
* `'upset'`          — auto-computed from `tournament_pairings` + ratings
* `'fighting_spirit'`— auto-computed (fewest draws among top 50)
* `'junior'`         — needs `tournament_registrations.birth_year`
* `'veteran'`        — needs `tournament_registrations.birth_year`
* `'country'`        — uses `tournament_registrations.federation`
* `'ambassador'`     — uses `tournament_ambassador_v`
* `'special'` / `'lucky'` — admin-curated

Final laureates are written to `public.tournament_hall_of_fame` by the `tournament-engine`
on `finalize`. `/dragan-brakus/hall-of-fame` reads from there.
