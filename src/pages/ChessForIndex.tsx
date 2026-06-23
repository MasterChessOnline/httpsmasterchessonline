import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AGE_GUIDES } from "@/data/ageGuides";

export default function ChessForIndex() {
  const url = "https://masterchess.live/chess-for";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chess for Every Age — From 5-Year-Olds to Seniors | MasterChess</title>
        <meta
          name="description"
          content="Chess guides tailored to every age — 5, 7, 10, 13, teens, adults, and seniors. Lessons, bots, and tournaments that actually fit."
        />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Chess for Every Age — MasterChess" />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-1 mb-3">
            <Sparkles className="h-3 w-3" /> Age-specific guides
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Chess for every age
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            A 5-year-old needs picture lessons. A 16-year-old wants streaming tools. A 70-year-old wants 15-minute time controls. Pick the guide that fits.
          </p>
        </motion.header>

        <div className="grid sm:grid-cols-2 gap-3">
          {AGE_GUIDES.map((g, i) => (
            <motion.div
              key={g.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/chess-for/${g.slug}`}
                className="block h-full rounded-xl border border-border/60 hover:border-amber-500/40 bg-card/60 hover:bg-amber-500/5 p-4 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className="font-display font-bold text-base text-foreground">{g.headline}</h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{g.metaDescription}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
