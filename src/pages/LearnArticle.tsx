import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Clock, ArrowRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import ShareBar from "@/components/ShareBar";
import { LEARN_ARTICLES, getArticleBySlug } from "@/lib/learn-articles";
import { OPENING_SEO } from "@/lib/opening-seo-meta";
import { OPENINGS_DATABASE } from "@/lib/openings-data";

export default function LearnArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? getArticleBySlug(slug) : null;

  if (!article) return <Navigate to="/learn" replace />;

  const url = `https://masterchess.live/learn/${article.slug}`;

  const jsonLd: Record<string, any>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.h1,
      description: article.metaDescription,
      datePublished: article.updated,
      dateModified: article.updated,
      author: { "@type": "Organization", name: "MasterChess" },
      publisher: {
        "@type": "Organization",
        name: "MasterChess",
        logo: { "@type": "ImageObject", url: "https://masterchess.live/og-image.jpg" },
      },
      mainEntityOfPage: url,
      image: "https://masterchess.live/og-image.jpg",
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
        { "@type": "ListItem", position: 2, name: "Learn", item: "https://masterchess.live/learn" },
        { "@type": "ListItem", position: 3, name: article.h1, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  if (article.steps?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: article.h1,
      description: article.intro,
      step: article.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }

  const related = article.relatedSlugs
    .map((s) => LEARN_ARTICLES.find((a) => a.slug === s))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={article.title}
        description={article.metaDescription}
        path={`/learn/${article.slug}`}
        type="article"
        jsonLd={jsonLd}
      />
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Learn chess</span>
          <span className="text-muted-foreground">·</span>
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Updated {new Date(article.updated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-5"
        >
          {article.h1}
        </motion.h1>

        <p className="text-lg leading-relaxed text-muted-foreground mb-6">{article.intro}</p>

        <div className="flex flex-wrap items-center gap-3 mb-10 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <Share2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground mr-2">Share this guide:</span>
          <ShareBar url={url} title={article.title} compact />
        </div>

        {article.steps && article.steps.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-5">Step-by-step</h2>
            <ol className="space-y-4">
              {article.steps.map((s, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{s.name}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {article.sections.map((sec, i) => (
          <section key={i} className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">{sec.heading}</h2>
            {sec.body.split("\n\n").map((p, j) => (
              <p key={j} className="text-base leading-relaxed text-muted-foreground mb-3">{p}</p>
            ))}
          </section>
        ))}

        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-5">Frequently asked questions</h2>
          <div className="space-y-3">
            {article.faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card/80">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between gap-3">
                  {f.q}
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Ready to play?</h2>
          <p className="text-muted-foreground mb-5">Jump straight into a free online chess game vs a bot or another player — no signup needed.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/play"><Button className="gap-2">Play now <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/learn"><Button variant="outline">More chess lessons</Button></Link>
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-4">Keep learning</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r) => r && (
                <Link key={r.slug} to={`/learn/${r.slug}`} className="block rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/40 hover:bg-card/80 transition-colors">
                  <p className="text-xs uppercase tracking-wider text-primary mb-1">Guide</p>
                  <p className="font-semibold text-foreground">{r.h1}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Internal link bridge to opening landings — boosts SEO crawl + click-through */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Explore chess openings</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(OPENING_SEO).slice(0, 6).map((o) => {
              const op = OPENINGS_DATABASE.find((x) => x.id === o.id);
              if (!op) return null;
              return (
                <Link key={o.slug} to={`/openings/${o.slug}`} className="block rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/40 hover:bg-card/80 transition-colors">
                  <p className="text-xs uppercase tracking-wider text-primary mb-1">ECO {op.eco}</p>
                  <p className="font-semibold text-foreground text-sm">{op.name}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );
}
