// Nikola coach TTS — streams audio from Lovable AI Gateway (OpenAI gpt-4o-mini-tts)
// back to the browser as Server-Sent Events. Body: { text: string, voice?: string }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const INSTRUCTIONS =
  "Speak warmly and clearly like a friendly 13-year-old Serbian chess coach explaining " +
  "a move to a friend. Energetic, encouraging, never robotic. Speak Serbian naturally " +
  "when the input is Serbian, and pronounce chess notation (e4, Nf3, O-O) clearly.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { text?: string; voice?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const text = (body.text || "").trim();
  if (!text) {
    return new Response(JSON.stringify({ error: "Missing text" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (text.length > 2000) {
    return new Response(JSON.stringify({ error: "Text too long (max 2000 chars)" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const voice = body.voice && /^[a-z]+$/i.test(body.voice) ? body.voice : "verse";

  try {
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice,
        instructions: INSTRUCTIONS,
        stream_format: "sse",
        response_format: "pcm",
      }),
      signal: req.signal,
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `TTS upstream ${upstream.status}: ${errText}` }),
        {
          status: upstream.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
