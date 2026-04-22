// Admin-only edge function: probes DNS for the email sender domain
// and returns a structured status + per-record diagnostics.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SENDER_DOMAIN = "notify.masterchess.com";

// Expected DNS pattern for a Lovable-managed sender subdomain
const EXPECTED_NS = ["ns3.lovable.cloud", "ns4.lovable.cloud"];

type RecordCheck = {
  type: string;
  name: string;
  expected: string[];
  found: string[];
  ok: boolean;
  note?: string;
};

async function dohQuery(name: string, type: string): Promise<string[]> {
  // Use Cloudflare DoH to bypass any local DNS caches on the edge
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { accept: "application/dns-json" } });
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.Answer) return [];
  return data.Answer
    .filter((a: any) => a.type !== undefined)
    .map((a: any) => String(a.data || "").replace(/\.$/, "").replace(/^"|"$/g, ""));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ---- AuthN: must be a logged-in user ----
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- AuthZ: must be admin ----
    const { data: isAdmin, error: roleErr } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Run DNS checks ----
    const [nsRecords, mxRecords, spfTxt, dkimTxt, dmarcTxt] = await Promise.all([
      dohQuery(SENDER_DOMAIN, "NS"),
      dohQuery(SENDER_DOMAIN, "MX"),
      dohQuery(SENDER_DOMAIN, "TXT"),
      dohQuery(`lovable._domainkey.${SENDER_DOMAIN}`, "TXT"),
      dohQuery(`_dmarc.${SENDER_DOMAIN}`, "TXT"),
    ]);

    const nsOk = EXPECTED_NS.every((ns) =>
      nsRecords.some((r) => r.toLowerCase().includes(ns.toLowerCase())),
    );

    const checks: RecordCheck[] = [
      {
        type: "NS",
        name: SENDER_DOMAIN,
        expected: EXPECTED_NS,
        found: nsRecords,
        ok: nsOk,
        note: nsOk
          ? "Subdomain is delegated to Lovable nameservers."
          : "NS records missing or wrong. Add the two NS records at your domain registrar for the 'notify' subdomain.",
      },
      {
        type: "MX",
        name: SENDER_DOMAIN,
        expected: ["(any MX provided by Lovable)"],
        found: mxRecords,
        ok: mxRecords.length > 0,
        note: mxRecords.length > 0
          ? "MX record is present."
          : "No MX record yet. Auto-managed once NS delegation propagates.",
      },
      {
        type: "TXT (SPF)",
        name: SENDER_DOMAIN,
        expected: ["v=spf1 ..."],
        found: spfTxt.filter((r) => r.toLowerCase().startsWith("v=spf1")),
        ok: spfTxt.some((r) => r.toLowerCase().startsWith("v=spf1")),
        note: spfTxt.some((r) => r.toLowerCase().startsWith("v=spf1"))
          ? "SPF record found."
          : "SPF missing. Auto-managed by Lovable once NS delegation propagates.",
      },
      {
        type: "TXT (DKIM)",
        name: `lovable._domainkey.${SENDER_DOMAIN}`,
        expected: ["v=DKIM1; ..."],
        found: dkimTxt,
        ok: dkimTxt.some((r) => r.toLowerCase().includes("v=dkim1")),
        note: dkimTxt.some((r) => r.toLowerCase().includes("v=dkim1"))
          ? "DKIM key found."
          : "DKIM not yet visible. Usually appears within a few hours of NS propagation.",
      },
      {
        type: "TXT (DMARC)",
        name: `_dmarc.${SENDER_DOMAIN}`,
        expected: ["v=DMARC1; ..."],
        found: dmarcTxt,
        ok: dmarcTxt.some((r) => r.toLowerCase().includes("v=dmarc1")),
        note: dmarcTxt.some((r) => r.toLowerCase().includes("v=dmarc1"))
          ? "DMARC policy found."
          : "DMARC optional but recommended. Auto-managed by Lovable.",
      },
    ];

    const requiredOk = checks.find((c) => c.type === "NS")?.ok && checks.find((c) => c.type === "TXT (DKIM)")?.ok;
    const allOk = checks.every((c) => c.ok);

    let overall: "verified" | "partial" | "pending" | "failed";
    if (allOk) overall = "verified";
    else if (requiredOk) overall = "partial";
    else if (nsOk) overall = "pending";
    else overall = "failed";

    return new Response(
      JSON.stringify({
        domain: SENDER_DOMAIN,
        checked_at: new Date().toISOString(),
        overall,
        checks,
        troubleshooting: overall === "verified"
          ? []
          : [
              !nsOk && "Add NS records 'ns3.lovable.cloud' and 'ns4.lovable.cloud' for the 'notify' subdomain at your domain registrar.",
              !nsOk && "DNS propagation can take up to 72 hours after adding NS records.",
              nsOk && !allOk && "NS delegation is live. SPF / DKIM / DMARC will appear automatically within a few hours.",
              "Use 'Recheck Now' after adding records to refresh status.",
            ].filter(Boolean),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("check-email-domain error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
