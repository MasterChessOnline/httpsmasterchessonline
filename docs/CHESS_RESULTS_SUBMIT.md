# Chess-Results Serbia — Submission Guide (DB Chess Cup)

Goal: get the **Dragan Brakus Cup** officially listed on
[chess-results.com](https://chess-results.com/) under **Federation: Serbia (SRB)**
as **"DB Chess Cup"** (short form — chess-results.com truncates long names in
the federation list, so the short form is what we register).


---

## 1. Pre-tournament (T-7 days)

1. Open the lobby page `/dragan-brakus`.
2. Download the announcement TRF (header only):
   ```
   /functions/v1/tournament-export?tournament_id=<id>&format=announcement-trf
   ```
3. Download the Swiss-Manager seed file:
   ```
   /functions/v1/tournament-export?tournament_id=<id>&format=swiss-manager-tur
   ```
4. Email both files to **Chess-Results Serbia** desk:
   - To: `office@chess-results.com`
   - CC: Serbian arbiter contact (Šahovski savez Srbije)
   - Subject: `Tournament announcement — DB Chess Cup (Dragan Brakus Cup) — 30 June 2026`
   - Body: copy from `docs/CHESS_RESULTS_EMAIL.md` (template below).
5. Wait for the assigned `tnr` number. Store it in
   `tournaments.external_results_url`
   (e.g. `https://chess-results.com/tnr1234567.aspx`).

## 2. During the tournament

- Round N closes → pairings auto-saved in `tournament_pairings`.
- After every round, re-export and **re-upload** the TRF:
  ```
  /functions/v1/tournament-export?tournament_id=<id>&format=trf
  ```
- Chess-Results re-reads the file and updates standings + tiebreaks live.

## 3. Post-tournament (T+1h)

1. Final TRF upload (same URL).
2. PGN archive of all games:
   ```
   /functions/v1/tournament-export?tournament_id=<id>&format=pgn
   ```
3. Cross-table CSV for press / sponsors:
   ```
   /functions/v1/tournament-export?tournament_id=<id>&format=csv-crosstable
   ```
4. Standings CSV (with all tiebreaks):
   ```
   /functions/v1/tournament-export?tournament_id=<id>&format=csv-standings
   ```

## 4. Email template

> Subject: DB Chess Cup (Dragan Brakus Cup) — TRF16 announcement (RS, online, 30 Jun 2026)
>
> Dear Chess-Results team,
>
> Please find attached the TRF16 announcement and Swiss-Manager `.tur` seed
> for the *DB Chess Cup* (full name: Dragan Brakus Cup) — a 9-round Swiss online blitz (3+2) on
> MasterChess.live, scheduled for **30 June 2026, 17:00 CEST**.
>
> Organizer: MasterChess (Belgrade, Serbia) — Nikola Sakotić, founder.
> Chief arbiter: MasterChess Arbiter Team. Anti-cheat is run on the platform.
>
> Please assign a tournament number (`tnr…`) and reply with the public URL.
> We will upload updated TRF files after each round and the final TRF + PGN
> archive within one hour of the last round.
>
> Public landing page: https://masterchess.live/dragan-brakus
> Live standings: https://masterchess.live/dragan-brakus/live
> Press kit: https://masterchess.live/dragan-brakus/press
>
> Thank you,
> Nikola Sakotić — nikola@masterchess.live

## 5. Prizes disclosure (important for Chess-Results)

The Dragan Brakus Cup awards **MasterChess loot only** — Master Coins,
exclusive badges, and cosmetic items. There are **no cash prizes**. This is
mentioned explicitly in the announcement so Chess-Results categorises it
correctly under "online / community / no-prize-fund" events.
