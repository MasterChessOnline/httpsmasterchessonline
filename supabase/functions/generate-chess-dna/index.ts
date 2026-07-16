// Analyzes user's recent games and produces a shareable "Chess DNA" fingerprint via Lovable AI.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, regenerate = false } = await req.json();
    if (!userId || typeof userId !== "string") return json({ error: "userId required" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    if (!regenerate) {
      const { data: cached } = await supabase
        .from("chess_dna_snapshots")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (cached) {
        const ageHours = (Date.now() - new Date(cached.updated_at).getTime()) / 3600000;
        if (ageHours < 24) return json({ dna: cached, cached: true });
      }
    }

    // Pull recent games (last 40 combined)
    const { data: online } = await supabase
      .from("online_games")
      .select("id, white_player_id, black_player_id, result, opening_name, move_number, end_reason, pgn")
      .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(25);
    const { data: bots } = await supabase
      .from("bot_games")
      .select("id, user_color, result, bot_id, move_count")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15);

    const { data: prof } = await supabase
      .from("profiles")
      .select("username, elo, wins, losses, draws")
      .eq("id", userId)
      .maybeSingle();

    const total = (online?.length ?? 0) + (bots?.length ?? 0);
    if (total < 3) {
      return json({ error: "not_enough_games", games: total }, 400);
    }

    // Compute quick stats
    let whiteWins = 0, blackWins = 0, whiteGames = 0, blackGames = 0;
    const openings: Record<string, number> = {};
    let quickWins = 0, longGames = 0;
    for (const g of online ?? []) {
      const isWhite = g.white_player_id === userId;
      const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
      if (isWhite) { whiteGames++; if (won) whiteWins++; } else { blackGames++; if (won) blackWins++; }
      if (g.opening_name) openings[g.opening_name] = (openings[g.opening_name] || 0) + 1;
      if (g.move_number && g.move_number < 25 && won) quickWins++;
      if (g.move_number && g.move_number > 50) longGames++;
    }
    const topOpenings = Object.entries(openings).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([n,c])=>({name:n, count:c}));

    const summaryStats = {
      username: prof?.username ?? "Player",
      elo: prof?.elo ?? 1200,
      totalWins: prof?.wins ?? 0,
      totalLosses: prof?.losses ?? 0,
      whiteWinRate: whiteGames ? Math.round(whiteWins/whiteGames*100) : 0,
      blackWinRate: blackGames ? Math.round(blackWins/blackGames*100) : 0,
      recentGamesAnalyzed: total,
      quickWins,
      longGames,
      topOpenings,
    };

    const systemPrompt = `You are an elite chess coach analyzing a player's DNA / playing style. Output STRICT JSON only, no markdown. Schema:
{"style_label": string, "aggression_score": number(0-100), "defense_score": number(0-100), "tactics_score": number(0-100), "endgame_score": number(0-100), "best_color": "white"|"black", "weakness": string, "summary": string}
- style_label: 2-4 words like "Tactical Berserker", "Positional Boa Constrictor", "Endgame Assassin"
- summary: 2 sentences, punchy, second person ("You...")
- weakness: 1 sentence`;

    const userMsg = `Analyze this player and return DNA JSON.
Stats: ${JSON.stringify(summaryStats)}
Recent bot games: ${JSON.stringify((bots ?? []).slice(0, 10))}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const body = await aiRes.text();
      console.error("AI failed", aiRes.status, body);
      return json({ error: "AI gateway failed", status: aiRes.status, details: body }, aiRes.status);
    }
    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const clamp = (n: any, d = 50) => {
      const x = Number(n);
      if (!isFinite(x)) return d;
      return Math.max(0, Math.min(100, Math.round(x)));
    };

    const row = {
      user_id: userId,
      style_label: String(parsed.style_label ?? "Chess Player").slice(0, 60),
      aggression_score: clamp(parsed.aggression_score),
      defense_score: clamp(parsed.defense_score),
      tactics_score: clamp(parsed.tactics_score),
      endgame_score: clamp(parsed.endgame_score),
      favorite_openings: topOpenings,
      best_color: parsed.best_color === "black" ? "black" : "white",
      weakness: String(parsed.weakness ?? "").slice(0, 300),
      summary: String(parsed.summary ?? "").slice(0, 600),
      games_analyzed: total,
      updated_at: new Date().toISOString(),
    };

    const { data: up, error: upErr } = await supabase
      .from("chess_dna_snapshots")
      .upsert(row, { onConflict: "user_id" })
      .select()
      .single();

    if (upErr) {
      // If conflict target missing (no unique constraint yet), fall back to manual upsert
      const { data: existing } = await supabase
        .from("chess_dna_snapshots").select("id").eq("user_id", userId).maybeSingle();
      if (existing) {
        const { data: updated } = await supabase
          .from("chess_dna_snapshots").update(row).eq("id", existing.id).select().single();
        return json({ dna: updated, cached: false });
      }
      const { data: inserted, error: insErr } = await supabase
        .from("chess_dna_snapshots").insert(row).select().single();
      if (insErr) return json({ error: "db error", details: insErr.message }, 500);
      return json({ dna: inserted, cached: false });
    }
    return json({ dna: up, cached: false });
  } catch (e) {
    console.error("generate-chess-dna fatal", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
