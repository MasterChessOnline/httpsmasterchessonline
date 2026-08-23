/**
 * One page per (opening × search intent) — the long-tail engine.
 *
 * Each page has its own title, its own angle and its own FAQ, plus a real
 * interactive board with the opening's move order, so it is a page worth
 * landing on rather than a keyword doorway.
 */
import { useParams, Navigate, Link } from "react-router-dom";
import { BookOpen, ChevronRight, Swords } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PositionStudyBoard from "@/components/seo/PositionStudyBoard";
import SeoFaqBlock from "@/components/seo/SeoFaqBlock";
import SeoNextSteps from "@/components/seo/SeoNextSteps";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/jsonld-builders";
import {
  MATRIX_INTENTS,
  getMatrixIntent,
  getMatrixOpening,
} from "@/lib/seo-matrix";

export default function OpeningIntentPage() {
  const { slug, intent: intentSlug } = useParams<{ slug: string; intent: string }>();
  const opening = slug ? getMatrixOpening(slug) : null;
  const intent = intentSlug ? getMatrixIntent(intentSlug) : null;

  if (!opening) return <Navigate to="/openings" replace />;
  if (!intent) return <Navigate to={`/openings/${slug}`} replace />;

  const path = `/openings/${opening.slug}/${intent.slug}`;
  const title = intent.title(opening.name);
  const description = intent.description(opening.name, opening.startingMoves || opening.eco);
  const sections = intent.sections(opening);
  const faqs = intent.faqs(opening).filter(Boolean);
  const siblings = MATRIX_INTENTS.filter((i) => i.slug !== intent.slug).slice(0, 8);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      articleSection: "Chess openings",
      about: { "@type": "Thing", name: `${opening.name} (${opening.eco})` },
      author: { "@type": "Organization", name: "MasterChess" },
      publisher: {
        "@type": "Organization",
        name: "MasterChess",
        logo: { "@type": "ImageObject", url: "https://masterchess.live/og-image.jpg" },
      },
      mainEntityOfPage: `https://masterchess.live${path}`,
      keywords: `${opening.name}, ${intent.label}, ${opening.eco}, chess opening`,
    },
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Openings", path: "/openings" },
      { name: opening.name, path: `/openings/${opening.slug}` },
      { name: intent.label, path },
    ]),
    ...(faqs.length ? [buildFaqSchema(faqs)] : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title={title} description={description} path={path} type="article" jsonLd={jsonLd} />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-8">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Link to="/openings" className="hover:text-primary">Openings</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/openings/${opening.slug}`} className="hover:text-primary">{opening.name}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{intent.label}</span>
        </nav>

        <header className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{opening.eco}</Badge>
            <Badge variant="outline">{opening.difficulty}</Badge>
            <Badge variant="outline">{intent.angle}</Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{intent.h1(opening.name)}</h1>
          <p className="text-muted-foreground">{description}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm">
              <Link to="/play-guest">
                <Swords className="h-4 w-4 mr-1.5" /> Play a free game
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={`/openings/${opening.slug}`}>
                <BookOpen className="h-4 w-4 mr-1.5" /> Full {opening.name} guide
              </Link>
            </Button>
          </div>
        </header>

        <PositionStudyBoard
          moves={opening.startingMoves}
          label={`${opening.name} — ${opening.startingMoves || "main line"}`}
        />

        {sections.map((s) => (
          <section key={s.heading} className="space-y-3">
            <h2 className="font-display text-lg font-semibold">{s.heading}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            {s.list?.length ? (
              <ul className="space-y-2">
                {s.list.map((item) => (
                  <li key={item} className="flex gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <SeoFaqBlock items={faqs} title={`${opening.name} — questions people ask`} />

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">More on the {opening.name}</h2>
          <div className="flex flex-wrap gap-2">
            {siblings.map((i) => (
              <Link
                key={i.slug}
                to={`/openings/${opening.slug}/${i.slug}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-border/50 bg-card/50 hover:border-primary/40 hover:text-primary transition-colors"
              >
                {i.label}
              </Link>
            ))}
          </div>
        </section>

        <SeoNextSteps
          steps={[
            { to: `/openings/${opening.slug}`, label: `${opening.name} — full guide`, note: "Theory, variations and famous games" },
            { to: "/openings", label: "All chess openings", note: "Browse every opening guide" },
            { to: "/opening-guides", label: "Every opening question answered", note: "The full guide index" },
          ]}
        />
      </main>

      <Footer />
    </div>
  );
}
