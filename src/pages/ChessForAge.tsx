import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, GraduationCap, HelpCircle, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAgeGuide, AGE_GUIDES } from "@/data/ageGuides";

export default function ChessForAge() {
  const { slug = "" } = useParams<{ slug: string }>();
  const guide = getAgeGuide(slug);
  if (!guide) return <Navigate to="/chess-for" replace />;

  const url = `https://masterchess.live/chess-for/${guide.slug}`;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
      { "@type": "ListItem", position: 2, name: "Chess For", item: "https://masterchess.live/chess-for" },
      { "@type": "ListItem", position: 3, name: guide.headline, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{guide.metaTitle}</title>
        <meta name="description" content={guide.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={guide.metaTitle} />
        <meta property="og:description" content={guide.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-20 max-w-3xl">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/chess-for" className="hover:text-foreground">Chess For</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{guide.headline}</span>
        </nav>

        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-1 mb-3">
            <Sparkles className="h-3 w-3" /> For {guide.ageRange}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-3">
            {guide.headline}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">{guide.intro}</p>
        </motion.header>

        {/* Benefits */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Why chess works for {guide.ageRange}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {guide.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 rounded-lg border border-border/50 bg-card/60 p-3 text-sm text-foreground">
                <span className="text-emerald-400 mt-0.5">•</span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Start Here */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-400" /> Start here
          </h2>
          <div className="space-y-2.5">
            {guide.startHere.map((s) => (
              <Link
                key={s.label}
                to={s.href}
                className="flex items-center gap-3 rounded-xl border border-border/60 hover:border-amber-500/40 bg-card/60 hover:bg-amber-500/5 p-4 transition-all group"
              >
                <div className="flex-1">
                  <div className="font-display font-bold text-sm text-foreground">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.reason}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {guide.parentTip && (
          <aside className="mb-10 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-foreground">
            <div className="text-[10px] uppercase tracking-wider font-bold text-blue-400 mb-1">Parent tip</div>
            {guide.parentTip}
          </aside>
        )}

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-display text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-400" /> Frequently asked
          </h2>
          <div className="space-y-3">
            {guide.faq.map((f) => (
              <details key={f.q} className="rounded-xl border border-border/50 bg-card/60 p-4 group">
                <summary className="cursor-pointer font-display font-bold text-sm text-foreground list-none flex items-center justify-between">
                  <span>{f.q}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Other ages */}
        <section className="mb-6">
          <h2 className="font-display text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Other age guides
          </h2>
          <div className="flex flex-wrap gap-2">
            {AGE_GUIDES.filter((g) => g.slug !== guide.slug).map((g) => (
              <Link
                key={g.slug}
                to={`/chess-for/${g.slug}`}
                className="text-xs rounded-full border border-border/60 hover:border-amber-500/40 px-3 py-1.5 text-foreground hover:bg-amber-500/5 transition-colors"
              >
                {g.headline}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
