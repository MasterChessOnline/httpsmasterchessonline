// Awards titles + cosmetics to top finishers of a finished tournament.
// Called by manage-tournament when status flips to 'finished', or manually by admin.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AwardPayload {
  tournament_id: string;
  // Optional override for weekly cron use case
  title_override?: { key: string; label: string };
}

const TITLES = {
  champion: { key: "tournament_champion", label: "Tournament Champion" },
  runner_up: { key: "tournament_runner_up", label: "Runner-up" },
  bronze: { key: "tournament_bronze", label: "Bronze Medalist" },
  unbeaten: { key: "unbeaten_player", label: "Unbeaten Player" },
  tactical: { key: "tactical_genius", label: "Tactical Genius" },
  killer: { key: "checkmate_killer", label: "Checkmate Killer" },
} as const;

const COSMETICS: Record<string, string[]> = {
  tournament_champion: ["piece_set:gold_royal", "board_theme:neon_arena", "effect:checkmate_explosion"],
  tournament_runner_up: ["piece_set:fire_ice"],
  tournament_bronze: ["board_theme:ancient_stone"],
  unbeaten_player: ["effect:freeze"],
  tactical_genius: ["effect:electric_trail"],
  checkmate_killer: ["piece_set:cyberpunk"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Authorize: cron/service caller, OR authenticated admin/organizer.
    let authorized = isAuthorizedCronCaller(req);
    if (!authorized) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const userClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          const { data: canManage } = await supabase.rpc("can_manage_tournaments", { _user_id: user.id });
          if (canManage) authorized = true;
        }
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as AwardPayload;
    if (!body.tournament_id) {
      return new Response(JSON.stringify({ error: "tournament_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch tournament + ranked registrations
    const { data: tour } = await supabase
      .from("tournaments")
      .select("id, name, status, season")
      .eq("id", body.tournament_id)
      .maybeSingle();
    if (!tour) {
      return new Response(JSON.stringify({ error: "tournament not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: regs } = await supabase
      .from("tournament_registrations")
      .select("user_id, score, tiebreak_buchholz, wins, losses, no_mistake_bonus, fast_win_bonus")
      .eq("tournament_id", tour.id)
      .order("score", { ascending: false })
      .order("tiebreak_buchholz", { ascending: false });

    if (!regs?.length) {
      return new Response(JSON.stringify({ ok: true, awarded: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const season = (tour as any).season ?? new Date().toISOString().slice(0, 7);
    const awarded: any[] = [];

    const podium: Array<{ user_id: string; title: { key: string; label: string } }> = [];
    if (regs[0]) podium.push({ user_id: regs[0].user_id, title: TITLES.champion });
    if (regs[1]) podium.push({ user_id: regs[1].user_id, title: TITLES.runner_up });
    if (regs[2]) podium.push({ user_id: regs[2].user_id, title: TITLES.bronze });

    // Special titles
    const unbeaten = regs.filter((r: any) => (r.losses ?? 0) === 0 && (r.wins ?? 0) > 0);
    const tactical = [...regs].sort(
      (a: any, b: any) => (b.fast_win_bonus ?? 0) - (a.fast_win_bonus ?? 0),
    )[0];
    const killer = [...regs].sort(
      (a: any, b: any) => (b.no_mistake_bonus ?? 0) - (a.no_mistake_bonus ?? 0),
    )[0];

    const all: Array<{ user_id: string; title: { key: string; label: string } }> = [...podium];
    unbeaten.forEach((r: any) => all.push({ user_id: r.user_id, title: TITLES.unbeaten }));
    if (tactical && (tactical as any).fast_win_bonus > 0)
      all.push({ user_id: tactical.user_id, title: TITLES.tactical });
    if (killer && (killer as any).no_mistake_bonus > 0)
      all.push({ user_id: killer.user_id, title: TITLES.killer });

    for (const a of all) {
      const { data } = await supabase.rpc("award_tournament_title", {
        _user_id: a.user_id,
        _title_key: a.title.key,
        _title_label: a.title.label,
        _season: season,
        _tournament_id: tour.id,
        _metadata: { tournament_name: tour.name },
      });
      awarded.push({ user_id: a.user_id, title: a.title.key, id: data });

      // Grant cosmetics to inventory
      for (const sku of COSMETICS[a.title.key] ?? []) {
        const [item_type, item_key] = sku.split(":");
        await supabase
          .from("user_inventory")
          .upsert(
            { user_id: a.user_id, item_key, item_type, price_paid: 0 },
            { onConflict: "user_id,item_key" },
          );
      }

      // Champion gets gold animated username for 7 days + Coach Pro
      if (a.title.key === "tournament_champion") {
        const until = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
        await supabase
          .from("profiles")
          .update({ username_style: "gold_animated", coach_pro_until: until })
          .eq("id", a.user_id);
      }
    }

    return new Response(JSON.stringify({ ok: true, awarded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("award-tournament-titles error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
