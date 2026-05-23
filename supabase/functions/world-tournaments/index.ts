// Generates short blog articles about upcoming major chess tournaments
// in the world using Lovable AI Gateway. Returns JSON of articles.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require authenticated user to prevent unauthenticated AI credit drain.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const today = new Date().toISOString().slice(0, 10);
    const sys =
      "You are a chess news editor for MasterChess. Produce concise, factual blog cards about the most important UPCOMING or currently-running over-the-board chess tournaments in the world (FIDE Circuit, Candidates, World Championship cycle, World Cup, Grand Swiss, Tata Steel, Norway Chess, Sinquefield Cup, Grand Chess Tour stops, Olympiad, European/Continental Championships, major opens). Only include real tournaments. Never invent events. Prefer events happening within the next ~6 months from today. Keep tone professional and exciting, like Chess.com/FIDE press releases.";

    const userPrompt = `Today is ${today}. Return 6 to 8 upcoming or currently-running major chess tournaments. For each: a sharp title, the city/country, date window (e.g. "March 14 – April 3, 2026"), 2-3 sentence intro about what is at stake (qualifiers, prize pool, top seeds), and 2-4 storylines to follow. Be specific with player names and stakes when known.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userPrompt },
        ],
        tool_choice: { type: "function", function: { name: "emit_articles" } },
        tools: [{
          type: "function",
          function: {
            name: "emit_articles",
            description: "Return the list of upcoming chess tournament articles.",
            parameters: {
              type: "object",
              properties: {
                articles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      location: { type: "string" },
                      dates: { type: "string" },
                      category: { type: "string", description: "e.g. 'Candidates', 'Super Tournament', 'Olympiad', 'Open', 'World Cup'" },
                      intro: { type: "string" },
                      storylines: { type: "array", items: { type: "string" } },
                    },
                    required: ["title", "location", "dates", "category", "intro", "storylines"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["articles"],
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
    const parsed = typeof args === "string" ? JSON.parse(args) : args;

    return new Response(JSON.stringify({ ok: true, ...parsed, generated_at: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("world-tournaments error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
