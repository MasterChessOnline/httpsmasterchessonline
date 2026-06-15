// Reusable SEO landing-page template. Config-driven so we can ship
// dozens of long-tail landing pages without duplicating boilerplate.
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SeoLandingConfig {
  path: string;                       // canonical path, e.g. "/chess-for-kids"
  lang?: "en" | "sr";
  title: string;                      // <title>
  description: string;                // meta description
  h1: string;
  eyebrow?: string;                   // small uppercase chip above H1
  intro: string;                      // paragraph below H1
  hreflang?: { lang: string; path: string }[]; // EN/SR pairs
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  bullets: string[];                  // 4-6 short value props with checkmarks
  sections: Array<{
    heading: string;
    body: string;                     // 1-3 paragraphs (plain text, \n\n for new para)
  }>;
  faq?: Array<{ q: string; a: string }>;
  internalLinks?: Array<{ label: string; href: string }>;
}

const SITE = "https://masterchess.live";

export default function SeoLandingPage({ config }: { config: SeoLandingConfig }) {
  const canonical = `${SITE}${config.path}`;
  const lang = config.lang ?? "en";

  const faqJsonLd = config.faq && config.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: config.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: config.title,
    description: config.description,
    url: canonical,
    inLanguage: lang === "sr" ? "sr-Latn" : "en",
    isPartOf: { "@type": "WebSite", name: "MasterChess", url: SITE },
  };

  return (
    <>
      <Helmet>
        <html lang={lang === "sr" ? "sr-Latn" : "en"} />
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${SITE}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.title} />
        <meta name="twitter:description" content={config.description} />
        {config.hreflang?.map((h) => (
          <link key={h.lang} rel="alternate" hrefLang={h.lang} href={`${SITE}${h.path}`} />
        ))}
        {config.hreflang && (
          <link rel="alternate" hrefLang="x-default" href={`${SITE}${config.hreflang.find((h) => h.lang === "en")?.path ?? config.path}`} />
        )}
        <script type="application/ld+json">{JSON.stringify(webPageJsonLd)}</script>
        {faqJsonLd && (
          <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        )}
      </Helmet>

      <main className="min-h-screen px-4 py-10 md:py-16 bg-background">
        <article className="max-w-3xl mx-auto space-y-10">
          {/* Hero */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            {config.eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs uppercase tracking-widest text-primary">
                {config.eyebrow}
              </div>
            )}
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              {config.h1}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              {config.intro}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                <Link to={config.primaryCta.href}>
                  {config.primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {config.secondaryCta && (
                <Button asChild size="lg" variant="outline">
                  <Link to={config.secondaryCta.href}>{config.secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </motion.header>

          {/* Bullets */}
          {config.bullets.length > 0 && (
            <section className="rounded-2xl border border-border/60 bg-card/40 p-6">
              <ul className="grid sm:grid-cols-2 gap-3">
                {config.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Body sections */}
          {config.sections.map((s) => (
            <section key={s.heading} className="space-y-3">
              <h2 className="font-display text-2xl md:text-3xl font-bold">{s.heading}</h2>
              {s.body.split("\n\n").map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </section>
          ))}

          {/* FAQ */}
          {config.faq && config.faq.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                {lang === "sr" ? "Česta pitanja" : "Frequently asked questions"}
              </h2>
              <div className="space-y-3">
                {config.faq.map((f) => (
                  <details
                    key={f.q}
                    className="rounded-xl border border-border/60 bg-card/40 p-4 group"
                  >
                    <summary className="font-semibold cursor-pointer flex items-center justify-between">
                      {f.q}
                      <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90 shrink-0 ml-3" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Internal links */}
          {config.internalLinks && config.internalLinks.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-xl font-bold">
                {lang === "sr" ? "Pogledaj još" : "Related"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {config.internalLinks.map((l) => (
                  <Link
                    key={l.href}
                    to={l.href}
                    className="px-3 py-1.5 rounded-lg border border-border/60 bg-card/40 text-sm hover:border-primary/40 hover:bg-card/70 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          <section className="text-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              {lang === "sr" ? "Spreman za partiju?" : "Ready to play?"}
            </h2>
            <p className="text-muted-foreground mb-5">
              {lang === "sr"
                ? "Besplatno, bez reklama, pravi igrači. Počni za 5 sekundi."
                : "Free, no ads, real players. Start a game in 5 seconds."}
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              <Link to={config.primaryCta.href}>
                {config.primaryCta.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </section>
        </article>
      </main>
    </>
  );
}
