import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ALL_OPENING_SLUGS } from "@/lib/opening-seo-meta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LEARN_TOPICS = [
  "how-to-play-chess", "how-to-set-up-chess-board", "how-to-castle-in-chess",
  "play-chess-online-with-friends", "best-chess-openings-for-beginners",
  "queens-gambit-opening", "sicilian-defense-explained", "italian-game-opening",
  "chess-piece-names-and-moves", "chess-piece-values", "chess-notation-explained",
  "stalemate-vs-checkmate", "en-passant-rule", "chess-rating-elo-explained",
  "how-to-improve-at-chess", "scholars-mate", "fools-mate", "chess-opening-traps",
  "knight-moves-chess", "what-is-a-gambit-in-chess", "best-chess-players-of-all-time",
  "chess-strategy-for-beginners", "chess-clock-rules",
];

const TOOLS = [
  { path: "/analysis", label: "Game Analysis" },
  { path: "/opening-explorer", label: "Opening Explorer" },
  { path: "/rating-calculator", label: "ELO Rating Calculator" },
  { path: "/piece-values", label: "Piece Values Reference" },
  { path: "/guess-the-move", label: "Guess the Move" },
  { path: "/play-like-gm", label: "Play Like a GM" },
  { path: "/training", label: "Opening Trainer" },
  { path: "/coach", label: "AI Coach" },
  { path: "/embed-tools", label: "Streamer Embed" },
  { path: "/repertoire", label: "Repertoire Builder" },
];

const titleize = (slug: string) =>
  slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

export default function Topics() {
  const url = "https://masterchess.live/topics";
  const totalTopics = LEARN_TOPICS.length + ALL_OPENING_SLUGS.length + TOOLS.length;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chess Topics Hub — All Lessons, Openings & Tools | MasterChess</title>
        <meta name="description" content={`Browse all ${totalTopics}+ chess topics: openings, lessons, tools, and tactics. The complete index of MasterChess content.`} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="Chess Topics Hub — Complete Index" />
        <meta property="og:description" content={`Every chess topic on MasterChess — ${ALL_OPENING_SLUGS.length}+ openings, ${LEARN_TOPICS.length} lessons, and ${TOOLS.length} tools.`} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Chess Topics Hub",
          url,
          description: `Complete index of ${totalTopics}+ chess topics on MasterChess.`,
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
              { "@type": "ListItem", position: 2, name: "Topics", item: url },
            ],
          },
        })}</script>
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Chess Topics Hub
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every lesson, opening, and tool on MasterChess in one place. {totalTopics}+ topics indexed.
          </p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
            ♟ Chess Openings ({ALL_OPENING_SLUGS.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            {ALL_OPENING_SLUGS.map((slug) => (
              <Link
                key={slug}
                to={`/openings/${slug}`}
                className="px-3 py-2 rounded-md bg-card hover:bg-accent text-card-foreground hover:text-accent-foreground transition-colors border border-border/50"
              >
                {titleize(slug)}
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
            📚 Lessons & Guides ({LEARN_TOPICS.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {LEARN_TOPICS.map((slug) => (
              <Link
                key={slug}
                to={`/learn/${slug}`}
                className="px-3 py-2 rounded-md bg-card hover:bg-accent text-card-foreground hover:text-accent-foreground transition-colors border border-border/50"
              >
                {titleize(slug)}
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
            🛠 Tools & Trainers ({TOOLS.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            {TOOLS.map((t) => (
              <Link
                key={t.path}
                to={t.path}
                className="px-3 py-2 rounded-md bg-card hover:bg-accent text-card-foreground hover:text-accent-foreground transition-colors border border-border/50"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-6 border-b border-border pb-2">
            🏆 Play & Compete
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <Link to="/play/online" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Play Online</Link>
            <Link to="/play" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Play vs Bot</Link>
            <Link to="/tournaments" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Tournaments</Link>
            <Link to="/leaderboard" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Leaderboard</Link>
            <Link to="/community" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Community</Link>
            <Link to="/clubs" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Clubs</Link>
            <Link to="/live" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Live Streams</Link>
            <Link to="/missions" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Daily Missions</Link>
            <Link to="/achievements" className="px-3 py-2 rounded-md bg-card hover:bg-accent border border-border/50">Achievements</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
