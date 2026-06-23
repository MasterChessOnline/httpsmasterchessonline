import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, TrendingUp, Target, Play } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getEloByRating, ELO_TIERS } from "@/data/eloTiers";

export default function EloDetail() {
  const { rating: r = "" } = useParams();
  const rating = parseInt(r, 10);
  const tier = getEloByRating(rating);
  if (!tier) return <Navigate to="/elo" replace />;

  const nextTier = ELO_TIERS.find(t => t.rating > tier.rating);
  const prevTier = [...ELO_TIERS].reverse().find(t => t.rating < tier.rating);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`What is ${tier.rating} ELO in Chess? ${tier.category} Skill Level & How to Reach ${nextTier?.rating || "GM"}`}
        description={`A ${tier.rating} ELO chess rating means you're in the ${tier.percentile} — ${tier.category.toLowerCase()}. ${tier.benchmark} Full breakdown, percentile, and a step-by-step path to ${nextTier?.rating || "Grandmaster"}.`}
        path={`/elo/${tier.rating}`}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${tier.rating} ELO Chess Rating Explained`,
            description: tier.description,
            url: `https://masterchess.live/elo/${tier.rating}`,
            author: { "@type": "Organization", name: "MasterChess" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "ELO Ratings", item: "https://masterchess.live/elo" },
              { "@type": "ListItem", position: 2, name: `${tier.rating} ELO` },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `What does a ${tier.rating} ELO chess rating mean?`,
                acceptedAnswer: { "@type": "Answer", text: `A ${tier.rating} ELO rating places you in the ${tier.percentile} of all rated chess players. ${tier.description}` },
              },
              {
                "@type": "Question",
                name: `What can a ${tier.rating} ELO chess player do?`,
                acceptedAnswer: { "@type": "Answer", text: tier.benchmark },
              },
              {
                "@type": "Question",
                name: `How do I improve from ${tier.rating} to ${nextTier?.rating || "the next level"} ELO?`,
                acceptedAnswer: { "@type": "Answer", text: tier.goal },
              },
              {
                "@type": "Question",
                name: `Is ${tier.rating} ELO good in chess?`,
                acceptedAnswer: { "@type": "Answer", text: `${tier.rating} ELO is categorized as ${tier.category} — ${tier.percentile} of rated players. ${nextTier ? `The next milestone is ${nextTier.rating} ELO.` : "This is the top tier of chess."}` },
              },
            ],
          },
        ]}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/elo" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All ratings
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
              {tier.category}
            </span>
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <h1 className="font-display text-6xl sm:text-7xl font-black text-gradient-gold leading-none">
              {tier.rating}
            </h1>
            <span className="text-2xl uppercase tracking-widest text-muted-foreground font-bold">ELO</span>
          </div>
          <p className="text-base text-muted-foreground mb-6">{tier.percentile} of all rated chess players</p>

          <div className="rounded-xl border border-border/30 glass-4d p-5 sm:p-6 mb-6">
            <p className="text-base text-foreground/85 leading-relaxed">{tier.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-xl border border-border/30 glass-4d p-5">
              <h2 className="font-display text-sm uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> What you can do
              </h2>
              <p className="text-sm text-foreground/85">{tier.benchmark}</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="font-display text-sm uppercase tracking-widest text-primary mb-2">
                Path to {nextTier?.rating || "Grandmaster"}
              </h2>
              <p className="text-sm text-foreground/85">{tier.goal}</p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent text-center mb-8">
            <p className="text-sm text-muted-foreground mb-3">Find out your real ELO</p>
            <Link to="/play/online">
              <Button size="lg" className="gap-2">
                <Play className="h-4 w-4 fill-current" /> Play Rated Now
              </Button>
            </Link>
          </div>

          <div className="flex justify-between items-center text-sm">
            {prevTier ? (
              <Link to={`/elo/${prevTier.rating}`} className="text-muted-foreground hover:text-primary">
                ← {prevTier.rating} ELO
              </Link>
            ) : <span />}
            {nextTier ? (
              <Link to={`/elo/${nextTier.rating}`} className="text-muted-foreground hover:text-primary">
                {nextTier.rating} ELO →
              </Link>
            ) : <span />}
          </div>
        </motion.article>
      </main>
    </div>
  );
}
