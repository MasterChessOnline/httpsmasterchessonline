import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { FAMOUS_GAMES } from "@/data/famousGames";

export default function FamousGames() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Most Famous Chess Games of All Time — PGN, Analysis | MasterChess"
        description={`The ${FAMOUS_GAMES.length} most legendary chess games ever played — Immortal, Evergreen, Opera, Game of the Century, Fischer-Spassky, Kasparov-Topalov. Full PGN, story, and analysis.`}
        path="/famous-games"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: FAMOUS_GAMES.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://masterchess.live/famous-games/${g.slug}`,
            name: `${g.title} — ${g.white} vs ${g.black} (${g.year})`,
          })),
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-7 w-7 text-primary" />
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Famous <span className="text-gradient-gold">Chess Games</span>
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          The {FAMOUS_GAMES.length} most legendary chess games of all time — from Anderssen's Immortal to Carlsen's modern grinds. Each game with full PGN, historical context, and why it changed chess.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FAMOUS_GAMES.map((g, i) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Link to={`/famous-games/${g.slug}`}>
                <div className="rounded-xl border border-border/30 glass-4d p-5 h-full hover:border-primary/40 transition-all">
                  <p className="text-[10px] uppercase tracking-widest text-primary mb-1">{g.year} · {g.event}</p>
                  <h2 className="font-display text-lg font-bold mb-1 group-hover:text-primary">{g.title}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{g.white} vs {g.black} · <span className="text-foreground font-mono">{g.result}</span></p>
                  <p className="text-sm text-foreground/80 line-clamp-2">{g.summary}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
