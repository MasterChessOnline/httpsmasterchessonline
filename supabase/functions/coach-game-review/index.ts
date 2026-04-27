// Coach review of a finished human-vs-human game.
// Returns a structured analysis: opening review, key moments, repertoire
// recommendations. Uses Lovable AI Gateway (Gemini Flash) — fast & cheap.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewBody {
  pgn: string;
  myColor: "w" | "b";
  result: string;            // "1-0" | "0-1" | "1/2-1/2"
  endReason?: string;
  openingName?: string;
  openingEco?: string;
  myRating?: number;
  opponentRating?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as ReviewBody;
    if (!body?.pgn || !body?.myColor) {
      return new Response(JSON.stringify({ error: "missing pgn / myColor" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const sideWord = body.myColor === "w" ? "White" : "Black";
    const sys = [
      "You are a friendly, encouraging chess coach for an online amateur platform (no engine eval bars).",
      "Speak directly TO the player ('you played...', 'your opening...').",
      "Keep advice concrete, short, and actionable. Avoid jargon when possible.",
      "Never make up moves that did not happen in the supplied PGN.",
      "When recommending repertoire moves, give SAN moves that fit the opening that was actually played.",
    ].join(" ");

    const userPrompt = [
      `Game PGN:\n${body.pgn}`,
      `Player to coach: ${sideWord}${body.myRating ? ` (rating ${body.myRating})` : ""}`,
      body.opponentRating ? `Opponent rating: ${body.opponentRating}` : "",
      `Result: ${body.result}${body.endReason ? ` (${body.endReason})` : ""}`,
      body.openingName ? `Detected opening: ${body.openingEco ?? ""} ${body.openingName}`.trim() : "",
      "",
      "Produce a structured review with: opening assessment, 2-4 key moments (with move number), 3 concrete repertoire suggestions for this opening, and one focus area for the next game.",
    ].filter(Boolean).join("\n");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userPrompt },
        ],
        tool_choice: { type: "function", function: { name: "emit_review" } },
        tools: [{
          type: "function",
          function: {
            name: "emit_review",
            description: "Return a structured chess game review.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "1-2 sentence headline of the game." },
                opening_review: { type: "string", description: "Short paragraph evaluating how the player handled the opening." },
                key_moments: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      move_number: { type: "integer" },
                      san: { type: "string" },
                      verdict: { type: "string", enum: ["good", "inaccuracy", "mistake", "blunder", "brilliant"] },
                      comment: { type: "string" },
                    },
                    required: ["move_number", "verdict", "comment"],
                    additionalProperties: false,
                  },
                },
                repertoire_suggestions: {
                  type: "array",
                  description: "3 specific moves the player should learn for this opening.",
                  items: {
                    type: "object",
                    properties: {
                      san: { type: "string" },
                      why: { type: "string" },
                    },
                    required: ["san", "why"],
                    additionalProperties: false,
                  },
                },
                next_focus: { type: "string", description: "One sentence: what the player should drill before the next game." },
              },
              required: ["summary", "opening_review", "key_moments", "repertoire_suggestions", "next_focus"],
              additionalProperties: false,
            },
          },
        }],
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, text);
      const err = aiResp.status === 429 ? "rate_limited" : aiResp.status === 402 ? "credits_exhausted" : "ai_error";
      return new Response(JSON.stringify({ error: err }), {
        status: aiResp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await aiResp.json();
    const tc = json?.choices?.[0]?.message?.tool_calls?.[0];
    const args = tc?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ error: "no_review_returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const review = typeof args === "string" ? JSON.parse(args) : args;

    return new Response(JSON.stringify({ ok: true, review }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("coach-game-review error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
