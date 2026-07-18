// Consumes opportunities from seo_query_opportunities (acted_on=false)
// and asks seo-content-generator to write matching pages. Admin OR cron.
import { corsHeaders } from "../_shared/cors.ts";
import { isAuthorizedCronCaller } from "../_shared/cron-auth.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function classifyKind(query: string): { kind: string; slug: string; url_path: string } | null {
  const q = query.toLowerCase().trim();
  // "how to beat X"
  const beat = q.match(/^(?:how (?:to|do i)|beat|defeat)\s+(?:the\s+)?(.+?)(?:\s+chess)?$/);
  if (beat) {
    const slug = slugify(beat[1]);
    return { kind: "how-to-beat", slug, url_path: `/how-to-beat/${slug}` };
  }
  // "X vs Y"
  const vs = q.match(/^(.+?)\s+vs\.?\s+(.+)$/);
  if (vs) {
    const slug = `${slugify(vs[1])}-vs-${slugify(vs[2])}`;
    return { kind: "openings-vs", slug, url_path: `/openings/${slug}` };
  }
  // ELO like "1500 elo"
  const elo = q.match(/(\d{3,4})\s*elo/);
  if (elo) {
    const slug = `${elo[1]}-elo-chess-guide`;
    return { kind: "elo-guide", slug, url_path: `/rating/${slug}` };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!isAuthorizedCronCaller(req)) {
      const auth = req.headers.get("Authorization");
      const uc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth ?? "" } },
      });
      const { data: u } = await uc.auth.getUser();
      const { data: isAdmin } = u?.user ? await uc.rpc("has_role", { _user_id: u.user.id, _role: "admin" }) : { data: false };
      if (!isAdmin) return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { limit = 10 } = await req.json().catch(() => ({}));
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: opps } = await admin
      .from("seo_query_opportunities")
      .select("*")
      .eq("acted_on", false)
      .order("impressions", { ascending: false })
      .limit(limit);

    const processed: any[] = [];
    for (const o of opps ?? []) {
      const classification = classifyKind(o.query);
      if (!classification) {
        processed.push({ query: o.query, skipped: "no-kind-match" });
        continue;
      }
      // Check if already exists
      const { data: existing } = await admin
        .from("seo_pages")
        .select("slug")
        .eq("slug", classification.slug)
        .maybeSingle();
      if (existing) {
        await admin.from("seo_query_opportunities").update({ acted_on: true, suggested_page: classification.url_path }).eq("id", o.id);
        processed.push({ query: o.query, status: "already-exists", url: classification.url_path });
        continue;
      }

      // Invoke seo-content-generator (idempotent, upserts)
      const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/seo-content-generator`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ kind: classification.kind, count: 1, seed: [classification.slug] }),
      });
      const genResult = await r.text().catch(() => "");
      const ok = r.ok;
      await admin.from("seo_query_opportunities").update({
        acted_on: ok,
        suggested_page: classification.url_path,
      }).eq("id", o.id);
      processed.push({ query: o.query, status: ok ? "generated" : "failed", url: classification.url_path, note: ok ? undefined : genResult.slice(0, 200) });
    }

    return new Response(JSON.stringify({ ok: true, processed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gsc-auto-generate-pages", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
