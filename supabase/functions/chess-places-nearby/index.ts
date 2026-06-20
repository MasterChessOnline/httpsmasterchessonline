// Find real chess venues (clubs, cafés, parks) near a given city or lat/lng.
// Uses Google Places API (New) — searchText — via the Lovable connector gateway.
// Caches results per city for 7 days in `site_config` to keep API spend tiny.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  mapsUri?: string;
  websiteUri?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { cityKey, lat, lng, radius = 25000 } = body as {
      cityKey?: string;
      lat?: number;
      lng?: number;
      radius?: number;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return json({ places: [], status: "google_maps_not_linked" });
    }

    // Resolve city → lat/lng/name when cityKey is provided
    let cityName: string | null = null;
    let originLat = lat;
    let originLng = lng;

    if (cityKey) {
      const cacheKey = `chess_places:${cityKey}`;
      const { data: cached } = await admin
        .from("site_config")
        .select("value")
        .eq("key", cacheKey)
        .maybeSingle();
      if (cached?.value) {
        const v = cached.value as { resolved_at: string; places: Place[] };
        const age = Date.now() - new Date(v.resolved_at).getTime();
        if (age < CACHE_TTL_MS) {
          return json({ places: v.places, status: "cache", cityKey });
        }
      }

      const { data: city } = await admin
        .from("cities")
        .select("name,country_name,lat,lng")
        .eq("key", cityKey)
        .maybeSingle();
      if (!city) return json({ places: [], status: "unknown_city" }, 404);
      cityName = `${city.name}, ${city.country_name}`;
      originLat = city.lat ? Number(city.lat) : undefined;
      originLng = city.lng ? Number(city.lng) : undefined;
    }

    const textQuery = cityName
      ? `chess club in ${cityName}`
      : "chess club";

    const reqBody: Record<string, unknown> = { textQuery, maxResultCount: 20 };
    if (originLat && originLng) {
      reqBody.locationBias = {
        circle: {
          center: { latitude: originLat, longitude: originLng },
          radius: Math.min(50000, Math.max(500, radius)),
        },
      };
    }

    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri",
      },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("places search failed", res.status, t);
      return json({ places: [], status: "api_error", detail: t.slice(0, 300) }, 502);
    }

    const data = await res.json();
    const places: Place[] = (data.places ?? []).map((p: any) => ({
      id: p.id,
      name: p.displayName?.text ?? "Unknown",
      address: p.formattedAddress ?? "",
      lat: p.location?.latitude,
      lng: p.location?.longitude,
      rating: p.rating,
      userRatingCount: p.userRatingCount,
      mapsUri: p.googleMapsUri,
      websiteUri: p.websiteUri,
    })).filter((p: Place) => p.lat && p.lng);

    if (cityKey) {
      await admin.from("site_config").upsert({
        key: `chess_places:${cityKey}`,
        value: { resolved_at: new Date().toISOString(), places },
      });
    }

    return json({ places, status: "ok", cityKey });
  } catch (e) {
    console.error(e);
    return json({ places: [], status: "error", error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
