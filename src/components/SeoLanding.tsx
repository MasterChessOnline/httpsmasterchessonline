import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { ReactNode } from "react";

export interface SeoLandingProps {
  slug: string;            // path without leading slash
  eyebrow: string;
  h1: ReactNode;
  intro: string;
  bullets: string[];
  primaryCta: { to: string; label: string };
  secondaryCta?: { to: string; label: string };
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Used in <title> and meta description. */
  metaTitle: string;
  metaDescription: string;
}

/**
 * Generic SEO landing wrapper — used by /play-chess-with-friends-free,
 * /best-free-chess-site-2026, /chess-opening-trainer-free, etc.
 * Single responsibility: heavy SEO head + brand-consistent above-the-fold + CTAs.
 */
export default function SeoLanding(p: SeoLandingProps) {
  const url = `https://masterchess.live/${p.slug}`;
  const jsonArr = Array.isArray(p.jsonLd) ? p.jsonLd : p.jsonLd ? [p.jsonLd] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-zinc-950 to-black text-foreground">
      <Helmet>
        <title>{p.metaTitle}</title>
        <meta name="description" content={p.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={p.metaTitle} />
        <meta property="og:description" content={p.metaDescription} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={p.metaTitle} />
        <meta name="twitter:description" content={p.metaDescription} />
        {jsonArr.map((j, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(j)}</script>
        ))}
      </Helmet>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" /> {p.eyebrow}
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight">{p.h1}</h1>
          <p className="mt-5 text-lg text-zinc-300 leading-relaxed">{p.intro}</p>

          <ul className="mt-8 space-y-2.5">
            {p.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-300">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to={p.primaryCta.to}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-lg hover:brightness-110 transition"
            >
              {p.primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            {p.secondaryCta && (
              <Link
                to={p.secondaryCta.to}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-amber-500/40 text-amber-200 font-bold hover:bg-amber-500/10 transition"
              >
                {p.secondaryCta.label}
              </Link>
            )}
          </div>

          <nav className="mt-14 pt-8 border-t border-border/20">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Explore more</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                ["/play-chess-with-friends-free", "Play with friends"],
                ["/best-free-chess-site-2026", "Best free site 2026"],
                ["/chess-opening-trainer-free", "Opening trainer"],
                ["/daily-chess-puzzle", "Daily puzzle"],
                ["/chess-rating-explained", "Rating explained"],
                ["/learn-chess-in-7-days", "Learn in 7 days"],
                ["/changelog", "Changelog"],
                ["/built-by-a-kid", "Built by a kid"],
                ["/no-ads-chess", "Ad-free chess"],
                ["/alternative-to-major-chess-sites", "Alternatives"],
              ]
                .filter(([href]) => href !== `/${p.slug}`)
                .map(([href, label]) => (
                  <Link
                    key={href}
                    to={href}
                    className="px-3 py-1.5 rounded-lg border border-border/30 hover:border-primary/40 hover:bg-muted/10 text-zinc-400 hover:text-amber-200 transition"
                  >
                    {label}
                  </Link>
                ))}
            </div>
          </nav>
        </motion.div>
      </main>
    </div>
  );
}
