# Plan: 5 Viral Growth Features for MasterChess

## Current State

MasterChess already has a strong foundation: Spin Wheel, Daily Rewards, Chests, Missions, XP/Levels, Shop, Referrals, Share Cards, Tournaments, Stream Hub, Team Battles, Arena, Bot personalities, Opening Trainer, and mobile PWA. These features create a solid core, but to "explode" and attract mass audience, we need **social bonds, competitive spectacle, and FOMO-driven habit loops** that Chess.com and Lichess do not have.

## Proposed Features (Ranked by Impact)

### 1. Clan / Guild System — Social Retention Engine
**Impact: Highest — this is what keeps people in mobile games for years.**

- Players create or join clans (max 50 members) with custom name, tag, and badge color
- Clan chat (realtime via Supabase), clan leaderboard, clan tag shown before username in games
- **Clan Wars**: Weekly auto-scheduled 5v5 or 10v10 team matches. Winning clan gets massive coin reward + exclusive clan border
- **Clan Quests**: Shared daily missions (e.g., "Win 50 games as a clan today") with group rewards
- **Why it explodes**: Friends drag friends in. Leaving = abandoning your team. Social pressure > any game mechanic.

### 2. Chess Battle Royale (Survival Mode) — Spectacle + Addiction
**Impact: Viral content goldmine. Short, high-stakes, shareable.**

- 8 players enter a bracket. 1-minute Blitz games. Loser eliminated each round.
- Winner takes 500-1000 coins. Match takes 5-7 minutes total.
- **Spectator mode**: Non-players watch live, bet coins on who wins, send emoji reactions
- **Auto-generated highlight reel**: After each Battle Royale, a 10-second clip of the final checkmate is generated for sharing
- **Why it explodes**: YouTube/TikTok clips of "I won a Chess Battle Royale" drive massive organic traffic. Stakes make every game feel important.

### 3. Season Battle Pass — Monetization + Urgency Loop
**Impact: Revenue + retention. Fortnite made billions with this.**

- 30-day "Seasons" with a free track and Premium track ($4.99)
- Players earn "Battle Points" from playing games, winning, completing missions
- **Premium rewards**: Exclusive animated piece sets, golden board themes, legendary titles, profile frames, emotes
- **Free rewards**: Coins, chests, XP boosts, basic cosmetics
- **Countdown timer everywhere**: "Season 3 ends in 2 days 14 hours" creates FOMO
- **Why it explodes**: Players who buy the pass play 3x more to "get their money's worth." Season resets create fresh-start energy.

### 4. Smart Push Notification Engine — Re-engagement Loop
**Impact: Brings dead users back. Converts "maybe tomorrow" into "one game now."**

- **Rival Alerts**: "Alex just overtook you on the leaderboard — reclaim your spot!"
- **Time-Limited Events**: "Boss Battle starts in 15 min. Beat the 7-win streak champion for 2x coins."
- **Clan Pressure**: "Your clan needs 3 more wins for today's quest. You're the top player — don't let them down."
- **Daily Reward FOMO**: "Your daily reward expires in 1 hour. Don't break your 12-day streak!"
- **Why it explodes**: Push notifications have 40%+ open rates when personalized. This turns casual visitors into daily players.

### 5. Voice Chat in Games — The "Real Club" Differentiator
**Impact: Massive differentiation. No major chess platform does this well.**

- Optional voice chat toggle per game (both players must agree)
- Post-game lobby voice for analysis/gloating
- Voice reactions ("Nice move!", "Ouch!", laugh) as quick audio clips
- **Streamer mode**: Streamers can voice-chat with viewers during spectated games
- **Why it explodes**: Chess is traditionally silent online. Voice makes it memorable, emotional, and social. Players will tell friends "You have to try this chess app with voice chat."

## Implementation Order (Recommended)

| Phase | Feature | Est. Complexity | Why First |
|---|---|---|---|
| 1 | Clan System | High | Highest retention impact; all other features enhance it |
| 2 | Smart Push Notifications | Medium | Cheap to build, immediate daily active user boost |
| 3 | Season Battle Pass | Medium | Monetization; pairs perfectly with clans + missions |
| 4 | Battle Royale | High | Viral content engine; needs clan system as player pool |
| 5 | Voice Chat | High | Differentiator; best done after player base grows |

## What About the Existing "No Puzzles" Constraint?

All 5 features respect this:
- No static tactics or puzzle solving
- All competitive modes use real games against real humans
- Battle Royale = real Blitz games, not puzzles
- Voice chat enhances human-to-human play, the core promise

## Next Step

Tell me which feature(s) to build first. I recommend starting with **Clan System** (biggest retention) + **Smart Push Notifications** (fastest ROI) in parallel.