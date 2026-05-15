import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { GRANDMASTERS } from "@/data/grandmasters";

export default function Grandmasters() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Greatest Chess Players of All Time — Grandmaster Profiles | MasterChess"
        description={`Profiles of ${GRANDMASTERS.length} legendary chess grandmasters: Magnus Carlsen, Garry Kasparov, Bobby Fischer, Judit Polgar, Mikhail Tal, and more. Peak ratings, playing style, best games.`}
        path="/players"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: GRANDMASTERS.map((g, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://masterchess.live/players/${g.slug}`,
            name: g.name,
          })),
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="h-7 w-7 text-primary" />
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Greatest <span className="text-gradient-gold">Chess Players</span>
          </h1>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          The {GRANDMASTERS.length} most influential grandmasters in history — peak ratings, signature style, and the games that defined their legacy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GRANDMASTERS.map((g, i) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Link to={`/players/${g.slug}`}>
                <div className="rounded-xl border border-border/30 glass-4d p-5 h-full hover:border-primary/40 transition-all">
                  <div className="flex items-baseline justify-between mb-1">
                    <h2 className="font-display text-base font-bold">{g.name}</h2>
                    <span className="text-[11px] font-mono text-primary">{g.peakRating}</span>
                  </div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">{g.country} · {g.born}{g.died ? `–${g.died}` : ""}</p>
                  {g.worldChampionYears && (
                    <p className="text-[10px] uppercase tracking-widest text-primary mb-2">World Champion {g.worldChampionYears}</p>
                  )}
                  <p className="text-sm text-foreground/80 line-clamp-2">{g.style}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
