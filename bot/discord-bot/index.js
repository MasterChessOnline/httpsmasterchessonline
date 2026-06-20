// MasterChess Discord bot — deploy to Railway or Fly.io.
// Env: DISCORD_BOT_TOKEN, MASTERCHESS_API_BASE=https://masterchess.live,
//      MASTERCHESS_PROJECT_REF=kicabdwgdyabibioycbq, MASTERCHESS_ANON_KEY=<anon>
import { Client, GatewayIntentBits, Events, EmbedBuilder } from "discord.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const SITE = process.env.MASTERCHESS_API_BASE ?? "https://masterchess.live";
const PROJECT = process.env.MASTERCHESS_PROJECT_REF;
const ANON = process.env.MASTERCHESS_ANON_KEY;
const FN = (name) => `https://${PROJECT}.functions.supabase.co/${name}`;
const HEADERS = { Authorization: `Bearer ${ANON}`, apikey: ANON };

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once(Events.ClientReady, (c) => console.log(`MasterChess bot ready as ${c.user.tag}`));

client.on(Events.MessageCreate, async (msg) => {
  if (msg.author.bot) return;
  const [cmd, ...rest] = msg.content.trim().split(/\s+/);
  const arg = rest[0]?.replace(/^@/, "");
  try {
    if (cmd === "!play") return msg.reply(`♟️ Quick match: ${SITE}/play/online`);
    if (cmd === "!daily") return msg.reply(`🧩 Daily puzzle: ${SITE}/puzzles`);
    if (cmd === "!challenge" && arg) return msg.reply(`⚔️ ${SITE}/challenge?vs=${encodeURIComponent(arg)}`);

    if (cmd === "!stats" && arg) {
      const r = await fetch(`${FN("public-stats")}?username=${encodeURIComponent(arg)}`, { headers: HEADERS });
      if (!r.ok) return msg.reply(`❓ Player not found: ${arg}`);
      const j = await r.json();
      return msg.reply({ embeds: [new EmbedBuilder().setTitle(`📊 ${j.username}`).setColor(0xd4af37)
        .addFields(
          { name: "Rating", value: `${j.rating}`, inline: true },
          { name: "Record", value: `${j.wins}W / ${j.losses}L / ${j.draws}D`, inline: true },
          { name: "Games", value: `${j.games}`, inline: true },
        ).setURL(`${SITE}/u/${j.username}`)] });
    }

    if (cmd === "!rank" && arg) {
      const r = await fetch(`${FN("public-rank")}?username=${encodeURIComponent(arg)}`, { headers: HEADERS });
      if (!r.ok) return msg.reply(`❓ Player not found: ${arg}`);
      const j = await r.json();
      return msg.reply(`🏅 **${j.username}** — #${j.rank} on the global ladder (${j.rating})`);
    }

    if (cmd === "!tournament" || cmd === "!tournaments") {
      const r = await fetch(FN("active-tournaments"), { headers: HEADERS });
      const j = await r.json();
      const list = (j.tournaments || []).slice(0, 5).map(t => `• **${t.name}** — ${t.format ?? t.tournament_type} • ${t.time_control}\n  ${SITE}/tournaments/${t.id}`).join("\n");
      return msg.reply(list || "No active tournaments. Try later!");
    }

    if (cmd === "!join") return msg.reply(`👉 Pick one: ${SITE}/tournaments`);

    if (cmd === "!help") {
      return msg.reply("**MasterChess bot**\n`!play` quick match · `!stats @user` · `!rank @user` · `!tournament` · `!join` · `!challenge @user` · `!daily`");
    }
  } catch (e) { console.error(e); }
});

client.login(TOKEN);
