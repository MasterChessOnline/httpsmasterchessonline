// Admin-only: seed deterministic "test bot" registrations onto a tournament so
// admins can validate the full FIDE Dutch Swiss flow (pairings, Buchholz, etc.)
// before the real event. Bots are flagged is_test_bot=true and filtered out of
// public leaderboards. A second action ("purge") removes them in one click.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_FIRST = ["Aleksa","Bogdan","Cvetan","Dejan","Emil","Filip","Goran","Ilija","Jovan","Kosta","Luka","Marko","Nenad","Ognjen","Petar","Rade","Stevan","Tihomir","Uroš","Vlada","Zoran","Andrej","Boris","Vuk","Damjan","Igor","Jakov","Magnus","Hikaru","Fabiano","Wesley","Levon","Anish","Maxime","Ding","Ian","Vladimir","Viktor","Sergei","Pavel","Dmitri","Alexei","Mikhail","Nikolai","Lev","Boris","Garry","Vasyl","Yuriy","Stefan","Klaus","Hans","Niels","Lars","Erik","Jonas","Aaron","Daniel","Samuel","Benjamin","Joshua","Ethan","Liam","Noah","Mateo","Diego","Carlos","Miguel","Rafael","Joao","Bruno","Andres","Pedro","Pablo","Sergio","Hugo","Adrien","Etienne","Pierre","Lucas","Antoine","Mohammed","Hassan","Ali","Omar","Rashid","Hamza","Karim"];
const BOT_LAST  = ["Petrović","Jovanović","Nikolić","Marković","Đorđević","Stojanović","Popović","Stanković","Pavlović","Kostić","Cvetković","Ilić","Vasić","Lukić","Mitrović","Tomić","Ranđelović","Krstić","Aleksić","Vučić","Babić","Dragić","Filipović","Gajić","Janković","Lazić","Milić","Carlsen","Nakamura","Caruana","So","Aronian","Giri","Vachier","Liren","Nepomniachtchi","Kramnik","Korchnoi","Karjakin","Eljanov","Svidler","Grischuk","Andreikin","Inarkiev","Tomashevsky","Müller","Schmidt","Becker","Hansen","Andersson","Lindberg","Berg","Cohen","Levy","Goldberg","Stein","Klein","Walsh","Murphy","O'Brien","Kelly","Murphy","Silva","Santos","Souza","Oliveira","Costa","Pereira","Almeida","Garcia","Rodriguez","Martinez","Hernandez","Lopez","Sanchez","Gomez","Fernandez","Diaz","Romero","Dubois","Martin","Bernard","Petit","Robert","Richard","Al-Rashid","Hussein","Hakim","Mansour","Khalil","Salim","Younis"];
const TITLES = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"CM","CM","FM","FM","IM","GM"]; // realistic distribution
const FEDERATIONS = ["SRB","SRB","SRB","SRB","CRO","BIH","SLO","MKD","MNE","RUS","UKR","NOR","USA","IND","CHN","FRA","GER","NED","ESP","ARG","BRA","ARM","AZE","HUN","POL","CZE","ROU","BUL","GRE","TUR","ISR","EGY","MAR"];


function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const service = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
  });

  const { data: { user } } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (!(await isAdmin(service, user.id))) {
    return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const { action, tournament_id, count = 32 } = body;

  if (!tournament_id) {
    return new Response(JSON.stringify({ error: "tournament_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    if (action === "purge") {
      const { error, count: deleted } = await service
        .from("tournament_registrations")
        .delete({ count: "exact" })
        .eq("tournament_id", tournament_id)
        .eq("is_test_bot", true);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, purged: deleted ?? 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Default action: seed (cap raised to 512 for stress testing)
    const n = Math.max(2, Math.min(512, Number(count) || 32));
    const rows = [];
    for (let i = 0; i < n; i++) {
      const first = BOT_FIRST[(i * 13) % BOT_FIRST.length];
      const last  = BOT_LAST[(i * 7) % BOT_LAST.length];
      const title = TITLES[(i * 17) % TITLES.length];
      const fed   = FEDERATIONS[(i * 11) % FEDERATIONS.length];
      // Title-correlated rating distribution for realism
      const baseMin = title === "GM" ? 2450 : title === "IM" ? 2300 : title === "FM" ? 2150 : title === "CM" ? 2000 : 1200;
      const baseMax = title === "GM" ? 2750 : title === "IM" ? 2450 : title === "FM" ? 2300 : title === "CM" ? 2150 : 2050;
      const rating = rand(baseMin, baseMax);
      rows.push({
        tournament_id,
        user_id: crypto.randomUUID(),       // synthetic; bots are never real users
        is_test_bot: true,
        first_name: first,
        last_name: `${last} (bot)`,
        fide_id: `TB${String(100000 + i).padStart(7, "0")}`,
        fide_title: title,
        fide_blitz_rating: rating,
        rating_at_join: rating,
        federation: fed,
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        score: 0,
      });
    }

    // Chunk inserts so 512 rows don't exceed payload limits
    const CHUNK = 100;
    let total = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);
      const { error, data } = await service.from("tournament_registrations").insert(slice).select("id");
      if (error) throw error;
      total += data?.length ?? 0;
    }
    return new Response(JSON.stringify({ ok: true, seeded: total }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
