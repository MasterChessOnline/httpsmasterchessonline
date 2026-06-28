// Admin-only: seed deterministic "test bot" registrations onto a tournament so
// admins can validate the full FIDE Dutch Swiss flow (pairings, Buchholz, etc.)
// before the real event. Bots are flagged is_test_bot=true and filtered out of
// public leaderboards. A second action ("purge") removes them in one click.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BOT_FIRST = ["Aleksa","Bogdan","Cvetan","Dejan","Emil","Filip","Goran","Hadži","Ilija","Jovan","Kosta","Luka","Marko","Nenad","Ognjen","Petar","Rade","Stevan","Tihomir","Uroš","Vlada","Zoran","Andrej","Boris","Vuk","Damjan","Eror","Filip","Gavrilo","Hristos","Igor","Jakov"];
const BOT_LAST  = ["Petrović","Jovanović","Nikolić","Marković","Đorđević","Stojanović","Popović","Stanković","Pavlović","Kostić","Cvetković","Ilić","Vasić","Lukić","Mitrović","Tomić","Ranđelović","Krstić","Aleksić","Vučić","Babić","Cvijić","Dragić","Erić","Filipović","Gajić","Hadžić","Inđić","Janković","Krstajić","Lazić","Milić"];

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

    // Default action: seed
    const n = Math.max(2, Math.min(128, Number(count) || 32));
    const rows = [];
    for (let i = 0; i < n; i++) {
      const first = BOT_FIRST[i % BOT_FIRST.length];
      const last  = BOT_LAST[(i * 7) % BOT_LAST.length];
      const rating = rand(1200, 2400);
      rows.push({
        tournament_id,
        user_id: crypto.randomUUID(),       // synthetic; bots are never real users
        is_test_bot: true,
        first_name: `${first}`,
        last_name: `${last} (bot)`,
        fide_id: `TB${String(100000 + i).padStart(7, "0")}`,
        fide_blitz_rating: rating,
        rating_at_join: rating,
        federation: "SRB",
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        score: 0,
      });
    }

    const { error, data } = await service.from("tournament_registrations").insert(rows).select("id");
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, seeded: data?.length ?? 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
