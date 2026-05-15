import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { GLOSSARY } from "@/data/chessGlossary";

const CATEGORIES = ["all", "tactic", "strategy", "opening", "endgame", "rule", "piece", "general"] as const;

export default function Glossary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<typeof CATEGORIES[number]>("all");

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return GLOSSARY.filter(t => {
      if (cat !== "all" && t.category !== cat) return false;
      if (!ql) return true;
      return t.term.toLowerCase().includes(ql) || t.short.toLowerCase().includes(ql);
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [q, cat]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Chess Glossary — 60+ Terms Explained | MasterChess"
        description="Complete chess dictionary: tactics, strategy, openings, endgames. Fork, pin, zugzwang, fianchetto, en passant, and more — clearly explained with examples."
        path="/learn/glossary"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: "Chess Glossary",
          hasDefinedTerm: GLOSSARY.map(t => ({
            "@type": "DefinedTerm",
            name: t.term,
            description: t.short,
            url: `https://masterchess.live/learn/glossary/${t.slug}`,
          })),
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-7 w-7 text-primary" />
            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
              Chess <span className="text-gradient-gold">Glossary</span>
            </h1>
          </div>
          <p className="text-muted-foreground mb-6">
            {GLOSSARY.length} chess terms — clearly explained, with related concepts and examples.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search terms…"
                value={q}
                onChange={e => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide border transition-all ${
                    cat === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/40 hover:border-primary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((t, i) => (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
              >
                <Link to={`/learn/glossary/${t.slug}`}>
                  <div className="rounded-xl border border-border/30 glass-4d p-4 h-full hover:border-primary/40 transition-all group">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h2 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                        {t.term}
                      </h2>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{t.short}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No terms match.</div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
