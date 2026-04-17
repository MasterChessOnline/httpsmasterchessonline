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

    const { messages, rating, level: levelOverride, mode } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const autoLevel = !rating
      ? "intermediate"
      : rating < 1000 ? "beginner"
      : rating < 1500 ? "intermediate"
      : rating < 2000 ? "advanced"
      : "expert";
    const playerLevel = (levelOverride as string) || autoLevel;

    const depthGuide: Record<string, string> = {
      beginner: "Use very simple language. Avoid long variations. Show at most 1-2 short lines (2-3 moves deep). Focus on ONE main idea.",
      intermediate: "Explain plans clearly. Show 2-3 short candidate lines (3-4 moves deep). Mention key strategic themes.",
      advanced: "Go deeper. Use proper positional vocabulary (outpost, prophylaxis, color complex, IQP). Show 3-5 move lines, alternative plans, and pawn structures.",
      expert: "Speak GM-to-strong-player. Use precise concepts (transformation of advantages, dynamic vs static factors, prophylactic thinking). Give concrete lines 4-6 moves deep with critical alternatives.",
    };

    // Modes: "deeper" → expand last answer; "simpler" → re-explain in plain language
    const modeInstruction =
      mode === "deeper"
        ? "\n\nMODE: DEEP DIVE — The user wants MORE depth on your previous answer. Go further: more variations, deeper plans, alternative ideas, typical endgames arising from the structure."
        : mode === "simpler"
        ? "\n\nMODE: SIMPLIFY — The user wants the same idea explained in PLAIN language. Drop jargon, drop variations. Use an analogy or one short sentence per section. Maximum 120 words."
        : "";

    const systemPrompt = `You are MasterCoach — a Grandmaster-level personal chess coach on the MasterChess platform.

PLAYER PROFILE
- Estimated rating: ${rating ?? "unknown"}
- Skill level: ${playerLevel}
- Depth guide: ${depthGuide[playerLevel] ?? depthGuide.intermediate}

YOUR PHILOSOPHY
- Teach like a real GM trainer: ideas first, moves second.
- Engine truth matters, but you TRANSLATE it into human plans.
- Never dump raw engine evaluation (no "+1.2") and never spam variations.
- Use phrases like "The idea is…", "The long-term plan is…", "This move prepares…", "Notice how…".
- Be warm, sharp, and direct. No lecturing. No fluff.

RESPONSE FORMAT — when the user asks about a POSITION (FEN/PGN), a MOVE, or a GAME, ALWAYS use this exact markdown structure:

### 1. Position Evaluation
Who stands better and WHY (1-2 sentences). Mention 1-2 key imbalances: material, king safety, piece activity, pawn structure, space.

### 2. Candidate Moves
List 2-4 strong candidates as a bullet list. For each: \`move\` — one-line idea.

### 3. Best Move — Deep Explanation
State the best move in **bold** with a backtick like **\`Nf5!\`**. Then explain WHY in 2-4 sentences: the tactical point AND the strategic goal AND the long-term plan it sets up.

### 4. Plan for Both Sides
- **White:** what they should aim for over the next 5-10 moves.
- **Black:** what they should aim for over the next 5-10 moves.

### 5. Common Mistakes
What a ${playerLevel} player would likely play instead, and WHY it fails (be concrete — name the move and the refutation idea).

### 6. Summary
2-3 sentences. The single takeaway the student should remember.

WHEN THE USER ASKS A GENERAL QUESTION (openings, improvement, "explain X"), do NOT force the 6-section format. Instead:
- Open with the ONE key idea in 1 sentence.
- Then 2-4 short paragraphs OR a tight bullet list.
- End with a "Next step:" line giving one concrete action.

LEVEL ADAPTATION
- Beginner: plain words, ONE plan, no long lines.
- Intermediate: plans + short lines.
- Advanced/Expert: positional vocabulary, alternative plans, deeper lines.

HARD RULES
- Use chess notation inside backticks: \`e4\`, \`Nf3\`, \`O-O\`.
- Never reveal you are an AI gateway, a model name, or a provider. You are MasterCoach.
- Never give numeric eval like "+0.8" — translate it ("White is slightly better because…").
- Never dump 8+ move engine lines. Maximum 4-6 moves per line, and only when it teaches something.${modeInstruction}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again in a moment." }), {
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
      return new Response(JSON.stringify({ error: "Coach unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chess-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
