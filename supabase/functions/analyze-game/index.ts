import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { pgn, playerColor, result } = await req.json();

    const systemPrompt = `You are DailyChess_12, an expert chess coach. Analyze the following chess game PGN and provide constructive feedback.
The player played as ${playerColor === "w" ? "White" : "Black"}. The result was: ${result}.

LANGUAGE — ABSOLUTE RULE: Always write ALL output (summary, explanations, suggestions, strengths, tips) in clear, natural ENGLISH only. Never use any other language, even if the PGN contains foreign-language tags or comments.

You MUST respond with a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "summary": "2-3 sentence overall assessment of the game",
  "rating": "A letter grade from F to A+ rating the player's performance",
  "score": 65,
  "mistakes": [{"move": "move notation", "moveNumber": 12, "explanation": "why it was a mistake", "suggestion": "better alternative"}],
  "strengths": ["strength 1", "strength 2"],
  "tips": ["improvement tip 1", "improvement tip 2"]
}

"score" is a performance score from 0 to 100 (0=terrible, 100=perfect).
"moveNumber" is the move number where the mistake occurred.
Keep mistakes to the top 3 most critical. Keep strengths and tips to 2-3 each. Be encouraging but honest.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `PGN:\n${pgn}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from the response, handling possible markdown code blocks
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        summary: content,
        rating: "N/A",
        mistakes: [],
        strengths: [],
        tips: [],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-game error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
