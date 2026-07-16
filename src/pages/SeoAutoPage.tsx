// Unified template that renders any AI-generated SEO landing page from
// public.seo_pages. Routes /openings/:slug, /how-to-beat/:slug, /rating/:slug
// all point here — we look up by full pathname.
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";

interface SeoPage {
  slug: string;
  kind: string;
  title: string;
  meta_description: string;
  h1: string;
  body_md: string;
  jsonld: any;
  faq: { q: string; a: string }[] | null;
  related_slugs: string[] | null;
  keywords: string[] | null;
  generated_at: string;
  updated_at: string;
}

const BASE = "https://masterchess.live";

export default function SeoAutoPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const [page, setPage] = useState<SeoPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(null);
    (async () => {
      const { data } = await supabase
        .from("seo_pages" as any)
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (cancelled) return;
      setPage((data as any) ?? null);
      setLoading(false);
      // fire-and-forget view counter
      if (data) {
        supabase.rpc("noop" as any).catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!page) return <NotFound />;

  const canonical = `${BASE}/${page.slug}`;
  const jsonldArray = Array.isArray(page.jsonld) ? page.jsonld : page.jsonld ? [page.jsonld] : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.meta_description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        {(page.keywords ?? []).length > 0 && (
          <meta name="keywords" content={(page.keywords ?? []).join(", ")} />
        )}
        {jsonldArray.map((jl, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(jl)}</script>
        ))}
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link to="/" className="hover:text-amber-400">Home</Link>
          <span className="mx-2">/</span>
          <span className="capitalize">{page.kind.replace(/-/g, " ")}</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-br from-amber-300 via-amber-100 to-amber-300 bg-clip-text text-transparent">
          {page.h1}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">{page.meta_description}</p>

        <article className="prose prose-invert prose-amber max-w-none prose-headings:font-display prose-h2:text-amber-200 prose-code:text-amber-300 prose-code:bg-amber-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
          <ReactMarkdown>{page.body_md}</ReactMarkdown>
        </article>

        {page.faq && page.faq.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold text-amber-200 mb-4">Frequently asked questions</h2>
            <div className="space-y-3">
              {page.faq.map((f, i) => (
                <details key={i} className="rounded-lg border border-amber-500/20 bg-card/40 p-4 group">
                  <summary className="cursor-pointer font-semibold text-amber-100">{f.q}</summary>
                  <p className="mt-2 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {page.related_slugs && page.related_slugs.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold text-amber-200 mb-4">Related guides</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {page.related_slugs.map((r) => (
                <Link
                  key={r}
                  to={`/${r}`}
                  className="rounded-lg border border-amber-500/20 bg-card/40 hover:bg-card/70 hover:border-amber-400/40 px-4 py-3 transition"
                >
                  <span className="text-amber-100 font-medium capitalize">
                    {r.split("/").slice(-1)[0].replace(/-/g, " ")}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-amber-100 mb-2">Play chess now — free, no signup</h2>
          <p className="text-muted-foreground mb-5">Practice what you just read against real opponents or our bots.</p>
          <Link
            to="/play/online"
            className="inline-block px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold transition"
          >
            Play now →
          </Link>
        </div>

        <p className="mt-10 text-xs text-muted-foreground text-center">
          Last updated {new Date(page.updated_at).toLocaleDateString()}
        </p>
      </main>

      <Footer />
    </div>
  );
}
