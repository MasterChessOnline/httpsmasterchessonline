// Tournament anti-cheat signal collector.
// Clients POST suspicious signals (tab switches, impossibly fast moves, etc.).
// In `strict` mode, accumulated severity above the threshold auto-removes the player.
//
// Body: { tournament_id, signal_type, severity?, details? }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SeveritySchema = z.enum(["low", "medium", "high", "critical"]);
const SignalSchema = z.object({
  tournament_id: z.string().uuid(),
  game_id: z.string().uuid().optional().nullable(),
  signal_type: z.enum([
    "tab_switch",
    "fast_moves",
    "perfect_accuracy",
    "engine_match",
    "manual",
  ]),
  severity: SeveritySchema.optional(),
  details: z.record(z.string(), z.any()).optional(),
});

// Severity → numeric weight for accumulation
const WEIGHT: Record<string, number> = { low: 1, medium: 3, high: 6, critical: 10 };

// Strict-mode auto-removal threshold (sum of unresolved flag weights)
const STRICT_REMOVAL_THRESHOLD = 12;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Validate caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
  const userId = claims.claims.sub as string;

  // Parse + validate body
  const parsed = SignalSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: parsed.error.flatten().fieldErrors }, 400);
  }
  const { tournament_id, game_id, signal_type, details } = parsed.data;
  const severity = parsed.data.severity ?? defaultSeverity(signal_type);

  // Service-role client for inserts/updates that bypass RLS
  const admin = createClient(supabaseUrl, serviceKey);

  // Confirm the user is registered in this tournament
  const { data: reg } = await admin
    .from("tournament_registrations")
    .select("id")
    .eq("tournament_id", tournament_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!reg) return json({ error: "Not registered in this tournament" }, 403);

  // Get tournament's anti-cheat level
  const { data: tournament } = await admin
    .from("tournaments")
    .select("anti_cheat_level, status")
    .eq("id", tournament_id)
    .maybeSingle();
  if (!tournament) return json({ error: "Tournament not found" }, 404);

  // Insert the flag
  const { data: flag, error: insErr } = await admin
    .from("tournament_anti_cheat_flags")
    .insert({
      tournament_id,
      user_id: userId,
      game_id: game_id ?? null,
      signal_type,
      severity,
      details: details ?? null,
    })
    .select()
    .single();

  if (insErr) return json({ error: insErr.message }, 500);

  let action: "logged" | "warned" | "removed" = "logged";

  // STRICT mode: tally unresolved flag weights and auto-remove above threshold
  if (tournament.anti_cheat_level === "strict" && tournament.status === "active") {
    const { data: openFlags } = await admin
      .from("tournament_anti_cheat_flags")
      .select("severity")
      .eq("tournament_id", tournament_id)
      .eq("user_id", userId)
      .eq("resolved", false);

    const total = (openFlags || [])
      .reduce((sum, f) => sum + (WEIGHT[f.severity as string] ?? 0), 0);

    if (total >= STRICT_REMOVAL_THRESHOLD) {
      await admin
        .from("tournament_registrations")
        .delete()
        .eq("tournament_id", tournament_id)
        .eq("user_id", userId);

      // Forfeit any active games for this player in the tournament
      const { data: openPairings } = await admin
        .from("tournament_pairings")
        .select("id, white_player_id, black_player_id, game_id")
        .eq("tournament_id", tournament_id)
        .is("result", null);

      for (const p of openPairings || []) {
        if (p.white_player_id !== userId && p.black_player_id !== userId) continue;
        const result = p.white_player_id === userId ? "0-1" : "1-0";
        await admin.from("tournament_pairings").update({ result }).eq("id", p.id);
        if (p.game_id) {
          await admin
            .from("online_games")
            .update({ status: "finished", result })
            .eq("id", p.game_id);
        }
      }

      // Mark flags as resolved with action 'removed'
      await admin
        .from("tournament_anti_cheat_flags")
        .update({ resolved: true, resolution: "removed", resolved_at: new Date().toISOString() })
        .eq("tournament_id", tournament_id)
        .eq("user_id", userId)
        .eq("resolved", false);

      action = "removed";
    } else if (total >= STRICT_REMOVAL_THRESHOLD / 2) {
      action = "warned";
    }
  }

  return json({ flag_id: flag.id, action, anti_cheat_level: tournament.anti_cheat_level });
});

function defaultSeverity(signal: string): "low" | "medium" | "high" | "critical" {
  switch (signal) {
    case "tab_switch": return "low";
    case "fast_moves": return "medium";
    case "perfect_accuracy": return "high";
    case "engine_match": return "critical";
    case "manual": return "high";
    default: return "low";
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
