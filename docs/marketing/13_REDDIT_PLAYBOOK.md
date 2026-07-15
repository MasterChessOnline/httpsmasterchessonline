# Reddit Growth Playbook — MasterChess.live

**Golden rule:** comment for 2 weeks before posting anywhere. Reddit smells self-promo instantly.

## Target subs (ranked by fit)

| Sub | Subs | Best day/time (UTC) | Angle |
|---|---|---|---|
| r/chess | 500k | Sun 15:00 | "I built a free chess site, no paywalls" |
| r/chessbeginners | 250k | Sat 14:00 | Free puzzles + bot ladder |
| r/AnarchyChess | 900k | any, meme format | Meme + link in comments |
| r/ChessPuzzles | 40k | Tue 18:00 | Daily puzzle links |
| r/SideProject | 200k | Mon 13:00 | Show-off |
| r/InternetIsBeautiful | 17M | Sun 16:00 | "Free chess with no ads" |
| r/webdev | 2M | Wed 14:00 | Show HN-style tech write-up |
| r/coolgithubprojects | 60k | Tue 15:00 | If OSS parts |
| r/chesscomrefugees (search "chesscom") | – | anytime | Comment-only, mention when relevant |
| r/serbia, r/croatia, r/bosnia, r/balkans | 100k+ | Sat 12:00 | Serbian-language post |
| r/learnprogramming | 4M | Wed 13:00 | "How I built X" |
| r/Games | 3M | Sat 17:00 | Only for a major update |
| r/Frugal | 2M | Sun 14:00 | "Free chess.com alternative" |
| r/PleX / r/selfhosted | – | – | Only if self-host option exists |
| r/chessvariants | 15k | Sun | If you add variants |

## Post templates

### Show-off (r/SideProject, r/webdev)
```
Title: I built MasterChess.live — free chess with no paywalls, no ads
Body:
Hey folks — spent 6 months building this because I got tired of paywalls on
the big chess sites. Everything is free forever: bots (9 personalities),
1500+ puzzles, live tournaments, opening explorer, game analysis.

Stack: React + Vite, Stockfish WASM, Supabase Realtime for multiplayer.

Would love feedback — link in comments to keep mods happy.

First comment: https://masterchess.live?utm_source=reddit&utm_medium=post&utm_campaign=sideproject
```

### AMA (r/chess, after 100+ users)
```
Title: I built a free chess platform solo. AMA about the tech, the UI decisions, or the "why free"
```

### Puzzle-of-the-day comment strategy
- Take the day's puzzle from `/puzzles`
- Post as image in r/ChessPuzzles + r/chessbeginners
- Solution link → `/puzzles?d=YYYY-MM-DD` with UTM

## Cadence (safe)
- Max 1 self-promo post per sub per **month**
- 10 helpful comments : 1 self-promo comment (the 10:1 rule)
- Never post the same title in >2 subs on the same day

## Mod DM template
```
Hi mods — I run masterchess.live, a free chess site. I'd like to post a
[show-off / AMA / puzzle series]. Happy to follow any promo rules you have,
or skip if not a fit. Thanks for keeping the sub good.
```

## In-app hook (implemented)
Every game-review + puzzle-solved screen should have a "Share to Reddit"
button that opens:
`https://reddit.com/submit?url=<perma>&title=<pre-filled>` with UTM tags.
