// Generates a personalised opening lesson tailored to the user's actual game,
// then persists it in `custom_lessons` so they can revisit it from /learn.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Body {
  pgn: string;
  myColor: "w" | "b";
  openingName: string;
  openingEco?: string;
  sourceGameId?: string;
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

    // Identify caller via their JWT
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.pgn || !body?.openingName || !body?.myColor) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sideWord = body.myColor === "w" ? "White" : "Black";

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a chess coach building a short, focused practice lesson for an amateur player based on the opening they just played.",
          },
          {
            role: "user",
            content: [
              `Player side: ${sideWord}`,
              `Opening: ${body.openingEco ?? ""} ${body.openingName}`.trim(),
              `Their game PGN (for context, do not invent moves):`,
              body.pgn,
              "",
              "Build a personalised lesson that helps this player handle this opening better next time.",
            ].join("\n"),
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_lesson" } },
        tools: [{
          type: "function",
          function: {
            name: "emit_lesson",
            description: "Personalised opening lesson.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Catchy lesson title." },
                summary: { type: "string", description: "1-2 sentences explaining what this lesson covers." },
                key_ideas: {
                  type: "array",
                  description: "3-5 short bullet points the player must remember.",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 5,
                },
                recommended_moves: {
                  type: "array",
                  description: "3-5 SAN moves that are part of this opening's main line for the player's side, with short explanations.",
                  items: {
                    type: "object",
                    properties: {
                      san: { type: "string" },
                      why: { type: "string" },
                    },
                    required: ["san", "why"],
                    additionalProperties: false,
                  },
                  minItems: 3,
                  maxItems: 5,
                },
                practice_lines: {
                  type: "array",
                  description: "2-3 short variation lines (each as a sequence of SAN moves) to drill.",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      moves: { type: "array", items: { type: "string" } },
                      note: { type: "string" },
                    },
                    required: ["name", "moves", "note"],
                    additionalProperties: false,
                  },
                  minItems: 2,
                  maxItems: 3,
                },
              },
              required: ["title", "summary", "key_ideas", "recommended_moves", "practice_lines"],
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
      return new Response(JSON.stringify({ error: "no_lesson_returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const lesson = typeof args === "string" ? JSON.parse(args) : args;

    // Persist using service role (RLS still enforced via user_id we set ourselves).
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: inserted, error: insErr } = await admin.from("custom_lessons").insert({
      user_id: user.id,
      title: lesson.title,
      opening_name: body.openingName,
      opening_eco: body.openingEco ?? null,
      source_game_id: body.sourceGameId ?? null,
      pgn: body.pgn,
      summary: lesson.summary,
      key_ideas: lesson.key_ideas,
      recommended_moves: lesson.recommended_moves,
      practice_lines: lesson.practice_lines,
    }).select("id").single();

    if (insErr) {
      console.error("insert error:", insErr);
      return new Response(JSON.stringify({ error: "persist_failed", details: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, lessonId: inserted.id, lesson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-opening-lesson error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
