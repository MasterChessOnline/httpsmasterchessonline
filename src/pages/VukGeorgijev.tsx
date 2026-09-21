import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";
import { VUK, VUK_PAGES, getVukPage } from "@/lib/vuk-pages";
import {
  buildPersonSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildItemListSchema,
} from "@/lib/jsonld-builders";
import vukPhoto from "@/assets/vuk-georgijev-profile.png";

const SITE = "https://masterchess.live";

function personLd(url: string) {
  return {
    ...buildPersonSchema({
      name: VUK.name,
      username: VUK.handle,
      url,
      bio: `${VUK.name} — chess player from ${VUK.city}, ${VUK.country}, member of ${VUK.club}, MasterChess Verified player and official coach.`,
      country: VUK.country,
    }),
    birthDate: VUK.birth,
    birthPlace: { "@type": "Place", name: `${VUK.city}, ${VUK.country}` },
    jobTitle: "Chess coach",
    memberOf: { "@type": "SportsTeam", name: VUK.club },
    sameAs: [
      `https://www.instagram.com/${VUK.instagram}/`,
      `${SITE}${VUK.profilePath}`,
      `${SITE}/vuk-georgijev`,
    ],
  };
}

function Header() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <img
        src={vukPhoto}
        alt={`${VUK.name} — MasterChess Verified chess player from ${VUK.city}`}
        className="h-40 w-40 shrink-0 rounded-xl border border-primary/40 object-cover object-top shadow-lg"
        loading="eager"
      />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> MasterChess Verified
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <GraduationCap className="h-3.5 w-3.5" /> Coach
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {VUK.city}, {VUK.country} · {VUK.club} · born {VUK.birthText}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to={VUK.profilePath}>Official MasterChess profile</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a
              href={`https://www.instagram.com/${VUK.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Instagram className="mr-1.5 h-4 w-4" /> @{VUK.instagram}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The complete biography, repeated on every page in the cluster so that
 *  whichever page Google ranks, the searcher immediately reads the full bio. */
function FullBio() {
  const facts: [string, string][] = [
    ["Full name", VUK.name],
    ["Born", `${VUK.birthText} (${VUK.city}, ${VUK.country})`],
    ["Chess club", VUK.club],
    ["Role on MasterChess", VUK.role],
    ["Recognition issued by", VUK.issuer],
    ["Official profile", `masterchess.live${VUK.profilePath}`],
    ["Instagram", `@${VUK.instagram}`],
  ];
  return (
    <section className="space-y-4" id="full-bio">
      <h2 className="text-xl font-semibold">{VUK.name} — full biography</h2>
      <p className="leading-relaxed text-muted-foreground">
        {VUK.name} is a chess player from {VUK.city}, {VUK.country}, born on {VUK.birthText}. He plays
        for {VUK.club}, one of the Serbian clubs where players grow up on long games and endgame
        technique rather than engine help.
      </p>
      <p className="leading-relaxed text-muted-foreground">
        On MasterChess he is a Verified player and an official Coach — a recognition issued by{" "}
        {VUK.issuer}. The Verified badge means the platform confirmed the identity behind the account,
        and the Coach recognition means he is trusted to help other players improve, especially in
        endgames and practical play. He holds lifetime Premium access on the platform.
      </p>
      <p className="leading-relaxed text-muted-foreground">
        His complete official record — rating, games played, badges and recognitions — is public on his{" "}
        <Link to={VUK.profilePath} className="text-primary underline">
          MasterChess profile
        </Link>
        , and he shares his chess on Instagram as{" "}
        <a
          href={`https://www.instagram.com/${VUK.instagram}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          @{VUK.instagram}
        </a>
        .
      </p>
      <dl className="grid gap-x-6 gap-y-2 rounded-lg border border-border/60 bg-card/50 p-4 text-sm sm:grid-cols-2">
        {facts.map(([k, v]) => (
          <div key={k} className="flex flex-wrap gap-2">
            <dt className="font-medium text-foreground">{k}:</dt>
            <dd className="text-muted-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function RelatedLinks({ currentSlug }: { currentSlug?: string }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">More about {VUK.name}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {VUK_PAGES.filter((p) => p.slug !== currentSlug).map((p) => (
          <Link
            key={p.slug}
            to={`/vuk-georgijev/${p.slug}`}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-4 py-3 text-sm transition-colors hover:border-primary/50"
          >
            <span>{p.h1}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function VukGeorgijev() {
  const { slug } = useParams<{ slug?: string }>();
  const page = slug ? getVukPage(slug) : undefined;

  if (slug && !page) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-16">
          <Seo
            title={`${VUK.name} | MasterChess`}
            description={`Official pages about ${VUK.name} on MasterChess.`}
            path="/vuk-georgijev"
            noindex
          />
          <h1 className="text-2xl font-bold">Page not found</h1>
          <Button asChild className="mt-6">
            <Link to="/vuk-georgijev">All {VUK.name} pages</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const path = page ? `/vuk-georgijev/${page.slug}` : "/vuk-georgijev";
  const url = `${SITE}${path}`;
  const title = page
    ? page.title
    : `${VUK.name} — Chess Player, Bio & Coach | MasterChess`;
  const description = page
    ? page.description
    : `${VUK.name} — chess player from ${VUK.city}, ${VUK.country}, born ${VUK.birthText}, member of ${VUK.club}, MasterChess Verified player and official coach. Bio, rating, games and Instagram.`;

  const jsonLd: Record<string, any>[] = [
    personLd(url),
    buildBreadcrumbSchema(
      page
        ? [
            { name: "Home", path: "/" },
            { name: VUK.name, path: "/vuk-georgijev" },
            { name: page.h1, path },
          ]
        : [
            { name: "Home", path: "/" },
            { name: VUK.name, path: "/vuk-georgijev" },
          ],
    ),
  ];
  if (page?.faq.length) jsonLd.push(buildFaqSchema(page.faq));
  if (!page) {
    jsonLd.push(
      buildItemListSchema(
        VUK_PAGES.map((p) => ({ name: p.h1, path: `/vuk-georgijev/${p.slug}` })),
        `${VUK.name} — official pages`,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Seo title={title} description={description} path={path} type="article" jsonLd={jsonLd} />
      <main className="mx-auto max-w-3xl space-y-12 px-4 py-10 sm:py-14">
        <header className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {page ? page.h1 : `${VUK.name} — Chess Player & MasterChess Coach`}
          </h1>
          <Header />
          <p className="text-base leading-relaxed text-muted-foreground">
            {page
              ? page.intro
              : `${VUK.name} is a chess player from ${VUK.city}, ${VUK.country}, born ${VUK.birthText}. He plays for ${VUK.club} and is a MasterChess Verified player and official coach, a recognition issued by ${VUK.issuer}.`}
          </p>
        </header>

        {page ? (
          <>
            <article className="space-y-8">
              {page.sections.map((s) => (
                <section key={s.heading} className="space-y-2">
                  <h2 className="text-xl font-semibold">{s.heading}</h2>
                  <p className="leading-relaxed text-muted-foreground">{s.body}</p>
                </section>
              ))}
            </article>

            {page.faq.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Questions & answers</h2>
                <div className="space-y-4">
                  {page.faq.map((f) => (
                    <Card key={f.q} className="p-4">
                      <h3 className="font-medium">{f.q}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Official pages</h2>
            <p className="text-sm text-muted-foreground">
              {VUK_PAGES.length} pages covering his biography, club, rating, coaching and more.
            </p>
          </section>
        )}

        <RelatedLinks currentSlug={page?.slug} />
      </main>
      <Footer />
    </div>
  );
}
