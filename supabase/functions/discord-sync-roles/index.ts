// Assigns Discord roles to linked MasterChess users based on their rank/wins.
// Cron-friendly. Requires: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID,
// DISCORD_ROLE_PAWN, _KNIGHT, _BISHOP, _ROOK, _QUEEN, _KING, _GRANDMASTER.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIER_KEYS = ["PAWN","KNIGHT","BISHOP","ROOK","QUEEN","KING","GRANDMASTER"] as const;
type Tier = typeof TIER_KEYS[number];

function pickTier(p: { rating: number | null; games_won: number | null; rank?: number; total?: number; isSeasonWinner?: boolean; hasTournament?: boolean }): Tier {
  if (p.isSeasonWinner) return "GRANDMASTER";
  if (p.total && p.rank && p.rank <= Math.max(1, Math.floor(p.total * 0.01))) return "KING";
  if (p.total && p.rank && p.rank <= Math.max(1, Math.floor(p.total * 0.10))) return "QUEEN";
  if (p.hasTournament) return "ROOK";
  if ((p.games_won ?? 0) >= 20) return "BISHOP";
  if ((p.games_won ?? 0) >= 5) return "KNIGHT";
  return "PAWN";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const token = Deno.env.get("DISCORD_BOT_TOKEN");
    const guild = Deno.env.get("DISCORD_GUILD_ID");
    if (!token || !guild) {
      return new Response(JSON.stringify({ error: "Discord bot not configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const roleIds: Record<Tier, string | undefined> = Object.fromEntries(
      TIER_KEYS.map(k => [k, Deno.env.get(`DISCORD_ROLE_${k}`)])
    ) as Record<Tier, string | undefined>;
    const allRoleIds = TIER_KEYS.map(k => roleIds[k]).filter(Boolean) as string[];

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: linked } = await admin.from("profiles")
      .select("user_id, discord_user_id, rating, games_won")
      .not("discord_user_id", "is", null)
      .limit(500);

    const { count: total } = await admin.from("profiles").select("id", { count: "exact", head: true }).gt("rating", 0);

    const { data: seasonWinners } = await admin.from("season_results")
      .select("user_id").eq("rank", 1).limit(1000);
    const winnerSet = new Set((seasonWinners ?? []).map((r: any) => r.user_id));

    const { data: tournRegs } = await admin.from("tournament_registrations")
      .select("user_id").limit(5000);
    const tournSet = new Set((tournRegs ?? []).map((r: any) => r.user_id));

    const results: any[] = [];
    for (const p of linked ?? []) {
      const { count: rank } = await admin.from("profiles")
        .select("id", { count: "exact", head: true }).gt("rating", p.rating ?? 0);
      const tier = pickTier({
        rating: p.rating, games_won: p.games_won,
        rank: (rank ?? 0) + 1, total: total ?? undefined,
        isSeasonWinner: winnerSet.has(p.user_id),
        hasTournament: tournSet.has(p.user_id),
      });
      const targetRole = roleIds[tier];
      if (!targetRole) { results.push({ user: p.discord_user_id, tier, skipped: "role_id_missing" }); continue; }

      // Strip other tier roles, add target. Use Discord REST.
      const base = `https://discord.com/api/v10/guilds/${guild}/members/${p.discord_user_id}`;
      try {
        // Add target role
        await fetch(`${base}/roles/${targetRole}`, { method: "PUT", headers: { Authorization: `Bot ${token}` } });
        // Remove other tier roles
        for (const other of allRoleIds) {
          if (other !== targetRole) {
            await fetch(`${base}/roles/${other}`, { method: "DELETE", headers: { Authorization: `Bot ${token}` } });
          }
        }
        results.push({ user: p.discord_user_id, tier });
      } catch (e) {
        results.push({ user: p.discord_user_id, tier, error: String(e) });
      }
    }

    return new Response(JSON.stringify({ ok: true, synced: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
