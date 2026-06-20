# Discord — Full Integration Guide (Phase 5)

What's shipped:

| Piece | Where | Status |
|---|---|---|
| Webhook posts (tournament events, titles) | `supabase/functions/discord-webhook-publish` | Live (Phase 4) |
| Account linking (Link Discord on profile) | `/connections` + `discord-oauth-callback` edge fn | Needs secrets |
| Auto role sync (Pawn → Grandmaster) | `discord-sync-roles` edge fn + cron | Needs secrets |
| Slash-command bot (`!play`, `!stats`, `!rank`, `!tournament`, `!join`, `!challenge`, `!daily`) | `bot/discord-bot/` | Needs hosting |
| Real-time match results to `#results` | webhook publisher (Phase 4) — extend with game-finish trigger | Live |

## Required secrets (add via Lovable Secrets)

| Secret | Purpose |
|---|---|
| `DISCORD_WEBHOOK_URL` | Webhook for tournament/event posts |
| `DISCORD_TOURNAMENTS_WEBHOOK_URL` (optional) | Separate channel for tournaments |
| `DISCORD_CLIENT_ID` | OAuth app client id (also expose as `VITE_DISCORD_CLIENT_ID` in `.env`) |
| `DISCORD_CLIENT_SECRET` | OAuth app secret |
| `DISCORD_BOT_TOKEN` | Bot token (for role sync REST calls) |
| `DISCORD_GUILD_ID` | Your server ID |
| `DISCORD_ROLE_PAWN` … `DISCORD_ROLE_GRANDMASTER` | 7 role IDs |

## Step 1 — Create the Discord application
1. https://discord.com/developers/applications → New Application → "MasterChess"
2. **OAuth2 → Redirects**: add `https://masterchess.live/connections`
3. Copy **Client ID** → add as Lovable secret `DISCORD_CLIENT_ID`
4. Click **Reset Secret** → add as `DISCORD_CLIENT_SECRET`
5. **Bot** tab → Reset Token → add as `DISCORD_BOT_TOKEN`. Enable **MESSAGE CONTENT INTENT**.

## Step 2 — Make the linking visible on the frontend
Expose the client id to the frontend by adding to `.env`:
```
VITE_DISCORD_CLIENT_ID=<your client id>
```
Restart preview. The Link Discord button on `/connections` will work.

## Step 3 — Create roles
In your server: Server Settings → Roles → New Role for each tier (Pawn, Knight, Bishop, Rook, Queen, King, Grandmaster). Right-click each → Copy ID. Add each as `DISCORD_ROLE_<TIER>`.

Position the bot's role **above** all 7 tier roles so it can assign them.

## Step 4 — Invite the bot
OAuth2 → URL Generator → scopes `bot`, `applications.commands`; perms `Manage Roles`, `Send Messages`, `Embed Links`. Open the URL, choose your server.

## Step 5 — Schedule the role sync
Run from the SQL editor (the role sync is idempotent; runs every 15 min):

```sql
select cron.schedule(
  'discord-sync-roles-every-15-min',
  '*/15 * * * *',
  $$ select net.http_post(
    url:='https://kicabdwgdyabibioycbq.functions.supabase.co/discord-sync-roles',
    headers:='{"Content-Type":"application/json","apikey":"<ANON KEY>"}'::jsonb,
    body:='{}'::jsonb
  ); $$
);
```

## Step 6 — Deploy the bot
See `bot/discord-bot/README.md`. Bot is needed for `!play`, `!stats`, `!rank`, `!tournament`, `!join`, `!challenge` commands.

## Verifying

- `/connections` shows your Discord avatar after linking
- Run `select discord_user_id from profiles where user_id = auth.uid()` — should be set
- Trigger sync manually:
  ```js
  await supabase.functions.invoke("discord-sync-roles", { body: {} })
  ```
- Your Discord member card should now show the right tier role.
