// Bulk AI generator for SEO landing pages.
// Generates real chess content into public.seo_pages for three kinds:
//   - openings-vs   → /openings/:slug     (e.g. sicilian-vs-french)
//   - how-to-beat   → /how-to-beat/:slug  (e.g. london-system)
//   - elo-guide     → /rating/:slug       (e.g. 1200-elo-chess-guide)
//
// POST body: { kind?: string, count?: number, seed?: string[] }
// - Called by cron or manually from /admin/growth (Bearer LOVABLE_API_KEY or service role).
// - Idempotent per slug (upsert on conflict).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const BASE = "https://masterchess.live";

// ---- Seed data ----
const OPENINGS = [
  "sicilian-defense", "french-defense", "caro-kann", "ruy-lopez", "italian-game",
  "queens-gambit", "kings-indian-defense", "nimzo-indian", "london-system",
  "kings-gambit", "scandinavian-defense", "pirc-defense", "modern-defense",
  "english-opening", "reti-opening", "grunfeld-defense", "slav-defense",
  "catalan-opening", "dutch-defense", "alekhines-defense", "benoni-defense",
  "vienna-game", "scotch-game", "petroff-defense", "philidor-defense",
];

const ELO_TIERS = [
  400, 600, 800, 1000, 1100, 1200, 1300, 1400, 1500, 1600,
  1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400,
];

const KINDS = ["openings-vs", "how-to-beat", "elo-guide"] as const;
type Kind = (typeof KINDS)[number];

function humanize(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Build a batch of unique slug ideas for the requested kind.
function generateSlugCandidates(kind: Kind, count: number): { slug: string; url_path: string; topic: string }[] {
  const out: { slug: string; url_path: string; topic: string }[] = [];
  if (kind === "openings-vs") {
    for (let i = 0; i < OPENINGS.length && out.length < count; i++) {
      for (let j = i + 1; j < OPENINGS.length && out.length < count; j++) {
        const a = OPENINGS[i].replace("-defense", "").replace("-opening", "").replace("-game", "").replace("-gambit", "-gambit");
        const b = OPENINGS[j].replace("-defense", "").replace("-opening", "").replace("-game", "").replace("-gambit", "-gambit");
        const slug = `${a}-vs-${b}`;
        out.push({ slug, url_path: `/openings/${slug}`, topic: `${humanize(OPENINGS[i])} vs ${humanize(OPENINGS[j])}` });
      }
    }
  } else if (kind === "how-to-beat") {
    for (const op of OPENINGS) {
      if (out.length >= count) break;
      out.push({ slug: op, url_path: `/how-to-beat/${op}`, topic: `How to beat the ${humanize(op)}` });
    }
  } else if (kind === "elo-guide") {
    for (const elo of ELO_TIERS) {
      if (out.length >= count) break;
      const slug = `${elo}-elo-chess-guide`;
      out.push({ slug, url_path: `/rating/${slug}`, topic: `${elo} ELO chess: complete improvement guide` });
    }
  }
  return out;
}

function systemPrompt(kind: Kind) {
  const kindDesc = {
    "openings-vs": "You compare two chess openings head-to-head — pawn structures, plans, typical middlegame themes, statistical tendencies, which player types prefer each side, and concrete transposition traps.",
    "how-to-beat": "You write practical anti-repertoire guides — how to punish, sidestep, or simplify against a specific chess opening for club players (1200-1900 ELO).",
    "elo-guide": "You write hyper-specific improvement roadmaps for a given ELO rating — habits to break, tactical patterns to master, opening repertoire suggestions, endgame priorities, and realistic time-to-next-100-points expectations.",
  }[kind];

  return `You are a strong chess coach writing SEO-optimized, genuinely useful long-form articles for MasterChess.live. ${kindDesc}

Return STRICT JSON matching this schema:
{
  "title": "SEO title (55-60 chars, includes primary keyword)",
  "meta_description": "155-160 chars, compelling click-worthy summary with primary keyword",
  "h1": "H1 heading (may differ slightly from title)",
  "body_md": "Long-form markdown article, 900-1400 words, with ## H2 sections. Use lists, bold key concepts, include concrete move-order examples in inline code like \`1.e4 c5 2.Nf3\`, real chess principles. NO fluff, NO 'in this article we will'. Start with a punchy hook paragraph. End with 'Play it now on MasterChess' CTA paragraph.",
  "faq": [{"q":"...","a":"..."}, ...],   // 4-6 real questions
  "keywords": ["primary keyword", "secondary", ...]  // 5-8 keywords
}

Rules:
- NEVER mention Chess.com, Lichess, Chessable, or any competitor by name.
- Cite real openings, real ideas, real ECO codes where useful.
- All content in English.
- No emoji in title/meta; sparse emoji OK in body headings.
- Return ONLY the JSON object, no markdown wrapper.`;
}

async function generateOne(kind: Kind, topic: string, slug: string): Promise<any> {
  const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt(kind) },
        { role: "user", content: `Topic: ${topic}\nURL slug: ${slug}\n\nWrite the article now. Return raw JSON.` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!aiRes.ok) {
    const t = await aiRes.text();
    throw new Error(`AI ${aiRes.status}: ${t.slice(0, 300)}`);
  }
  const j = await aiRes.json();
  const content = j.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

function buildJsonLd(kind: Kind, urlPath: string, title: string, description: string, faq: any[]) {
  const article = {
    "@context": "https://schema.org",
    "@type": kind === "how-to-beat" ? "HowTo" : "Article",
    headline: title,
    description,
    url: `${BASE}${urlPath}`,
    publisher: { "@type": "Organization", name: "MasterChess", url: BASE },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };
  const faqPage = faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;
  return faqPage ? [article, faqPage] : article;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require admin JWT or internal cron/service-role bearer
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const isServiceRole = token === SERVICE_KEY;
    const isCron = token === LOVABLE_API_KEY;
    let isAdmin = false;
    if (!isServiceRole && !isCron) {
      const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userData, error: userErr } = await authClient.auth.getUser(token);
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const svc = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: adminCheck } = await svc.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      isAdmin = !!adminCheck;
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "forbidden" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json().catch(() => ({}));
    const requestedKind: Kind | "all" = body.kind ?? "all";
    const count: number = Math.min(Math.max(body.count ?? 20, 1), 100);
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const kinds: Kind[] = requestedKind === "all" ? [...KINDS] : [requestedKind as Kind];

    const results: any[] = [];
    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const kind of kinds) {
      const perKind = Math.ceil(count / kinds.length);
      const candidates = generateSlugCandidates(kind, perKind * 3); // overproduce

      // Skip slugs already in DB
      const slugKeys = candidates.map((c) => c.url_path.slice(1));
      const { data: existing } = await supabase.from("seo_pages").select("slug").in("slug", slugKeys);
      const existingSet = new Set((existing ?? []).map((r: any) => r.slug));
      const todo = candidates.filter((c) => !existingSet.has(c.url_path.slice(1))).slice(0, perKind);

      for (const cand of todo) {
        try {
          const article = await generateOne(kind, cand.topic, cand.slug);
          const jsonld = buildJsonLd(kind, cand.url_path, article.title, article.meta_description, article.faq ?? []);
          const relatedSlugs = todo
            .filter((c) => c.slug !== cand.slug)
            .slice(0, 6)
            .map((c) => c.url_path.slice(1));

          const { error } = await supabase.from("seo_pages").upsert(
            {
              slug: cand.url_path.slice(1), // e.g. "openings/sicilian-vs-french"
              kind,
              lang: "en",
              title: String(article.title ?? cand.topic).slice(0, 200),
              meta_description: String(article.meta_description ?? "").slice(0, 300),
              h1: String(article.h1 ?? article.title ?? cand.topic).slice(0, 200),
              body_md: String(article.body_md ?? ""),
              jsonld,
              faq: article.faq ?? [],
              related_slugs: relatedSlugs,
              keywords: article.keywords ?? [],
              quality_score: 80,
              status: "published",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "slug" },
          );
          if (error) throw error;
          generated++;
          results.push({ kind, slug: cand.url_path });
        } catch (e) {
          errors++;
          console.error(`fail ${cand.url_path}`, e);
        }
      }
      skipped += candidates.length - todo.length;
    }

    return new Response(
      JSON.stringify({ ok: true, generated, skipped, errors, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("seo-content-generator fatal", e);
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
