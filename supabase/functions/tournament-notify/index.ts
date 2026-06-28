// tournament-notify — broadcast a push notification to every registered player
// of a given tournament. Callable by admins or other edge functions (service role).
// Body: { tournament_id, title, body, url?, tag? }

import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  tournament_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  url: z.string().max(500).optional(),
  tag: z.string().max(120).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { tournament_id, title, body, url, tag } = parsed.data;

    const supaUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supaUrl, serviceKey);

    // Auth: allow service role calls (cron/other functions) or admin users.
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.includes(serviceKey)) {
      const userClient = createClient(supaUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { data: regs, error: rErr } = await admin
      .from("tournament_registrations")
      .select("user_id")
      .eq("tournament_id", tournament_id);
    if (rErr) throw rErr;
    const user_ids = Array.from(new Set((regs ?? []).map((r: any) => r.user_id))).filter(Boolean);
    if (user_ids.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no_registrations" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    const failures: string[] = [];
    for (let i = 0; i < user_ids.length; i += 500) {
      const chunk = user_ids.slice(i, i + 500);
      const { data, error } = await admin.functions.invoke("push-send", {
        body: {
          user_ids: chunk,
          type: "tournaments",
          payload: { title, body, url: url || "/dragan-brakus", tag: tag || `tnt-${tournament_id}` },
        },
      });
      if (error) failures.push(error.message);
      else sent += (data as any)?.sent ?? chunk.length;
    }

    return new Response(JSON.stringify({ ok: true, sent, users: user_ids.length, failures }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
