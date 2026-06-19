// Generates per-move chess explanations in Serbian via Lovable AI Gateway.
// Caches results in `variation_explanations` table.
//
// Body: { courseId, variationId, courseTitle, variationName, startFen?, moves: [{san, fen?}] }
// Returns: { summary: string, moves: [{ san, explanation }], cached: boolean }

import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface MoveIn { san: string; fen?: string }

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  const supaUrl = Deno.env.get("SUPABASE_URL");
  const supaKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!apiKey || !supaUrl || !supaKey) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: {
    courseId?: string; variationId?: string;
    courseTitle?: string; variationName?: string;
    startFen?: string; moves?: MoveIn[];
  };
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const courseId = (body.courseId || "").slice(0, 80);
  const variationId = (body.variationId || "").slice(0, 120);
  const moves = Array.isArray(body.moves) ? body.moves.slice(0, 60) : [];
  if (!courseId || !variationId || moves.length === 0) {
    return new Response(JSON.stringify({ error: "Missing courseId/variationId/moves" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supaUrl, supaKey);
  const cacheKey = await sha256(JSON.stringify({
    c: courseId, v: variationId, f: body.startFen || "", m: moves.map((x) => x.san),
  }));

  // Cache check
  const { data: cached } = await supabase
    .from("variation_explanations")
    .select("summary, moves")
    .eq("cache_key", cacheKey)
    .maybeSingle();
  if (cached) {
    return new Response(JSON.stringify({ ...cached, cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Build prompt
  const movesList = moves.map((m, i) => `${i + 1}. ${m.san}`).join("\n");
  const prompt = `Ti si Nikola, 13-godišnji šahovski trener iz Srbije. Govoriš toplo i jednostavno.

Kurs: "${body.courseTitle || courseId}"
Varijanta: "${body.variationName || variationId}"
Početna pozicija: ${body.startFen || "standardna početna pozicija"}

Potezi:
${movesList}

Za SVAKI potez napiši kratko objašnjenje na srpskom (12-22 reči) — šta je ideja, plan, ili pretnja. Ne ponavljaj očigledno. Govori prirodno, kao prijatelju.
Takođe napiši jednu rečenicu "summary" koja sažima celu varijantu (do 25 reči).

Vrati ISKLJUČIVO validan JSON, bez markdown ograda:
{"summary":"...", "moves":[{"san":"e4","explanation":"..."}, ...]}`;

  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "Vraćaš samo validan JSON. Nikad markdown ograde." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!aiRes.ok) {
    const errText = await aiRes.text().catch(() => "");
    return new Response(
      JSON.stringify({ error: `AI ${aiRes.status}: ${errText.slice(0, 300)}` }),
      { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  const aiJson = await aiRes.json();
  const raw = aiJson.choices?.[0]?.message?.content || "{}";
  let parsed: { summary?: string; moves?: { san: string; explanation: string }[] };
  try { parsed = JSON.parse(raw); } catch {
    parsed = { summary: "", moves: [] };
  }

  const summary = (parsed.summary || "").slice(0, 400);
  const outMoves = (parsed.moves || [])
    .filter((m) => m && typeof m.san === "string" && typeof m.explanation === "string")
    .slice(0, moves.length)
    .map((m) => ({ san: m.san, explanation: m.explanation.slice(0, 280) }));

  // Persist cache (ignore conflict)
  await supabase.from("variation_explanations").upsert({
    cache_key: cacheKey,
    course_id: courseId,
    variation_id: variationId,
    summary,
    moves: outMoves,
  }, { onConflict: "cache_key" });

  return new Response(JSON.stringify({ summary, moves: outMoves, cached: false }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
