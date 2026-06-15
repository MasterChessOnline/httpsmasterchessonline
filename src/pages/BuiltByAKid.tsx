import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Heart, Code2, Trophy, ArrowRight } from "lucide-react";

/**
 * SEO landing — targets long-tail queries like:
 * "13 year old programmer chess site", "kid built chess website",
 * "youngest chess site founder". Press-bait + brand-story differentiator.
 */
export default function BuiltByAKid() {
  const url = "https://masterchess.live/built-by-a-kid";
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-zinc-950 to-black text-foreground">
      <Helmet>
        <title>Built By a 13-Year-Old — The MasterChess Story | MasterChess</title>
        <meta
          name="description"
          content="MasterChess is a full chess platform — online play, AI bots, tournaments, Stockfish analysis — built single-handedly by Nikola, a 13-year-old from Serbia. No team, no investors, no ads."
        />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content="Built By a 13-Year-Old — The MasterChess Story" />
        <meta
          property="og:description"
          content="A 13-year-old built a full chess platform with online play, bots, tournaments and Stockfish analysis. Solo. No ads. No paywalls."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: "Built By a 13-Year-Old — The MasterChess Story",
          datePublished: "2026-01-01",
          dateModified: "2026-06-15",
          author: {
            "@type": "Person",
            name: "Nikola Šakotić",
            jobTitle: "Founder & Creator",
            nationality: "Serbian",
          },
          publisher: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live/" },
          mainEntityOfPage: url,
          image: "https://masterchess.live/og-image.jpg",
          articleBody:
            "MasterChess is a free online chess platform built solo by a 13-year-old self-taught developer from Serbia. It offers real-time multiplayer, 9 AI bots, daily tournaments, Stockfish analysis, opening trainer and more — completely ad-free.",
        })}</script>
      </Helmet>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" /> Founder Story
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight">
            Built by a <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">13-year-old</span>.
          </h1>
          <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
            Hi. I'm <strong className="text-amber-200">Nikola</strong>. I'm 13. I built every single line of MasterChess
            myself — the engine integration, the multiplayer, the tournaments, the rating system, the design.
            No team, no investors, no ads.
          </p>
          <p className="mt-4 text-zinc-400">
            I made this because I love chess and I wanted a place that felt like the game deserves — calm, premium,
            no banner ads, no popups, no "upgrade to see your analysis." Just chess.
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mt-10">
            {[
              { icon: Code2, label: "100% solo build", sub: "Every line of code" },
              { icon: Trophy, label: "Real tournaments", sub: "Swiss + Arena, free" },
              { icon: Heart, label: "Forever ad-free", sub: "Player-funded only" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <s.icon className="h-5 w-5 text-amber-300 mb-2" />
                <div className="font-bold text-sm">{s.label}</div>
                <div className="text-xs text-zinc-400">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/play-guest"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold shadow-lg hover:brightness-110 transition"
            >
              Play the site I built <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/beat-nikola"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-amber-500/40 text-amber-200 font-bold hover:bg-amber-500/10 transition"
            >
              Try to beat me
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border/20 text-sm text-zinc-500">
            Press / interviews:{" "}
            <a href="mailto:contact@masterchess.live" className="text-amber-300 hover:underline">
              contact@masterchess.live
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
