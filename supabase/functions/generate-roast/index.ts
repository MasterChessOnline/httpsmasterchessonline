// Generates brutal AI chess roast for a game via Lovable AI Gateway.
// Called from /roast/:gameId page. Caches result in public.roasts.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require authenticated caller
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "unauthorized" }, 401);
    const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);
    const callerId = userData.user.id;

    const { gameId, language = "sr", mode = "playful", regenerate = false } = await req.json();
    if (!gameId || typeof gameId !== "string") {
      return json({ error: "gameId required" }, 400);
    }
    if (!["sr", "en"].includes(language)) return json({ error: "bad language" }, 400);
    if (!["playful", "brutal"].includes(mode)) return json({ error: "bad mode" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Only allow regenerate if caller is a participant in the game or admin
    if (regenerate) {
      const { data: g } = await supabase
        .from("online_games")
        .select("white_player_id, black_player_id")
        .eq("id", gameId)
        .maybeSingle();
      if (!g) return json({ error: "game not found" }, 404);
      const isParticipant = g.white_player_id === callerId || g.black_player_id === callerId;
      if (!isParticipant) {
        const { data: adminCheck } = await supabase.rpc("has_role", { _user_id: callerId, _role: "admin" });
        if (!adminCheck) return json({ error: "forbidden" }, 403);
      }
    }

    // Return cached unless regenerate
    if (!regenerate) {
      const { data: cached } = await supabase.from("roasts").select("*").eq("game_id", gameId).maybeSingle();
      if (cached) return json({ roast: cached, cached: true });
    }

    const { data: game } = await supabase
      .from("online_games")
      .select("id, white_player_id, black_player_id, result, time_control_label, move_number, end_reason, pgn")
      .eq("id", gameId)
      .maybeSingle();
    if (!game) return json({ error: "game not found" }, 404);

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", [game.white_player_id, game.black_player_id].filter(Boolean));
    const wn = profs?.find((p) => p.id === game.white_player_id)?.username ?? "Beli";
    const bn = profs?.find((p) => p.id === game.black_player_id)?.username ?? "Crni";
    const loserName =
      game.result === "1-0" ? bn : game.result === "0-1" ? wn : null;
    const winnerName =
      game.result === "1-0" ? wn : game.result === "0-1" ? bn : null;

    const pgnSnippet = (game.pgn ?? "").slice(0, 2500);

    const langHint = language === "sr"
      ? "Piši na srpskom (latinica), koristi žargon i lokalni humor gde može."
      : "Write in English, use dry sarcasm and internet humor.";
    const styleHint = mode === "brutal"
      ? "BRUTAL MODE: bez cenzure (ali bez psovki), maksimalno oštro, sarkastično, po Ricky Gervais stilu."
      : "PLAYFUL MODE: šaljivo ali dobronamerno, tipa dobar prijatelj koji te zeza.";

    const systemPrompt = `You are a savage chess commentator writing viral social-media captions. ${langHint} ${styleHint}
Output STRICT JSON: {"headline": string, "roast_lines": [string, string, string, string], "hashtag": string}
- headline: 8-14 words, hook worthy of TikTok caption
- roast_lines: 4 lines, each 1-2 sentences, sharp punchlines
- hashtag: 1-3 hashtags space-separated starting with #
Do NOT wrap in markdown. Return raw JSON.`;

    const userMsg = `Partija:
Beli: ${wn}
Crni: ${bn}
Kontrola: ${game.time_control_label}
Broj poteza: ${game.move_number}
Rezultat: ${game.result ?? "?"}
Razlog kraja: ${game.end_reason ?? "?"}
Pobednik: ${winnerName ?? "REMI"}
${loserName ? `Meta ismevanja: ${loserName}` : "Meta ismevanja: obojica podjednako (remi)"}

PGN:
${pgnSnippet}

Zezaj ${loserName ?? "obojicu"} u kontekstu ove partije. Reference na konkretne poteze poželjne.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const body = await aiRes.text();
      console.error("AI gateway failed", aiRes.status, body);
      return json({ error: "AI gateway failed", status: aiRes.status, details: body }, aiRes.status);
    }
    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { headline: "Roast", roast_lines: [content], hashtag: "#MasterChess" };
    }

    const roastText = JSON.stringify(parsed);
    const targetUserId =
      game.result === "1-0" ? game.black_player_id :
      game.result === "0-1" ? game.white_player_id : null;

    const { data: upserted, error: upErr } = await supabase
      .from("roasts")
      .upsert(
        {
          game_id: gameId,
          target_user_id: targetUserId,
          roast_text: roastText,
          language,
          mode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "game_id" }
      )
      .select()
      .single();
    if (upErr) {
      console.error("upsert failed", upErr);
      return json({ error: "db error", details: upErr.message }, 500);
    }

    return json({ roast: upserted, cached: false });
  } catch (e) {
    console.error("generate-roast fatal", e);
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
