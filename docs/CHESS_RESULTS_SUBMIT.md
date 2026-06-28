# Chess-Results Serbia — Submission Workflow

The MasterChess `/dragan-brakus` page now generates a complete submission pack
for Chess-Results Serbia. Tournament will be listed under the short name
**"DB Chess Cup"** (SRB federation) — the full name "Dragan Brakus Cup" stays
in the email body and TRF header.

> Status (as of last check): **NOT YET LISTED** on chess-results.com.
> Chess-Results does not accept automatic API submissions — an organizer or
> arbiter must email the desk. Follow the 4 steps below.

---

## 4-step submission (≈ 5 minutes)

Open https://masterchess.live/dragan-brakus and scroll to the
**Chess-Results Serbia** section. You will see four buttons:

1. **Download `announcement.trf`** — pre-tournament TRF16 header
2. **Download `.tur`** — Swiss-Manager native seed file (preferred by CR desk)
3. **Download email body** — pre-filled English email body
4. **Open mail client** — opens your default email app with subject/body filled

### Manual workflow

```
To:      chess-results@swiss-manager.at
Subject: Tournament announcement — DB Chess Cup (SRB)
Attach:  DB_Chess_Cup-announcement.trf
         DB_Chess_Cup.tur
Body:    (paste contents of submission-email.txt)
```

Hit send. The Chess-Results desk usually publishes the event within 24–48 hours
and replies with the public URL (format: `https://chess-results.com/tnr######.aspx`).

### After publication

1. Copy the returned URL.
2. Run in the Lovable admin SQL editor:

```sql
UPDATE tournaments
SET external_results_url = 'https://chess-results.com/tnrXXXXXX.aspx',
    chess_results_status = 'listed',
    chess_results_submitted_at = now()
WHERE name ILIKE '%Brakus%';
```

The landing page badge will flip from "Pending submission" to "Listed" and the
"Open on Chess-Results" CTA will appear automatically.

---

## Required tournament fields (already filled)

| Field          | Value                                          |
|----------------|------------------------------------------------|
| Short name     | DB Chess Cup                                   |
| Full name      | Dragan Brakus Cup                              |
| Federation     | SRB                                            |
| City / Venue   | Belgrade — Online (masterchess.live)           |
| Start          | 2026-06-30 17:00 CEST                          |
| Format         | 9-round Swiss Blitz                            |
| Time control   | 3+2 (Blitz)                                    |
| Rating type    | Unrated / Friendly (no FIDE rating change)     |
| Chief Arbiter  | Nikola Sakotic (MasterChess Arbiter Team)      |
| Organizer      | MasterChess.live                               |
| Email          | nikola@masterchess.live                        |

To upgrade to **FIDE-rated** later: register the event with FIDE Calendar (via
Šahovski Savez Srbije) at least 14 days before, attach a licensed FIDE arbiter,
and add their FIDE ID to `tournaments.chief_arbiter`.

---

## Tie-breaks declared on Chess-Results

1. Buchholz Cut 1
2. Buchholz Total
3. Sonneborn-Berger
4. Progressive Score
5. Performance Rating
6. Direct Encounter
7. Wins

All are computed live by the `recalc_tournament_tiebreaks` SQL function and
included in the `csv-standings` export.

---

## Post-tournament uploads

After round 9 ends, download from the same page:

- `trf` — final TRF with all rounds and tie-breaks (upload to CR for final
  standings page)
- `pgn` — full game archive
- `csv-crosstable` — Swiss cross-table with colors and opponent numbers
- `csv-standings` — final ranking with all tie-breaks

Send the final TRF as a reply to the original CR thread; they will update the
existing event page rather than create a new one.
