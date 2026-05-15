import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getToolBySlug, TOOLS } from "@/data/tools";

export default function ToolDetail() {
  const { slug = "" } = useParams();
  const tool = getToolBySlug(slug);
  if (!tool) return <Navigate to="/tools" replace />;

  const related = TOOLS.filter(t => t.slug !== tool.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={tool.title}
        description={tool.description}
        path={`/tools/${tool.slug}`}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.h1,
            applicationCategory: "GameApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: tool.description,
            url: `https://masterchess.live/tools/${tool.slug}`,
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: tool.faqs.map(f => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Tools", item: "https://masterchess.live/tools" },
              { "@type": "ListItem", position: 2, name: tool.h1 },
            ],
          },
        ]}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All tools
        </Link>

        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-5xl mb-3">{tool.icon}</div>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mb-3">
            <span className="text-gradient-gold">{tool.h1}</span>
          </h1>
          <p className="text-lg text-foreground/90 mb-6 font-medium">{tool.short}</p>

          <Link to={tool.cta.to}>
            <Button size="lg" className="gap-2 mb-8">
              <Sparkles className="h-4 w-4" /> {tool.cta.label}
            </Button>
          </Link>

          <div className="rounded-xl border border-border/30 glass-4d p-5 sm:p-6 mb-8">
            <p className="text-base text-foreground/85 leading-relaxed">{tool.long}</p>
          </div>

          <h2 className="font-display text-xl uppercase tracking-wide mb-3">Features</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
            {tool.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                <span className="text-primary mt-1">▸</span> {f}
              </li>
            ))}
          </ul>

          <h2 className="font-display text-xl uppercase tracking-wide mb-3">FAQ</h2>
          <div className="space-y-3 mb-8">
            {tool.faqs.map(f => (
              <details key={f.q} className="rounded-lg border border-border/30 p-4 glass-4d">
                <summary className="font-semibold cursor-pointer text-foreground/90">{f.q}</summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 text-center mb-8">
            <p className="text-sm text-muted-foreground mb-3">Ready to use {tool.h1.toLowerCase()}?</p>
            <Link to={tool.cta.to}>
              <Button className="gap-2">{tool.cta.label} <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>

          <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3">Other tools</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {related.map(r => (
              <Link key={r.slug} to={`/tools/${r.slug}`}>
                <div className="rounded-lg border border-border/30 p-3 hover:border-primary/40 text-center transition-all">
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="text-xs font-bold">{r.h1}</div>
                </div>
              </Link>
            ))}
          </div>
        </motion.article>
      </main>
    </div>
  );
}
