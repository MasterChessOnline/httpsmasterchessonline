// Style Twin — analyzes a user's recent play and returns "you play like X" via Lovable AI.
// Auth required. Result cached in public.style_twins (one row per user).
// Body: {} — operates on authenticated user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const GM_POOL = [
  "Mikhail Tal", "Anatoly Karpov", "Garry Kasparov", "Bobby Fischer",
  "Magnus Carlsen", "José Capablanca", "Hikaru Nakamura", "Vladimir Kramnik",
  "Alireza Firouzja", "Ding Liren", "Viswanathan Anand", "Levon Aronian",
  "Wesley So", "Fabiano Caruana", "Ian Nepomniachtchi", "Wei Yi",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Pull profile + recent rating history for context
    const { data: profile } = await admin
      .from("profiles")
      .select("username, display_name, rating, peak_rating, games_played, games_won, games_lost, games_drawn, favorite_openings, win_streak")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile || (profile.games_played ?? 0) < 5) {
      return new Response(
        JSON.stringify({ error: "Play at least 5 ranked games first to unlock your Style Twin." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: history } = await admin
      .from("rating_history")
      .select("rating_change, result, opponent_rating, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const games = history ?? [];
    const wins = games.filter((g) => g.result === "win").length;
    const losses = games.filter((g) => g.result === "loss").length;
    const draws = games.filter((g) => g.result === "draw").length;
    const avgDelta = games.length
      ? Math.round(games.reduce((s, g) => s + (g.rating_change ?? 0), 0) / games.length)
      : 0;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `You are a chess style profiler. Given a player's statistics and favorite openings, pick ONE Grandmaster from this list whose playing style most resembles the player. Be playful, decisive, and concise.

GM POOL (you must pick exactly one): ${GM_POOL.join(", ")}.

Return ONLY a JSON object — no markdown, no prose — in this exact shape:
{
  "gm_name": "<one of the GM POOL>",
  "match_pct": <integer 60-95>,
  "reasoning": "<2 short sentences in English explaining the match, written in the voice of DailyChess_12, a friendly 13-year-old chess coach>"
}`;

    const userMsg = `Player stats (last ${games.length} ranked games):
- Username: ${profile.username ?? "anonymous"}
- Current rating: ${profile.rating}, peak: ${profile.peak_rating}
- All-time record: ${profile.games_won}W / ${profile.games_lost}L / ${profile.games_drawn}D over ${profile.games_played} games
- Recent ${games.length} games: ${wins}W / ${losses}L / ${draws}D, avg rating delta ${avgDelta}
- Current win streak: ${profile.win_streak}
- Favorite openings: ${(profile.favorite_openings ?? []).slice(0, 5).join(", ") || "unknown"}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again in a minute." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", aiResp.status, await aiResp.text());
      throw new Error("AI gateway error");
    }

    const aiJson = await aiResp.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "";
    let parsed: { gm_name?: string; match_pct?: number; reasoning?: string };
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {};
    }

    const gm = GM_POOL.includes(parsed.gm_name ?? "") ? parsed.gm_name! : GM_POOL[Math.floor(Math.random() * GM_POOL.length)];
    const pct = Math.max(60, Math.min(95, Math.round(Number(parsed.match_pct) || 75)));
    const reason = (parsed.reasoning ?? "").toString().slice(0, 400) || `Your tactical patterns and pacing line up with ${gm}.`;

    const { data: saved, error: upErr } = await admin
      .from("style_twins")
      .upsert({
        user_id: user.id,
        gm_name: gm,
        match_pct: pct,
        reasoning: reason,
        games_analyzed: games.length,
        computed_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (upErr) {
      console.error("upsert style_twins:", upErr);
      throw upErr;
    }

    return new Response(JSON.stringify({ ok: true, twin: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("style-twin error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
