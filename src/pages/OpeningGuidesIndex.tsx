/**
 * Crawlable index for the opening × intent matrix.
 *
 * Sitemaps get pages discovered; internal links get them ranked. This page is
 * the hub every generated guide links back to, so Google can walk the whole set
 * from one entry point.
 */
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/jsonld-builders";
import { MATRIX_INTENTS, MATRIX_OPENING_SLUGS, getMatrixOpening } from "@/lib/seo-matrix";

export default function OpeningGuidesIndex() {
  const openings = MATRIX_OPENING_SLUGS.map((s) => getMatrixOpening(s)).filter(
    (o): o is NonNullable<ReturnType<typeof getMatrixOpening>> => Boolean(o),
  );
  const total = openings.length * MATRIX_INTENTS.length;

  const title = "Chess Opening Guides — Every Question Answered";
  const description = `${total} free opening guides: how to play, traps, best responses and rating-level plans for ${openings.length} chess openings. Interactive board on every page.`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={title}
        description={description}
        path="/opening-guides"
        jsonLd={[
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Opening guides", path: "/opening-guides" },
          ]),
          buildItemListSchema(
            openings.slice(0, 50).map((o) => ({ name: o.name, path: `/openings/${o.slug}` })),
            "Chess opening guides",
          ),
        ]}
      />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16 space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Chess opening guides</h1>
          <p className="text-muted-foreground text-sm">
            {total} guides across {openings.length} openings — every one with a playable board, so you can try the line
            instead of only reading about it.
          </p>
        </header>

        {openings.map((o) => (
          <section key={o.slug} className="space-y-2 border-b border-border/40 pb-5">
            <h2 className="font-display text-base font-semibold">
              <Link to={`/openings/${o.slug}`} className="hover:text-primary">
                {o.name} <span className="text-muted-foreground font-normal text-xs">{o.eco}</span>
              </Link>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {MATRIX_INTENTS.map((i) => (
                <Link
                  key={i.slug}
                  to={`/openings/${o.slug}/${i.slug}`}
                  className="text-xs px-2.5 py-1 rounded-md border border-border/50 bg-card/40 hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {i.label}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}
