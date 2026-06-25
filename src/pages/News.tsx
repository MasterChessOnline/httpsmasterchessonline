import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Flame, Clock, Crown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import NewsRow from "@/components/news/NewsRow";
import { getMyVotes, listNewsPosts, type NewsKind, type NewsPost, KIND_COLOR, KIND_LABEL, timeAgo } from "@/lib/news";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/jsonld-builders";

const TABS: { id: NewsKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "update", label: "MasterChess" },
  { id: "founder", label: "Founder" },
  { id: "releases", label: "Releases" },
  { id: "tournaments", label: "Tournaments" },
  { id: "community", label: "Community" },
  { id: "milestones", label: "Milestones" },
  { id: "roadmap", label: "Roadmap" },
  { id: "ai", label: "AI" },
  { id: "world", label: "World Chess" },
];

const INTERNAL = [
  { href: "/play", label: "Play" },
  { href: "/bots", label: "Bots" },
  { href: "/analysis", label: "Analysis" },
  { href: "/openings", label: "Openings" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function News() {
  const [tab, setTab] = useState<NewsKind | "all">("all");
  const [sort, setSort] = useState<"top" | "new">("top");
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [featured, setFeatured] = useState<NewsPost | null>(null);
  const [votes, setVotes] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listNewsPosts({ kind: tab === "all" ? undefined : tab, sort, limit: 80 })
      .then(async (rows) => {
        if (!alive) return;
        const feat = rows.find((p) => p.featured) ?? null;
        setFeatured(feat);
        setPosts(rows.filter((p) => p.id !== feat?.id));
        setVotes(await getMyVotes(rows.map((r) => r.id)));
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [tab, sort]);

  function handleVoted(id: string, newVote: number, delta: number) {
    setVotes((m) => new Map(m).set(id, newVote));
    setPosts((rows) => rows.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p)));
    if (featured && featured.id === id) setFeatured({ ...featured, score: featured.score + delta });
  }

  const ld = [
    buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "News", path: "/news" }]),
    buildItemListSchema(
      [...(featured ? [featured] : []), ...posts].slice(0, 20).map((p) => ({ name: p.title, path: `/news/${p.slug}` })),
      "MasterChess News",
    ),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "MasterChess News",
      description: "Official news of MasterChess.live — platform updates, founder story, tournaments and community.",
      url: "https://masterchess.live/news",
      publisher: { "@type": "Organization", name: "MasterChess", url: "https://masterchess.live/" },
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="MasterChess News — Official Newsroom of MasterChess.live"
        description="Official news of MasterChess.live. Platform updates, founder story, tournaments, AI features and community highlights — fresh chess news every week."
        path="/news"
        jsonLd={ld}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Newsroom branding */}
        <header className="mb-6 border-b border-amber-400/20 pb-5">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-amber-300/80 mb-1">
            <Crown className="w-3.5 h-3.5" /> Masterchess News
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Official Newsroom of MasterChess.live</h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-2xl">
            Platform updates, the founder story, tournament coverage and community highlights — written by players, for players.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {INTERNAL.map((l) => (
              <Link key={l.href} to={l.href} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-200 hover:bg-amber-500/20">
                {l.label}
              </Link>
            ))}
            <Link to="/news/submit" className="text-xs px-2.5 py-1 rounded-full bg-amber-500 text-black font-semibold inline-flex items-center gap-1">
              <Plus className="w-3 h-3" /> Submit
            </Link>
          </div>
        </header>

        {/* Featured story */}
        {featured && (
          <Link
            to={`/news/${featured.slug}`}
            className="group block mb-8 rounded-2xl overflow-hidden border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-card/40 to-background hover:border-amber-300/60 transition"
          >
            <div className="grid md:grid-cols-[1.2fr_1fr]">
              {featured.cover_image && (
                <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-black">
                  <img src={featured.cover_image} alt={featured.title} loading="eager" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                </div>
              )}
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-semibold uppercase tracking-wider text-[10px]">Featured</span>
                  <span className={`px-1.5 py-0.5 rounded border ${KIND_COLOR[featured.kind]}`}>{KIND_LABEL[featured.kind]}</span>
                  <span className="text-muted-foreground">{timeAgo(featured.created_at)}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight group-hover:text-amber-200">
                  {featured.title}
                </h2>
                {featured.author_name && (
                  <p className="text-xs text-muted-foreground mt-2">By {featured.author_name}</p>
                )}
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                  {(featured.body_md ?? "").replace(/[*_#>`\[\]]/g, "").slice(0, 220)}…
                </p>
                <span className="mt-4 inline-flex w-fit items-center gap-1 text-amber-300 text-sm font-semibold">Read the story →</span>
              </div>
            </div>
          </Link>
        )}

        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex gap-1 p-1 rounded-lg bg-card/40 border border-border/40 overflow-x-auto max-w-full">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition whitespace-nowrap ${
                  tab === t.id ? "bg-amber-500/20 text-amber-200" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-card/40 border border-border/40">
            <button onClick={() => setSort("top")} className={`px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1 ${sort === "top" ? "bg-amber-500/20 text-amber-200" : "text-muted-foreground"}`}>
              <Flame className="w-3.5 h-3.5" /> Top
            </button>
            <button onClick={() => setSort("new")} className={`px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1 ${sort === "new" ? "bg-amber-500/20 text-amber-200" : "text-muted-foreground"}`}>
              <Clock className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground py-10 text-center">Loading…</p>
        ) : posts.length === 0 && !featured ? (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-10 text-center">
            <p className="text-lg font-medium mb-1">No posts yet</p>
            <p className="text-muted-foreground text-sm mb-4">Be the first to share an update, tournament link or chess moment.</p>
            <Link to="/news/submit" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold">
              <Plus className="w-4 h-4" /> Submit the first post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {posts.map((p, i) => (
              <NewsRow key={p.id} rank={i + 1} post={p} myVote={votes.get(p.id) ?? 0} onVoted={handleVoted} />
            ))}
          </div>
        )}

        <footer className="mt-12 pt-6 border-t border-border/30 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <a href="/rss.xml" className="hover:text-amber-300">RSS feed</a>
          <a href="/news-sitemap.xml" className="hover:text-amber-300">News sitemap</a>
          <Link to="/nikola" className="hover:text-amber-300">About the founder</Link>
          <Link to="/press" className="hover:text-amber-300">Press</Link>
        </footer>
      </main>
      <Footer />
    </div>
  );
}
