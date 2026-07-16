// Resend campaigns: welcome, re-engage, weekly rank digest, tournament reminder, custom broadcast
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const GATEWAY = "https://connector-gateway.lovable.dev/resend";
const FROM = "MasterChess <no-reply@masterchess.live>";

async function send(to: string, subject: string, html: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) throw new Error("Resend not configured");
  const res = await fetch(`${GATEWAY}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  return { status: res.status, body: await res.text() };
}

function tpl(title: string, body: string, cta?: { label: string; url: string }) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#0a0a0a;color:#fff;padding:32px">
    <div style="max-width:560px;margin:0 auto;background:linear-gradient(135deg,#111,#1a1a1a);border:1px solid #d4af37;border-radius:16px;padding:32px">
      <h1 style="color:#d4af37;margin:0 0 16px">${title}</h1>
      <div style="line-height:1.6;color:#e5e5e5">${body}</div>
      ${cta ? `<a href="${cta.url}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#d4af37;color:#000;text-decoration:none;border-radius:8px;font-weight:600">${cta.label}</a>` : ""}
      <p style="margin-top:32px;font-size:12px;color:#666">MasterChess.live · Authentic chess, no bots</p>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { action, to, subject, html, userId, days = 7 } = await req.json();
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    if (action === "welcome" && to) {
      const r = await send(to, "Welcome to MasterChess 👑", tpl("Welcome, Grandmaster.", "You're in. Start with a Battle Royale, climb the ELO ladder, or challenge Nikola.", { label: "Play Now", url: "https://masterchess.live/play" }));
      return new Response(JSON.stringify(r), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "reengage") {
      const since = new Date(Date.now() - days * 864e5).toISOString();
      const { data: users } = await supa.from("profiles").select("id,username,email").lt("updated_at", since).not("email", "is", null).limit(50);
      const results = [];
      for (const u of users ?? []) {
        if (!u.email) continue;
        const r = await send(u.email, "The board misses you ♟️", tpl(`Come back, ${u.username ?? "player"}`, `You haven't played in ${days} days. A new Battle Royale starts every hour.`, { label: "Return to Battle", url: "https://masterchess.live/battle-royale" }));
        results.push({ email: u.email, ...r });
      }
      return new Response(JSON.stringify({ sent: results.length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "digest" && userId) {
      const { data: p } = await supa.from("profiles").select("email,username,elo_rating").eq("id", userId).maybeSingle();
      if (!p?.email) throw new Error("no email");
      const r = await send(p.email, `Your weekly rank: ${p.elo_rating} ELO`, tpl("This week on the board", `Rating: <b>${p.elo_rating}</b><br/>Keep climbing — top 100 is within reach.`, { label: "View Stats", url: "https://masterchess.live/stats" }));
      return new Response(JSON.stringify(r), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "broadcast" && to && subject && html) {
      const r = await send(to, subject, html);
      return new Response(JSON.stringify(r), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("invalid action");
  } catch (e) {
    console.error("resend-campaign", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
