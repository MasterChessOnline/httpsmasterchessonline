import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { MATE_PATTERNS } from "@/data/matePatterns";

export default function CheckmatePatterns() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Checkmate Patterns — 12 Essential Mate Patterns | MasterChess"
        description="Master the 12 essential checkmate patterns: back-rank, smothered, Anastasia, Boden, Légal, Arabian, Scholar's, Fool's, Hook, Damiano, Morphy, and Epaulette mate."
        path="/learn/checkmate-patterns"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Checkmate Patterns",
          itemListElement: MATE_PATTERNS.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://masterchess.live/learn/checkmate-patterns/${m.slug}`,
            name: m.name,
          })),
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-7 w-7 text-primary" />
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Checkmate <span className="text-gradient-gold">Patterns</span>
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          The {MATE_PATTERNS.length} essential mating patterns every chess player must know — from beginner traps like Scholar's Mate to advanced patterns like Anastasia and Boden.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MATE_PATTERNS.map((m, i) => (
            <motion.div
              key={m.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <Link to={`/learn/checkmate-patterns/${m.slug}`}>
                <div className="rounded-xl border border-border/30 glass-4d p-4 h-full hover:border-primary/40 transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h2 className="font-display font-bold text-base group-hover:text-primary transition-colors">
                      {m.name}
                    </h2>
                    <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                      m.difficulty === "beginner" ? "bg-emerald-500/15 text-emerald-400" :
                      m.difficulty === "intermediate" ? "bg-primary/15 text-primary" :
                      "bg-red-500/15 text-red-400"
                    }`}>{m.difficulty}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{m.short}</p>
                  {m.era && <p className="text-[10px] text-muted-foreground/70 mt-2 italic">{m.era}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
