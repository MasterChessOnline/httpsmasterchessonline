import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { LEARN_ARTICLES } from "@/lib/learn-articles";
import DailyNote from "@/components/blog/DailyNote";

export default function Blog() {
  const articles = [...LEARN_ARTICLES].sort((a, b) => (a.updated < b.updated ? 1 : -1));
  const featured = articles[0];
  const rest = articles.slice(1);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "MasterChess Blog",
      description:
        "Free chess guides, openings, strategy and rules from MasterChess — verified with Stockfish and updated weekly.",
      url: "https://masterchess.live/blog",
      publisher: {
        "@type": "Organization",
        name: "MasterChess",
        logo: { "@type": "ImageObject", url: "https://masterchess.live/og-image.jpg" },
      },
      blogPost: articles.map((a) => ({
        "@type": "BlogPosting",
        headline: a.h1,
        url: `https://masterchess.live/learn/${a.slug}`,
        datePublished: a.updated,
        dateModified: a.updated,
        description: a.metaDescription,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://masterchess.live/blog" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="MasterChess Blog — Chess Guides, Openings & Strategy"
        description="Free chess guides, openings, rules and strategy. Verified with Stockfish, written for real improvement. Updated weekly by MasterChess."
        path="/blog"
        jsonLd={jsonLd}
      />
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>The MasterChess Blog</span>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-4"
        >
          Learn chess. <span className="text-primary">Faster.</span>
        </motion.h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Guides written for real improvement — every move verified with Stockfish, every plan
          tested against modern theory. From your first game to your first 2000 ELO.
        </p>

        {/* Fresh, hand-written note that rotates every day */}
        <DailyNote />

        {/* Tiny handwritten margin scribble — keeps the blog feeling like a notebook */}
        <p
          className="mb-8 -mt-2 text-primary/80 text-base sm:text-lg select-none"
          style={{ fontFamily: "Caveat, ui-sans-serif, system-ui", transform: "rotate(-1.5deg)" }}
        >
          ↑ a new one of these every day. I write them between school and dinner.
        </p>

        {featured && (
          <Link
            to={`/learn/${featured.slug}`}
            className="group block mb-12 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-10 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-3">
              <TrendingUp className="h-3.5 w-3.5" /> Featured guide
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
              {featured.h1}
            </h2>
            <p className="text-muted-foreground mb-5 max-w-3xl">{featured.metaDescription}</p>
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((a, i) => (
            <motion.div
              key={a.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link
                to={`/learn/${a.slug}`}
                className="group block h-full rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/40 hover:bg-card transition-colors"
              >
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
                  <BookOpen className="h-3 w-3" /> Guide
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {a.h1}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{a.metaDescription}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(a.updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
