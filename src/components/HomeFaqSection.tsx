// Visible FAQ accordion on the Home page + FAQPage JSON-LD for Google
// rich snippets. Designed to be added at the bottom of Index without
// touching the existing hero/marketing layout (user veto on home redesign).
import { Helmet } from "react-helmet-async";
import { ChevronDown } from "lucide-react";
import { HOME_FAQ } from "@/lib/seo-faq";

export default function HomeFaqSection() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <section className="px-4 pb-16" aria-labelledby="home-faq-heading">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-xs uppercase tracking-widest text-amber-300 mb-3">
              Questions
            </div>
            <h2
              id="home-faq-heading"
              className="font-display text-3xl md:text-4xl font-bold tracking-tight"
            >
              Frequently asked
            </h2>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Quick answers about how MasterChess works.
            </p>
          </header>

          <div className="space-y-2">
            {HOME_FAQ.map((f, i) => (
              <details
                key={f.q}
                open={i === 0}
                className="group rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none hover:bg-card/60 transition-colors">
                  <span className="font-semibold text-sm md:text-base">{f.q}</span>
                  <ChevronDown className="h-4 w-4 text-amber-300 transition-transform group-open:rotate-180 shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
