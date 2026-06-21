// Fetches top Google reviews for the MasterChess Place via the Google Maps
// connector gateway (Places API New, Place Details with `reviews` field).
// Cached 6h in `site_config` (key: `google_reviews_cache`) to stay under quota.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_KEY = "google_reviews_cache";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Return fresh cache if present
    const { data: cached } = await admin
      .from("site_config")
      .select("value")
      .eq("key", CACHE_KEY)
      .maybeSingle();
    const cachedVal = (cached as any)?.value as any;
    if (cachedVal?.fetched_at && Date.now() - new Date(cachedVal.fetched_at).getTime() < CACHE_TTL_MS) {
      return json(cachedVal);
    }

    // 2. Need place_id
    const { data: place } = await admin
      .from("site_config")
      .select("value")
      .eq("key", "google_place")
      .maybeSingle();
    const placeId = (place as any)?.value?.place_id as string | undefined;
    if (!placeId) {
      return json({ reviews: [], rating: null, total: 0, status: "no_place_id" });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return json({ reviews: [], rating: null, total: 0, status: "connector_missing" });
    }

    const res = await fetch(`${GATEWAY_URL}/places/v1/places/${placeId}`, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount,googleMapsUri",
      },
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data, status: res.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reviews = (data.reviews ?? []).slice(0, 5).map((r: any) => ({
      author: r.authorAttribution?.displayName ?? "Google user",
      avatar: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? null,
      text: r.text?.text ?? r.originalText?.text ?? "",
      relativeTime: r.relativePublishTimeDescription ?? "",
      publishTime: r.publishTime ?? null,
    }));

    const payload = {
      reviews,
      rating: data.rating ?? null,
      total: data.userRatingCount ?? 0,
      mapsUri: data.googleMapsUri ?? null,
      fetched_at: new Date().toISOString(),
      status: "ok",
    };
    await admin.from("site_config").upsert({ key: CACHE_KEY, value: payload });
    return json(payload);
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function json(v: unknown) {
  return new Response(JSON.stringify(v), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
