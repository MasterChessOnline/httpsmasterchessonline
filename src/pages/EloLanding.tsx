import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { ELO_TIERS } from "@/data/eloTiers";

export default function EloLanding() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Chess ELO Ratings Explained — 600 to 2500 | MasterChess"
        description="What does a chess ELO rating mean? Complete guide to ratings 600–2500: percentile, skill benchmarks, what each tier can do, and how to reach the next level."
        path="/elo"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Chess ELO Ratings",
          itemListElement: ELO_TIERS.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://masterchess.live/elo/${t.rating}`,
            name: `${t.rating} ELO Rating`,
          })),
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-7 w-7 text-primary" />
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Chess <span className="text-gradient-gold">ELO Ratings</span>
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          What does each chess ELO rating actually mean? Click any tier to see percentile, skill benchmarks, and the exact path to the next level.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ELO_TIERS.map((t, i) => (
            <motion.div
              key={t.rating}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link to={`/elo/${t.rating}`}>
                <div className="rounded-xl border border-border/30 glass-4d p-4 h-full hover:border-primary/40 transition-all group">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h2 className="font-display font-black text-3xl text-gradient-gold">
                      {t.rating}
                    </h2>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      ELO
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground/90 group-hover:text-primary transition-colors">
                    {t.category}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">{t.percentile}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
