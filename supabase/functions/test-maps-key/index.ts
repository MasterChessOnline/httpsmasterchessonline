// Verifies a Google Maps API key actually works for masterchess.live by hitting
// Places API (New) text search. Returns {ok, status, error?}.
// Called from /admin/maps-setup wizard.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { apiKey, referer } = await req.json().catch(() => ({}));
    if (!apiKey || typeof apiKey !== "string" || apiKey.length < 20) {
      return json({ ok: false, error: "Missing or invalid apiKey" }, 400);
    }

    const url = `https://places.googleapis.com/v1/places:searchText?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "places.id,places.displayName",
        // Simulate a request coming from the user's custom domain so referrer
        // restrictions are validated correctly:
        Referer: typeof referer === "string" && referer ? referer : "https://masterchess.live/",
      },
      body: JSON.stringify({ textQuery: "chess club Belgrade" }),
    });

    const body = await r.text();
    if (!r.ok) {
      return json({
        ok: false,
        status: r.status,
        error: body.slice(0, 500),
        hint:
          r.status === 403
            ? "REQUEST_DENIED — check HTTP referrer restrictions include https://masterchess.live/* and https://*.masterchess.live/*"
            : undefined,
      });
    }
    return json({ ok: true, status: r.status, sample: body.slice(0, 200) });
  } catch (e) {
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
