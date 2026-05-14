import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Crown, Sparkles, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import ShareBar from "@/components/ShareBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OPENING_SEO, getOpeningBySlug } from "@/lib/opening-seo-meta";
import { OPENINGS_DATABASE } from "@/lib/openings-data";
import { getOpeningBoardImage } from "@/lib/og-board-image";

export default function OpeningLanding() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const meta = slug ? getOpeningBySlug(slug) : null;
  const dbOpening = meta ? OPENINGS_DATABASE.find((o) => o.id === meta.id) : null;

  if (!meta) return <Navigate to="/openings" replace />;

  // Resolve display fields — prefer the database, fall back to meta-provided fields.
  const opening = {
    id: meta.id,
    name: dbOpening?.name ?? meta.name ?? meta.longTitle.split("—")[0].trim(),
    eco: dbOpening?.eco ?? meta.eco ?? "—",
    category: dbOpening?.category ?? meta.category ?? "opening",
    difficulty: dbOpening?.difficulty ?? meta.difficulty ?? "intermediate",
    startingMoves: dbOpening?.startingMoves ?? meta.startingMoves ?? "",
    description: dbOpening?.description ?? meta.description ?? meta.longDescription,
    totalVariations: dbOpening?.totalVariations,
    tree: dbOpening?.tree,
  };

  const url = `https://masterchess.live/openings/${meta.slug}`;
  const ogImage = getOpeningBoardImage(opening.startingMoves);
  const otherOpenings = Object.values(OPENING_SEO).filter((o) => o.id !== meta.id).slice(0, 6);

  // Extract first 6 main-line moves for the SEO preview (only when DB tree exists)
  const previewMoves: string[] = [];
  if (opening.tree) {
    let cursor: any = opening.tree[0];
    while (cursor && previewMoves.length < 10) {
      previewMoves.push(cursor.san);
      cursor = cursor.children?.find((c: any) => c.isMainLine) ?? cursor.children?.[0];
    }
  }

  const jsonLd: Record<string, any>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: meta.longTitle,
      description: meta.longDescription,
      author: { "@type": "Organization", name: "MasterChess" },
      publisher: {
        "@type": "Organization",
        name: "MasterChess",
        logo: { "@type": "ImageObject", url: "https://masterchess.live/og-image.jpg" },
      },
      mainEntityOfPage: url,
      datePublished: "2026-05-14",
      dateModified: "2026-05-14",
      image: ogImage,
      keywords: opening.name + ", chess opening, " + opening.eco,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
        { "@type": "ListItem", position: 2, name: "Openings", item: "https://masterchess.live/openings" },
        { "@type": "ListItem", position: 3, name: opening.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: meta.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={meta.longTitle}
        description={meta.longDescription}
        path={`/openings/${meta.slug}`}
        type="article"
        image={ogImage}
        jsonLd={jsonLd}
      />
      <Navbar />

      <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Chess Opening · ECO {opening.eco}</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-3"
        >
          {opening.name}
        </motion.h1>

        <p className="text-lg text-muted-foreground mb-4 max-w-3xl">{opening.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary" className="capitalize">{opening.difficulty}</Badge>
          <Badge variant="outline" className="capitalize">{opening.category.replace("-", " ")}</Badge>
          {opening.totalVariations !== undefined && (
            <Badge variant="outline">{opening.totalVariations} variations</Badge>
          )}
          <Badge variant="outline">ECO {opening.eco}</Badge>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {dbOpening && (
            <Link to={`/openings?openingId=${opening.id}`}>
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" /> Train this opening
              </Button>
            </Link>
          )}
          <Link to="/play">
            <Button variant="outline" className="gap-2">
              Play now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Opening moves preview */}
        {opening.startingMoves && (
          <section className="mb-10 rounded-2xl border border-border/60 bg-card/50 p-6">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">Starting moves</h2>
            <p className="font-mono text-lg text-foreground mb-2 break-words">{opening.startingMoves}</p>
            {previewMoves.length > 0 && (
              <>
                <p className="text-sm text-muted-foreground mb-2 mt-4">Main line continuation:</p>
                <p className="font-mono text-base text-foreground/80 break-words">{previewMoves.join(" ")}</p>
              </>
            )}
          </section>
        )}


        {/* Key ideas */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Key strategic ideas</h2>
          <ul className="space-y-2.5">
            {meta.keyIdeas.map((idea, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">{i + 1}</span>
                <span className="text-base leading-relaxed text-foreground/90">{idea}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Famous games */}
        {meta.famousGames && meta.famousGames.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Famous games
            </h2>
            <ul className="space-y-2">
              {meta.famousGames.map((g, i) => (
                <li key={i} className="rounded-lg border border-border/40 bg-card/40 px-4 py-2.5 text-sm text-foreground/90">{g}</li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQs */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          <div className="space-y-3">
            {meta.faqs.map((f, i) => (
              <details key={i} className="group rounded-xl border border-border/50 bg-card/50 p-4 hover:bg-card/80 transition-colors">
                <summary className="font-semibold text-foreground cursor-pointer flex items-center justify-between gap-3">
                  {f.q}
                  <ArrowRight className="h-4 w-4 text-primary transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-10 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-6 sm:p-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Master the {opening.name}</h2>
          <p className="text-muted-foreground mb-5">Train every variation interactively with a Stockfish-verified move-by-move trainer — free, no signup.</p>
          <div className="flex flex-wrap gap-3 items-center">
            <Link to={`/openings?openingId=${opening.id}`}><Button className="gap-2">Open the trainer <ArrowRight className="h-4 w-4" /></Button></Link>
            <ShareBar url={url} title={meta.longTitle} compact />
          </div>
        </section>

        {/* Related openings */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" /> Explore more openings
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {otherOpenings.map((o) => {
              const op = OPENINGS_DATABASE.find((x) => x.id === o.id);
              const name = op?.name ?? o.name ?? o.longTitle.split("—")[0].trim();
              const eco = op?.eco ?? o.eco ?? "—";
              const desc = op?.description ?? o.description ?? o.longDescription;
              return (
                <Link key={o.slug} to={`/openings/${o.slug}`} className="block rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/40 hover:bg-card/80 transition-colors">
                  <p className="text-xs uppercase tracking-wider text-primary mb-1">{eco}</p>
                  <p className="font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </article>
      <Footer />
    </div>
  );
}
