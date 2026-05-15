import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen } from "lucide-react";
import Seo from "@/components/Seo";
import Header from "@/components/Header";
import { getTermBySlug, GLOSSARY } from "@/data/chessGlossary";

export default function GlossaryTerm() {
  const { slug = "" } = useParams();
  const term = getTermBySlug(slug);
  if (!term) return <Navigate to="/learn/glossary" replace />;

  const related = (term.related || [])
    .map(s => GLOSSARY.find(t => t.slug === s))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${term.term} in Chess — Definition & Examples | MasterChess`}
        description={`${term.short} Learn what ${term.term.toLowerCase()} means in chess with clear explanations, examples, and related concepts.`}
        path={`/learn/glossary/${term.slug}`}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            name: term.term,
            description: term.long,
            inDefinedTermSet: "https://masterchess.live/learn/glossary",
            url: `https://masterchess.live/learn/glossary/${term.slug}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Learn", item: "https://masterchess.live/learn" },
              { "@type": "ListItem", position: 2, name: "Glossary", item: "https://masterchess.live/learn/glossary" },
              { "@type": "ListItem", position: 3, name: term.term },
            ],
          },
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/learn/glossary" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All terms
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
              {term.category}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3">
            <span className="text-gradient-gold">{term.term}</span>
          </h1>
          <p className="text-lg text-foreground/90 mb-6 font-medium">{term.short}</p>

          <div className="rounded-xl border border-border/30 glass-4d p-5 sm:p-6 mb-8">
            <p className="text-base text-foreground/85 leading-relaxed whitespace-pre-line">{term.long}</p>
          </div>

          {related.length > 0 && (
            <div>
              <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">Related terms</h2>
              <div className="flex flex-wrap gap-2">
                {related.map(r => r && (
                  <Link
                    key={r.slug}
                    to={`/learn/glossary/${r.slug}`}
                    className="px-3 py-1.5 rounded-md border border-border/40 hover:border-primary/40 text-sm hover:text-primary transition-all"
                  >
                    {r.term}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 p-5 rounded-xl border border-primary/20 bg-primary/5 text-center">
            <p className="text-sm text-muted-foreground mb-3">Practice {term.term.toLowerCase()} in real games</p>
            <Link
              to="/play/online"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold uppercase text-sm tracking-wider hover:bg-primary/90 transition-all"
            >
              Play Now
            </Link>
          </div>
        </motion.article>
      </main>
    </div>
  );
}
