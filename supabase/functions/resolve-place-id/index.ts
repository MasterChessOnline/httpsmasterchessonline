// Resolves the MasterChess Google Place ID via the Google Maps Platform connector
// (Places API New, searchText) and caches the result in `site_config`.
// Falls back gracefully when the connector isn't linked or the listing isn't
// verified yet — the app still works using the Maps search fallback URL.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const QUERY = "MasterChess masterchess.live";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      const value = {
        place_id: null,
        maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(QUERY)}`,
        resolved_at: new Date().toISOString(),
        status: "google_maps_connector_not_linked",
      };
      await admin.from("site_config").upsert({ key: "google_place", value });
      return new Response(JSON.stringify(value), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.websiteUri",
      },
      body: JSON.stringify({ textQuery: QUERY }),
    });

    const json = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: json, status: res.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const places = (json.places ?? []) as Array<any>;
    const match = places.find((p) => {
      const site = (p?.websiteUri ?? "").toLowerCase();
      const name = (p?.displayName?.text ?? "").toLowerCase();
      return site.includes("masterchess.live") || name === "masterchess";
    });

    if (!match?.id) {
      const value = {
        place_id: null,
        maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(QUERY)}`,
        resolved_at: new Date().toISOString(),
        status: "no_verified_match_yet",
        candidates: places.slice(0, 3).map((p) => ({
          name: p?.displayName?.text,
          website: p?.websiteUri,
          address: p?.formattedAddress,
        })),
      };
      await admin.from("site_config").upsert({ key: "google_place", value });
      return new Response(JSON.stringify(value), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const place = match;

    const value = {
      place_id: place.id,
      place_name: place.displayName?.text ?? null,
      address: place.formattedAddress ?? null,
      website: place.websiteUri ?? null,
      place_url: place.googleMapsUri ?? null,
      maps_url: place.googleMapsUri ?? null,
      review_url: `https://search.google.com/local/writereview?placeid=${place.id}`,
      resolved_at: new Date().toISOString(),
      status: "ok",
    };
    await admin.from("site_config").upsert({ key: "google_place", value });
    return new Response(JSON.stringify(value), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
