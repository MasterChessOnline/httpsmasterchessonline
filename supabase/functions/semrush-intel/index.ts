// Semrush multi-action intel: user limits, domain overview, backlinks, keyword research, competitors
import { corsHeaders } from "../_shared/cors.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/semrush";

async function sem(path: string, params: Record<string, string>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SEMRUSH_API_KEY = Deno.env.get("SEMRUSH_API_KEY");
  if (!LOVABLE_API_KEY || !SEMRUSH_API_KEY) throw new Error("Semrush not configured");
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GATEWAY}${path}?${qs}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": SEMRUSH_API_KEY,
      "Allow-Limit-Offset": "true",
    },
  });
  const text = await res.text();
  let body: unknown;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { action = "overview", domain = "masterchess.live", database = "us", phrase, target } = await req.json().catch(() => ({}));
    const out: Record<string, unknown> = { action };

    switch (action) {
      case "limits":
        out.data = await sem("/user/limits", {});
        break;
      case "overview": {
        out.ranks = await sem("/domains/domain_ranks", { domain, database, export_columns: "Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac" });
        out.organic = await sem("/domains/domain_organic", { domain, database, display_limit: "20", export_columns: "Ph,Po,Nq,Cp,Tr,Ur" });
        out.backlinks_overview = await sem("/backlinks/backlinks_overview", { target: domain, target_type: "root_domain" });
        break;
      }
      case "keywords":
        if (!phrase) throw new Error("phrase required");
        out.related = await sem("/keywords/phrase_related", { phrase, database, display_limit: "30", export_columns: "Ph,Nq,Cp,Co,Kd" });
        out.questions = await sem("/keywords/phrase_questions", { phrase, database, display_limit: "20", export_columns: "Ph,Nq,Cp,Kd" });
        break;
      case "backlinks":
        out.data = await sem("/backlinks/backlinks", { target: target ?? domain, target_type: "root_domain", display_limit: "50", export_columns: "source_url,source_title,anchor,external_num,internal_num,first_seen,last_seen" });
        out.refdomains = await sem("/backlinks/backlinks_refdomains", { target: target ?? domain, target_type: "root_domain", display_limit: "30", export_columns: "domain,domain_ascore,backlinks_num,ip" });
        break;
      case "competitors":
        out.data = await sem("/domains/domain_domains", { domain, database, display_limit: "20", export_columns: "Dn,Cr,Np,Or,Ot,Oc" });
        break;
      default:
        throw new Error(`unknown action ${action}`);
    }

    return new Response(JSON.stringify(out), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("semrush-intel error", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
