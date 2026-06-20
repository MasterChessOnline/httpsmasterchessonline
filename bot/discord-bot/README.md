# MasterChess Discord Bot

## Deploy to Railway (fastest)
1. Push this folder to a GitHub repo.
2. Go to railway.app → New Project → Deploy from GitHub.
3. Set environment variables:
   - `DISCORD_BOT_TOKEN` — from discord.com/developers/applications → Bot → Reset Token
   - `MASTERCHESS_API_BASE=https://masterchess.live`
   - `MASTERCHESS_PROJECT_REF=kicabdwgdyabibioycbq`
   - `MASTERCHESS_ANON_KEY` — copy from the masterchess.live `.env` (`VITE_SUPABASE_PUBLISHABLE_KEY`)
4. Railway auto-deploys. Check logs for `MasterChess bot ready as ...`.

## Required Discord setup
- discord.com/developers/applications → New Application → name "MasterChess"
- Bot tab → enable **MESSAGE CONTENT INTENT**
- OAuth2 → URL Generator → scopes: `bot`, `applications.commands`; perms: Send Messages, Embed Links, Read Message History
- Open the generated URL and invite the bot to your server

## Commands
`!play` · `!stats <user>` · `!rank <user>` · `!tournament` · `!join` · `!challenge <user>` · `!daily` · `!help`
