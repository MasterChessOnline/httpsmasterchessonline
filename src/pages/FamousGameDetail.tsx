import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Trophy, Play } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getFamousGame, FAMOUS_GAMES } from "@/data/famousGames";

export default function FamousGameDetail() {
  const { slug = "" } = useParams();
  const g = getFamousGame(slug);
  if (!g) return <Navigate to="/famous-games" replace />;

  const related = FAMOUS_GAMES.filter((x) => x.slug !== g.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${g.title} — ${g.white} vs ${g.black} (${g.year}) PGN & Analysis | MasterChess`}
        description={`${g.summary} Full PGN, opening (${g.opening}${g.eco ? `, ECO ${g.eco}` : ""}), and the legacy of this ${g.year} ${g.event} masterpiece.`}
        path={`/famous-games/${g.slug}`}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${g.title} — ${g.white} vs ${g.black} (${g.year})`,
            datePublished: `${g.year}-01-01`,
            description: g.summary,
            author: { "@type": "Organization", name: "MasterChess" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Famous Games", item: "https://masterchess.live/famous-games" },
              { "@type": "ListItem", position: 2, name: g.title },
            ],
          },
        ]}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/famous-games" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All famous games
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-primary/15 text-primary">{g.year}</span>
            <span className="text-xs text-muted-foreground italic">{g.event}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight mb-2">
            <span className="text-gradient-gold">{g.title}</span>
          </h1>
          <p className="text-lg text-foreground/90 mb-1 font-medium">{g.white} vs {g.black}</p>
          <p className="text-sm text-muted-foreground mb-6">{g.opening}{g.eco ? ` · ECO ${g.eco}` : ""} · Result <span className="font-mono text-foreground">{g.result}</span></p>

          <div className="rounded-xl border border-border/30 glass-4d p-5 sm:p-6 mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">The story</p>
            <p className="text-base text-foreground/90 leading-relaxed mb-4">{g.summary}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Why it matters</p>
            <p className="text-base text-foreground/85 leading-relaxed">{g.legacy}</p>
          </div>

          <div className="rounded-xl border border-border/30 glass-4d p-5 mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Full PGN</p>
            <pre className="font-mono text-xs text-foreground/85 whitespace-pre-wrap break-words leading-relaxed">{g.pgn}</pre>
          </div>

          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 text-center mb-8">
            <p className="text-sm text-muted-foreground mb-3">Replay this game move-by-move with engine analysis</p>
            <Link to={`/analysis?pgn=${encodeURIComponent(g.pgn)}`}>
              <Button className="gap-2"><Play className="h-4 w-4 fill-current" /> Open in Analysis Board</Button>
            </Link>
          </div>

          <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">More legendary games</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.slug} to={`/famous-games/${r.slug}`}
                className="px-3 py-1.5 rounded-md border border-border/40 hover:border-primary/40 text-sm hover:text-primary transition-all">
                {r.title}
              </Link>
            ))}
          </div>
        </motion.article>
      </main>
    </div>
  );
}
