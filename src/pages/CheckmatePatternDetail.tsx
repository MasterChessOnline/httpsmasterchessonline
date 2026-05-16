import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Crown, Play } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getMateBySlug, MATE_PATTERNS } from "@/data/matePatterns";

export default function CheckmatePatternDetail() {
  const { slug = "" } = useParams();
  const m = getMateBySlug(slug);
  if (!m) return <Navigate to="/learn/checkmate-patterns" replace />;

  // Use brand OG image (no external chess image services).
  const boardImg = "https://masterchess.live/og-image.jpg";

  const related = MATE_PATTERNS.filter(p => p.slug !== m.slug && p.difficulty === m.difficulty).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${m.name} — How to Spot & Force This Checkmate | MasterChess`}
        description={`${m.short} Learn the ${m.name} pattern with example position, forced sequence, and how to recognize it in your own games.`}
        path={`/learn/checkmate-patterns/${m.slug}`}
        type="article"
        image={boardImg}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to deliver ${m.name}`,
            description: m.long,
            image: boardImg,
            step: m.moves.split(/\s(?=\d+\.)/).map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: `Move ${i + 1}`,
              text: s.trim(),
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Learn", item: "https://masterchess.live/learn" },
              { "@type": "ListItem", position: 2, name: "Checkmate Patterns", item: "https://masterchess.live/learn/checkmate-patterns" },
              { "@type": "ListItem", position: 3, name: m.name },
            ],
          },
        ]}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/learn/checkmate-patterns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All patterns
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold ${
              m.difficulty === "beginner" ? "bg-emerald-500/15 text-emerald-400" :
              m.difficulty === "intermediate" ? "bg-primary/15 text-primary" :
              "bg-red-500/15 text-red-400"
            }`}>{m.difficulty}</span>
            {m.era && <span className="text-xs text-muted-foreground italic">{m.era}</span>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3">
            <span className="text-gradient-gold">{m.name}</span>
          </h1>
          <p className="text-lg text-foreground/90 mb-6 font-medium">{m.short}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="rounded-xl border border-border/30 glass-4d overflow-hidden">
              <img
                src={boardImg}
                alt={`${m.name} example position — ${m.short}`}
                width={400}
                height={400}
                loading="lazy"
                className="w-full aspect-square object-contain bg-muted/10"
              />
            </div>
            <div className="rounded-xl border border-border/30 glass-4d p-5 flex flex-col">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Forced sequence</p>
              <p className="font-mono text-sm text-foreground/90 mb-4 leading-relaxed">{m.moves}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 mt-auto">FEN</p>
              <code className="text-[10px] text-muted-foreground break-all">{m.fen}</code>
            </div>
          </div>

          <div className="rounded-xl border border-border/30 glass-4d p-5 sm:p-6 mb-8">
            <p className="text-base text-foreground/85 leading-relaxed">{m.long}</p>
          </div>

          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 text-center mb-8">
            <p className="text-sm text-muted-foreground mb-3">Practice this pattern in real games</p>
            <Link to="/play/online">
              <Button className="gap-2"><Play className="h-4 w-4 fill-current" /> Play Now</Button>
            </Link>
          </div>

          {related.length > 0 && (
            <>
              <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">Related patterns</h2>
              <div className="flex flex-wrap gap-2">
                {related.map(r => (
                  <Link key={r.slug} to={`/learn/checkmate-patterns/${r.slug}`}
                    className="px-3 py-1.5 rounded-md border border-border/40 hover:border-primary/40 text-sm hover:text-primary transition-all">
                    {r.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </motion.article>
      </main>
    </div>
  );
}
