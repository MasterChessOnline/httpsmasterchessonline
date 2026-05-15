import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { TOOLS } from "@/data/tools";

export default function Tools() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Free Chess Tools — PGN Viewer, FEN Editor, ELO Calculator | MasterChess"
        description="10 free chess tools: PGN viewer, FEN editor, ELO calculator, blunder checker, online chess clock, Stockfish online, opening explorer, and more. No signup."
        path="/tools"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: TOOLS.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://masterchess.live/tools/${t.slug}`,
            name: t.h1,
          })),
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="h-7 w-7 text-primary" />
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Free <span className="text-gradient-gold">Chess Tools</span>
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {TOOLS.length} powerful, free chess tools — no signup, no quotas, no ads. PGN viewer, FEN editor, Stockfish analysis, blunder checker, and more.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOOLS.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Link to={`/tools/${t.slug}`}>
                <div className="rounded-xl border border-border/30 glass-4d p-5 h-full hover:border-primary/40 transition-all group">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-3xl">{t.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                        {t.h1}
                      </h2>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{t.short}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
