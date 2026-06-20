# MasterChess Discord Integration — Setup Guide

Two layers:

1. **Webhook (already shipped, no host needed)** — MasterChess posts tournament
   events (start, finish, weekly champion, title awards) into your Discord
   channel via the `discord-webhook-publish` edge function.
2. **Bot with `!commands` (requires a host)** — runs a small Node.js process you
   deploy on Railway, Fly.io, or any always-on host. The bot calls public
   MasterChess endpoints to answer `!stats`, `!rank`, `!join`, `!challenge`.

---

## Part 1 — Webhook (5 minutes, no code)

1. In your Discord server: **Server Settings → Integrations → Webhooks → New
   Webhook**.
2. Pick the channel (e.g. `#tournaments`), give it a name (`MasterChess Bot`),
   upload `masterchess.live/og-image.jpg` as avatar, click **Copy Webhook URL**.
3. Add the URL as a Lovable Cloud secret:
   - Secret name: `DISCORD_WEBHOOK_URL`
   - (Optional) Add a second one `DISCORD_TOURNAMENTS_WEBHOOK_URL` for a
     dedicated tournaments channel.
4. Done. The `discord-webhook-publish` edge function will now post embeds when
   triggered from `manage-tournament` or `award-tournament-titles`.

### Test from the browser console (signed-in admin)

```js
await supabase.functions.invoke("discord-webhook-publish", {
  body: {
    event: "custom",
    title: "✅ Discord integration is live",
    description: "Hello from MasterChess",
    color: 0xd4af37,
  },
});
```

### What gets posted automatically

- `tournament_starting` — 5 min before start (cron)
- `tournament_started` — when first round generates
- `tournament_finished` — when standings finalize
- `title_awarded` — when a champion or 1-of-1 badge changes hands
- `weekly_champion` — every Monday 00:00 UTC

---

## Part 2 — Slash-command bot (`!join`, `!stats`, `!rank`, `!challenge`)

The bot is a separate Node process. You can fork the starter template below
and deploy it to Railway in 10 minutes.

### Steps

1. Go to <https://discord.com/developers/applications> → **New Application** →
   name it `MasterChess`.
2. Under **Bot** → **Reset Token** → copy it (you'll save as `DISCORD_BOT_TOKEN`).
3. Under **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`
   - Open the generated URL and invite the bot to your server.
4. Get the bot host:
   - **Railway** (easiest): create new project → deploy from GitHub →
     environment variables: `DISCORD_BOT_TOKEN`, `MASTERCHESS_API_BASE=https://masterchess.live`.
   - **Fly.io** alternative: `fly launch` from the bot folder.
5. Use the starter at `bot/discord-bot/index.js` (template below).

### Bot starter (`bot/discord-bot/index.js`)

```js
import { Client, GatewayIntentBits, Events } from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const API = process.env.MASTERCHESS_API_BASE ?? "https://masterchess.live";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once(Events.ClientReady, (c) => console.log(`Logged in as ${c.user.tag}`));

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  const [cmd, arg] = msg.content.split(/\s+/);
  try {
    if (cmd === "!join") {
      return msg.reply(`👉 Open ${API}/tournaments and click Join.`);
    }
    if (cmd === "!stats" && arg) {
      const r = await fetch(`${API}/api/public/stats/${encodeURIComponent(arg)}`);
      const j = await r.json();
      return msg.reply(`📊 @${arg} — rating ${j.rating}, ${j.wins}W/${j.losses}L`);
    }
    if (cmd === "!rank" && arg) {
      const r = await fetch(`${API}/api/public/rank/${encodeURIComponent(arg)}`);
      const j = await r.json();
      return msg.reply(`🏅 @${arg} is #${j.rank} on the global ladder`);
    }
    if (cmd === "!challenge" && arg) {
      return msg.reply(`⚔️ ${API}/challenge?vs=${encodeURIComponent(arg)}`);
    }
    if (cmd === "!daily") {
      return msg.reply(`🧩 ${API}/daily-puzzle`);
    }
  } catch (e) {
    console.error(e);
  }
});

client.login(TOKEN);
```

`package.json`:

```json
{
  "name": "masterchess-discord-bot",
  "type": "module",
  "dependencies": { "discord.js": "^14.15.0" },
  "scripts": { "start": "node index.js" }
}
```

### Public API endpoints the bot calls

These are public read-only routes on MasterChess (cached, no auth):

- `GET /api/public/stats/:username` → `{ rating, wins, losses, draws }`
- `GET /api/public/rank/:username` → `{ rank }`

They wrap the existing `profiles` table with PostgREST + RLS public read
policies, so the bot needs no API key.

---

## Troubleshooting

- **Webhook returns 404** — channel deleted; create a new webhook URL.
- **Bot offline** — Railway dyno crashed; check logs, missing
  `DISCORD_BOT_TOKEN` is the usual cause.
- **Bot replies nothing** — under **Bot → Privileged Gateway Intents** enable
  `MESSAGE CONTENT INTENT`.
