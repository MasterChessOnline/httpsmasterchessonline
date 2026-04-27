// Coach review of a finished human-vs-human game.
// IMPORTANT: verdicts (book/best/inaccuracy/mistake/blunder/brilliant) come
// from the client-side Stockfish classifier. The AI here ONLY narrates the
// pre-classified moments — it must not invent or change verdicts, and must
// never call move 1 "Brilliant".
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface KeyMomentInput {
  move_number: number;
  color: "w" | "b";
  san: string;
  verdict: "book" | "best" | "excellent" | "good" | "inaccuracy" | "mistake" | "blunder" | "brilliant";
  cp_loss: number;
  best_move_san: string | null;
}

interface ReviewBody {
  pgn: string;
  myColor: "w" | "b";
  result: string;            // "1-0" | "0-1" | "1/2-1/2"
  endReason?: string;
  openingName?: string;
  openingEco?: string;
  myRating?: number;
  opponentRating?: number;
  accuracy?: { white: number; black: number };
  counts?: Record<string, number>;
  key_moments_input?: KeyMomentInput[];
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
    const myAcc = body.accuracy ? (body.myColor === "w" ? body.accuracy.white : body.accuracy.black) : null;
    const oppAcc = body.accuracy ? (body.myColor === "w" ? body.accuracy.black : body.accuracy.white) : null;

    const sys = [
      "You are a precise, encouraging chess coach.",
      "You will receive a PGN AND a list of pre-classified key moments produced by an actual chess engine (Stockfish).",
      "STRICT RULES:",
      "1. NEVER change a move's verdict. Use exactly the verdict provided in key_moments_input.",
      "2. NEVER call any move 'brilliant' unless it is already labelled 'brilliant' in the input.",
      "3. NEVER label opening moves as anything other than 'book' if they are still in theory — those are already filtered out for you.",
      "4. Keep each comment short (max ~25 words), concrete, and addressed to the player ('you played…', 'a stronger move was…').",
      "5. If best_move_san is provided, mention it naturally in the comment.",
      "6. Speak about repertoire only for the actually-played opening; do not invent moves.",
    ].join(" ");

    const userPrompt = [
      `Game PGN:\n${body.pgn}`,
      `Player to coach: ${sideWord}${body.myRating ? ` (rating ${body.myRating})` : ""}`,
      body.opponentRating ? `Opponent rating: ${body.opponentRating}` : "",
      `Result: ${body.result}${body.endReason ? ` (${body.endReason})` : ""}`,
      body.openingName ? `Opening played: ${body.openingEco ?? ""} ${body.openingName}`.trim() : "",
      myAcc != null && oppAcc != null ? `Engine accuracy — you: ${myAcc}%, opponent: ${oppAcc}%.` : "",
      body.counts ? `Move count breakdown: ${JSON.stringify(body.counts)}` : "",
      body.key_moments_input && body.key_moments_input.length
        ? `Pre-classified key moments (DO NOT change verdicts):\n${JSON.stringify(body.key_moments_input, null, 2)}`
        : "No significant mistakes were detected by the engine — focus the review on positives and what to drill next.",
      "",
      "Produce: a 1-2 sentence summary, an opening assessment, narrated key_moments (one per pre-classified moment, keeping its verdict), 3 repertoire suggestions for the played opening, and a single 'next focus' sentence.",
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
            description: "Return a structured chess game review. Verdicts must mirror the engine input exactly.",
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
                      verdict: { type: "string", enum: ["book", "best", "excellent", "good", "inaccuracy", "mistake", "blunder", "brilliant"] },
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

    // ── Defensive guard: enforce that AI did not invent a "brilliant"
    // verdict. If the input never marked a move as brilliant, downgrade
    // any AI-emitted brilliant to its honest classification (good/best).
    const inputBrilliantKeys = new Set(
      (body.key_moments_input ?? [])
        .filter(m => m.verdict === "brilliant")
        .map(m => `${m.move_number}-${m.san}`)
    );
    if (Array.isArray(review?.key_moments)) {
      const allowedByMove = new Map<string, string>();
      for (const km of body.key_moments_input ?? []) {
        allowedByMove.set(`${km.move_number}-${km.san}`, km.verdict);
      }
      review.key_moments = review.key_moments.map((m: any) => {
        const key = `${m.move_number}-${m.san ?? ""}`;
        // Force the engine's verdict where we have one.
        if (allowedByMove.has(key)) {
          m.verdict = allowedByMove.get(key);
        } else if (m.verdict === "brilliant" && !inputBrilliantKeys.has(key)) {
          m.verdict = "good";
        }
        return m;
      });
    }

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
