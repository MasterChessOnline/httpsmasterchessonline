import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Crown } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { getGrandmaster, GRANDMASTERS } from "@/data/grandmasters";
import { getFamousGame } from "@/data/famousGames";

export default function GrandmasterDetail() {
  const { slug = "" } = useParams();
  const g = getGrandmaster(slug);
  if (!g) return <Navigate to="/players" replace />;

  const game = g.bestGameSlug ? getFamousGame(g.bestGameSlug) : null;
  const related = GRANDMASTERS.filter((x) => x.slug !== g.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${g.name} — ${g.peakRating} Peak ELO, Style, Best Games | MasterChess`}
        description={`${g.name} (${g.country}, b. ${g.born}). ${g.bio} Peak rating ${g.peakRating}. ${g.worldChampionYears ? `World Champion ${g.worldChampionYears}.` : ""}`}
        path={`/players/${g.slug}`}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: g.name,
            nationality: g.country,
            birthDate: `${g.born}`,
            ...(g.died ? { deathDate: `${g.died}` } : {}),
            description: g.bio,
            jobTitle: "Chess Grandmaster",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Players", item: "https://masterchess.live/players" },
              { "@type": "ListItem", position: 2, name: g.name },
            ],
          },
        ]}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/players" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All grandmasters
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-mono text-primary">{g.peakRating} peak</span>
            <span className="text-xs text-muted-foreground">· {g.country} · {g.born}{g.died ? `–${g.died}` : ""}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mb-2">
            <span className="text-gradient-gold">{g.name}</span>
          </h1>
          {g.worldChampionYears && (
            <p className="text-sm uppercase tracking-widest text-primary mb-6">World Champion {g.worldChampionYears}</p>
          )}

          <div className="rounded-xl border border-border/30 glass-4d p-5 sm:p-6 mb-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Biography</p>
            <p className="text-base text-foreground/90 leading-relaxed mb-4">{g.bio}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Style</p>
            <p className="text-base text-foreground/85 leading-relaxed mb-4">{g.style}</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Did you know</p>
            <p className="text-base text-foreground/85 leading-relaxed italic">{g.fact}</p>
          </div>

          {game && (
            <Link to={`/famous-games/${game.slug}`}>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 mb-8 hover:border-primary/60 transition-all">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Signature Game · {game.year}</p>
                <p className="font-display text-lg font-bold mb-1">{game.title}</p>
                <p className="text-sm text-foreground/80">{game.summary}</p>
              </div>
            </Link>
          )}

          <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">More grandmasters</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link key={r.slug} to={`/players/${r.slug}`}
                className="px-3 py-1.5 rounded-md border border-border/40 hover:border-primary/40 text-sm hover:text-primary transition-all">
                {r.name}
              </Link>
            ))}
          </div>
        </motion.article>
      </main>
    </div>
  );
}
