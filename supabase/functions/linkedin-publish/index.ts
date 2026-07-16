// LinkedIn: fetch member profile + publish UGC text/article post
import { corsHeaders } from "../_shared/cors.ts";

const GATEWAY = "https://connector-gateway.lovable.dev/linkedin";

function auth() {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const LINKEDIN_API_KEY = Deno.env.get("LINKEDIN_API_KEY");
  if (!LOVABLE_API_KEY || !LINKEDIN_API_KEY) throw new Error("LinkedIn not configured");
  return { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": LINKEDIN_API_KEY };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { action = "profile", text, articleUrl, articleTitle } = await req.json().catch(() => ({}));
    const headers = auth();

    if (action === "profile") {
      const r = await fetch(`${GATEWAY}/v2/userinfo`, { headers });
      return new Response(await r.text(), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "post") {
      if (!text) throw new Error("text required");
      const me = await (await fetch(`${GATEWAY}/v2/userinfo`, { headers })).json();
      const authorUrn = `urn:li:person:${me.sub}`;
      const body: Record<string, unknown> = {
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: articleUrl ? "ARTICLE" : "NONE",
            ...(articleUrl ? { media: [{ status: "READY", originalUrl: articleUrl, title: { text: articleTitle ?? "MasterChess" } }] } : {}),
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      };
      const r = await fetch(`${GATEWAY}/v2/ugcPosts`, { method: "POST", headers: { ...headers, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" }, body: JSON.stringify(body) });
      return new Response(await r.text(), { status: r.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("invalid action");
  } catch (e) {
    console.error("linkedin-publish", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
