// Posts MasterChess events to a Discord channel via webhook.
// Requires secret DISCORD_WEBHOOK_URL. Optional DISCORD_TOURNAMENTS_WEBHOOK_URL for tournament-specific channel.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventType =
  | "tournament_starting"
  | "tournament_started"
  | "tournament_finished"
  | "title_awarded"
  | "weekly_champion"
  | "custom";

interface Payload {
  event: EventType;
  channel?: "default" | "tournaments";
  content?: string;
  title?: string;
  description?: string;
  url?: string;
  color?: number; // decimal color
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  thumbnail_url?: string;
  // Convenience: build embed from tournament_id
  tournament_id?: string;
}

const SITE = "https://masterchess.live";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Authorize: cron/service caller OR authenticated admin.
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
        const admin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
        if (isAdmin) authorized = true;
      }
    }
  }
  if (!authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Payload;
    const channel = body.channel ?? "default";
    const webhook =
      channel === "tournaments"
        ? Deno.env.get("DISCORD_TOURNAMENTS_WEBHOOK_URL") ?? Deno.env.get("DISCORD_WEBHOOK_URL")
        : Deno.env.get("DISCORD_WEBHOOK_URL");

    if (!webhook) {
      return new Response(
        JSON.stringify({ error: "DISCORD_WEBHOOK_URL not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Enrich from tournament if needed
    let embedTitle = body.title ?? "MasterChess";
    let embedDesc = body.description ?? "";
    let embedUrl = body.url ?? SITE;
    let color = body.color ?? 0xd4af37; // gold default
    const fields = body.fields ?? [];

    if (body.tournament_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: t } = await supabase
        .from("tournaments")
        .select("id,name,format,tournament_type,time_control,starts_at,prize_pool,description")
        .eq("id", body.tournament_id)
        .maybeSingle();
      if (t) {
        embedTitle = `${eventEmoji(body.event)} ${t.name}`;
        embedUrl = `${SITE}/tournaments/${t.id}`;
        embedDesc = body.description ?? t.description ?? `${t.format ?? t.tournament_type} • ${t.time_control}`;
        fields.push(
          { name: "Format", value: `${t.format ?? t.tournament_type}`, inline: true },
          { name: "Time", value: `${t.time_control}`, inline: true },
        );
        if (t.starts_at) fields.push({ name: "Starts", value: `<t:${Math.floor(new Date(t.starts_at).getTime() / 1000)}:R>`, inline: true });
      }
    }

    if (body.event === "tournament_starting") color = 0xfacc15;
    if (body.event === "tournament_started") color = 0x22c55e;
    if (body.event === "tournament_finished") color = 0xd4af37;
    if (body.event === "weekly_champion") color = 0xff9900;

    const embed = {
      title: embedTitle,
      url: embedUrl,
      description: embedDesc,
      color,
      fields,
      thumbnail: body.thumbnail_url ? { url: body.thumbnail_url } : undefined,
      timestamp: new Date().toISOString(),
      footer: { text: "MasterChess • masterchess.live" },
    };

    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: body.content,
        username: "MasterChess",
        avatar_url: `${SITE}/og-image.jpg`,
        embeds: [embed],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("discord webhook failed", resp.status, text);
      return new Response(JSON.stringify({ error: "discord_failed", status: resp.status, body: text }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("discord-webhook-publish error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function eventEmoji(e: EventType): string {
  switch (e) {
    case "tournament_starting": return "⏰";
    case "tournament_started": return "♟️";
    case "tournament_finished": return "🏆";
    case "title_awarded": return "🎖️";
    case "weekly_champion": return "👑";
    default: return "📣";
  }
}
