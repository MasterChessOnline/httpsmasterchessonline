// City chess hub generator. For a list of cities, calls Google Maps Places API (New)
// to find nearby chess clubs and caches results in public.city_chess_hubs.
// Auth: admin OR cron.
// POST body: { cities?: [{slug,name,country,lat,lng}], limit?: number }
import { corsHeaders } from "../_shared/cors.ts";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

const DEFAULT_CITIES: { slug: string; name: string; country: string; lat: number; lng: number; region?: string }[] = [
  // Balkans
  { slug: "belgrade", name: "Belgrade", country: "RS", lat: 44.7866, lng: 20.4489, region: "Balkans" },
  { slug: "novi-sad", name: "Novi Sad", country: "RS", lat: 45.2671, lng: 19.8335, region: "Balkans" },
  { slug: "nis", name: "Niš", country: "RS", lat: 43.3209, lng: 21.8958, region: "Balkans" },
  { slug: "kragujevac", name: "Kragujevac", country: "RS", lat: 44.0128, lng: 20.9114, region: "Balkans" },
  { slug: "subotica", name: "Subotica", country: "RS", lat: 46.1005, lng: 19.6650, region: "Balkans" },
  { slug: "zagreb", name: "Zagreb", country: "HR", lat: 45.8150, lng: 15.9819, region: "Balkans" },
  { slug: "split", name: "Split", country: "HR", lat: 43.5081, lng: 16.4402, region: "Balkans" },
  { slug: "rijeka", name: "Rijeka", country: "HR", lat: 45.3271, lng: 14.4422, region: "Balkans" },
  { slug: "ljubljana", name: "Ljubljana", country: "SI", lat: 46.0569, lng: 14.5058, region: "Balkans" },
  { slug: "sarajevo", name: "Sarajevo", country: "BA", lat: 43.8563, lng: 18.4131, region: "Balkans" },
  { slug: "banja-luka", name: "Banja Luka", country: "BA", lat: 44.7722, lng: 17.1910, region: "Balkans" },
  { slug: "skopje", name: "Skopje", country: "MK", lat: 41.9981, lng: 21.4254, region: "Balkans" },
  { slug: "podgorica", name: "Podgorica", country: "ME", lat: 42.4304, lng: 19.2594, region: "Balkans" },
  { slug: "tirana", name: "Tirana", country: "AL", lat: 41.3275, lng: 19.8187, region: "Balkans" },
  { slug: "sofia", name: "Sofia", country: "BG", lat: 42.6977, lng: 23.3219, region: "Balkans" },
  { slug: "bucharest", name: "Bucharest", country: "RO", lat: 44.4268, lng: 26.1025, region: "Balkans" },
  { slug: "athens", name: "Athens", country: "GR", lat: 37.9838, lng: 23.7275, region: "Balkans" },
  { slug: "thessaloniki", name: "Thessaloniki", country: "GR", lat: 40.6401, lng: 22.9444, region: "Balkans" },
  { slug: "istanbul", name: "Istanbul", country: "TR", lat: 41.0082, lng: 28.9784, region: "Europe" },
  { slug: "budapest", name: "Budapest", country: "HU", lat: 47.4979, lng: 19.0402, region: "Europe" },
  // Western Europe
  { slug: "london", name: "London", country: "GB", lat: 51.5074, lng: -0.1278, region: "Europe" },
  { slug: "manchester", name: "Manchester", country: "GB", lat: 53.4808, lng: -2.2426, region: "Europe" },
  { slug: "paris", name: "Paris", country: "FR", lat: 48.8566, lng: 2.3522, region: "Europe" },
  { slug: "lyon", name: "Lyon", country: "FR", lat: 45.7640, lng: 4.8357, region: "Europe" },
  { slug: "berlin", name: "Berlin", country: "DE", lat: 52.5200, lng: 13.4050, region: "Europe" },
  { slug: "munich", name: "Munich", country: "DE", lat: 48.1351, lng: 11.5820, region: "Europe" },
  { slug: "hamburg", name: "Hamburg", country: "DE", lat: 53.5511, lng: 9.9937, region: "Europe" },
  { slug: "frankfurt", name: "Frankfurt", country: "DE", lat: 50.1109, lng: 8.6821, region: "Europe" },
  { slug: "amsterdam", name: "Amsterdam", country: "NL", lat: 52.3676, lng: 4.9041, region: "Europe" },
  { slug: "rotterdam", name: "Rotterdam", country: "NL", lat: 51.9244, lng: 4.4777, region: "Europe" },
  { slug: "brussels", name: "Brussels", country: "BE", lat: 50.8503, lng: 4.3517, region: "Europe" },
  { slug: "vienna", name: "Vienna", country: "AT", lat: 48.2082, lng: 16.3738, region: "Europe" },
  { slug: "zurich", name: "Zurich", country: "CH", lat: 47.3769, lng: 8.5417, region: "Europe" },
  { slug: "geneva", name: "Geneva", country: "CH", lat: 46.2044, lng: 6.1432, region: "Europe" },
  { slug: "prague", name: "Prague", country: "CZ", lat: 50.0755, lng: 14.4378, region: "Europe" },
  { slug: "warsaw", name: "Warsaw", country: "PL", lat: 52.2297, lng: 21.0122, region: "Europe" },
  { slug: "krakow", name: "Krakow", country: "PL", lat: 50.0647, lng: 19.9450, region: "Europe" },
  { slug: "stockholm", name: "Stockholm", country: "SE", lat: 59.3293, lng: 18.0686, region: "Europe" },
  { slug: "oslo", name: "Oslo", country: "NO", lat: 59.9139, lng: 10.7522, region: "Europe" },
  { slug: "copenhagen", name: "Copenhagen", country: "DK", lat: 55.6761, lng: 12.5683, region: "Europe" },
  { slug: "helsinki", name: "Helsinki", country: "FI", lat: 60.1699, lng: 24.9384, region: "Europe" },
  { slug: "dublin", name: "Dublin", country: "IE", lat: 53.3498, lng: -6.2603, region: "Europe" },
  { slug: "madrid", name: "Madrid", country: "ES", lat: 40.4168, lng: -3.7038, region: "Europe" },
  { slug: "barcelona", name: "Barcelona", country: "ES", lat: 41.3851, lng: 2.1734, region: "Europe" },
  { slug: "lisbon", name: "Lisbon", country: "PT", lat: 38.7223, lng: -9.1393, region: "Europe" },
  { slug: "rome", name: "Rome", country: "IT", lat: 41.9028, lng: 12.4964, region: "Europe" },
  { slug: "milan", name: "Milan", country: "IT", lat: 45.4642, lng: 9.1900, region: "Europe" },
  { slug: "naples", name: "Naples", country: "IT", lat: 40.8518, lng: 14.2681, region: "Europe" },
  // Americas
  { slug: "new-york", name: "New York", country: "US", lat: 40.7128, lng: -74.0060, region: "Americas" },
  { slug: "los-angeles", name: "Los Angeles", country: "US", lat: 34.0522, lng: -118.2437, region: "Americas" },
  { slug: "chicago", name: "Chicago", country: "US", lat: 41.8781, lng: -87.6298, region: "Americas" },
  { slug: "san-francisco", name: "San Francisco", country: "US", lat: 37.7749, lng: -122.4194, region: "Americas" },
  { slug: "boston", name: "Boston", country: "US", lat: 42.3601, lng: -71.0589, region: "Americas" },
  { slug: "seattle", name: "Seattle", country: "US", lat: 47.6062, lng: -122.3321, region: "Americas" },
  { slug: "miami", name: "Miami", country: "US", lat: 25.7617, lng: -80.1918, region: "Americas" },
  { slug: "austin", name: "Austin", country: "US", lat: 30.2672, lng: -97.7431, region: "Americas" },
  { slug: "washington", name: "Washington", country: "US", lat: 38.9072, lng: -77.0369, region: "Americas" },
  { slug: "philadelphia", name: "Philadelphia", country: "US", lat: 39.9526, lng: -75.1652, region: "Americas" },
  { slug: "toronto", name: "Toronto", country: "CA", lat: 43.6532, lng: -79.3832, region: "Americas" },
  { slug: "montreal", name: "Montreal", country: "CA", lat: 45.5017, lng: -73.5673, region: "Americas" },
  { slug: "vancouver", name: "Vancouver", country: "CA", lat: 49.2827, lng: -123.1207, region: "Americas" },
  { slug: "mexico-city", name: "Mexico City", country: "MX", lat: 19.4326, lng: -99.1332, region: "Americas" },
  { slug: "buenos-aires", name: "Buenos Aires", country: "AR", lat: -34.6037, lng: -58.3816, region: "Americas" },
  { slug: "sao-paulo", name: "São Paulo", country: "BR", lat: -23.5505, lng: -46.6333, region: "Americas" },
  { slug: "rio-de-janeiro", name: "Rio de Janeiro", country: "BR", lat: -22.9068, lng: -43.1729, region: "Americas" },
  // Asia/Pacific
  { slug: "tokyo", name: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503, region: "Asia" },
  { slug: "seoul", name: "Seoul", country: "KR", lat: 37.5665, lng: 126.9780, region: "Asia" },
  { slug: "singapore", name: "Singapore", country: "SG", lat: 1.3521, lng: 103.8198, region: "Asia" },
  { slug: "hong-kong", name: "Hong Kong", country: "HK", lat: 22.3193, lng: 114.1694, region: "Asia" },
  { slug: "bangkok", name: "Bangkok", country: "TH", lat: 13.7563, lng: 100.5018, region: "Asia" },
  { slug: "mumbai", name: "Mumbai", country: "IN", lat: 19.0760, lng: 72.8777, region: "Asia" },
  { slug: "delhi", name: "Delhi", country: "IN", lat: 28.7041, lng: 77.1025, region: "Asia" },
  { slug: "bengaluru", name: "Bengaluru", country: "IN", lat: 12.9716, lng: 77.5946, region: "Asia" },
  { slug: "chennai", name: "Chennai", country: "IN", lat: 13.0827, lng: 80.2707, region: "Asia" },
  { slug: "sydney", name: "Sydney", country: "AU", lat: -33.8688, lng: 151.2093, region: "Oceania" },
  { slug: "melbourne", name: "Melbourne", country: "AU", lat: -37.8136, lng: 144.9631, region: "Oceania" },
  { slug: "auckland", name: "Auckland", country: "NZ", lat: -36.8485, lng: 174.7633, region: "Oceania" },
  { slug: "dubai", name: "Dubai", country: "AE", lat: 25.2048, lng: 55.2708, region: "Asia" },
  { slug: "tel-aviv", name: "Tel Aviv", country: "IL", lat: 32.0853, lng: 34.7818, region: "Asia" },
  { slug: "cape-town", name: "Cape Town", country: "ZA", lat: -33.9249, lng: 18.4241, region: "Africa" },
  { slug: "johannesburg", name: "Johannesburg", country: "ZA", lat: -26.2041, lng: 28.0473, region: "Africa" },
  { slug: "cairo", name: "Cairo", country: "EG", lat: 30.0444, lng: 31.2357, region: "Africa" },
  { slug: "lagos", name: "Lagos", country: "NG", lat: 6.5244, lng: 3.3792, region: "Africa" },
];

async function isAdminCaller(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const c = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u } = await c.auth.getUser();
  if (!u?.user) return false;
  const { data } = await c.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
  return !!data;
}

async function fetchPlaces(lat: number, lng: number, name: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GMAPS_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
  if (!LOVABLE_API_KEY || !GMAPS_KEY) throw new Error("Google Maps connector not linked");
  const body = {
    textQuery: `chess club ${name}`,
    maxResultCount: 12,
    locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 30000 } },
  };
  const r = await fetch(`https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchText`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GMAPS_KEY,
      "Content-Type": "application/json",
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri",
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) {
    console.warn(`Places ${r.status} for ${name}: ${text}`);
    return [];
  }
  return JSON.parse(text).places ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authorized = isAuthorizedCronCaller(req) || (await isAdminCaller(req));
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { cities: inputCities, limit = 20 } = await req.json().catch(() => ({}));
    const cities = (inputCities as any[]) ?? DEFAULT_CITIES.slice(0, limit);

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const results: any[] = [];

    for (const city of cities) {
      try {
        const places = await fetchPlaces(city.lat, city.lng, city.name);
        const { error } = await admin.from("city_chess_hubs").upsert({
          city_slug: city.slug,
          city_name: city.name,
          country: city.country,
          region: city.region ?? null,
          lat: city.lat,
          lng: city.lng,
          places_cached: places,
          place_count: places.length,
          page_generated: true,
          last_refreshed_at: new Date().toISOString(),
        }, { onConflict: "city_slug" });
        results.push({ slug: city.slug, count: places.length, error: error?.message });
      } catch (e) {
        results.push({ slug: city.slug, error: String((e as Error).message ?? e) });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chess-city-hub-generator", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
