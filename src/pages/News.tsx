import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Flame, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import NewsRow from "@/components/news/NewsRow";
import { getMyVotes, listNewsPosts, type NewsKind, type NewsPost } from "@/lib/news";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/jsonld-builders";

const TABS: { id: NewsKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "update", label: "MasterChess" },
  { id: "world", label: "World Chess" },
  { id: "community", label: "Community" },
];

export default function News() {
  const [tab, setTab] = useState<NewsKind | "all">("all");
  const [sort, setSort] = useState<"top" | "new">("top");
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [votes, setVotes] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listNewsPosts({ kind: tab === "all" ? undefined : tab, sort, limit: 80 })
      .then(async (rows) => {
        if (!alive) return;
        setPosts(rows);
        setVotes(await getMyVotes(rows.map((r) => r.id)));
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [tab, sort]);

  function handleVoted(id: string, newVote: number, delta: number) {
    setVotes((m) => new Map(m).set(id, newVote));
    setPosts((rows) => rows.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p)));
  }

  const ld = [
    buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "News", path: "/news" }]),
    buildItemListSchema(
      posts.slice(0, 20).map((p) => ({ name: p.title, path: `/news/${p.slug}` })),
      "MasterChess News",
    ),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Chess News & Updates – MasterChess Feed"
        description="Fresh chess news, MasterChess platform updates and community posts. Upvote, comment and follow the chess world."
        path="/news"
        jsonLd={ld}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex items-end justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold flex items-center gap-2">
              <Flame className="w-7 h-7 text-amber-400" /> MasterChess News
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Fresh chess news, platform updates and community posts. Upvote what matters.
            </p>
          </div>
          <Link
            to="/news/submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Submit
          </Link>
        </header>

        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div className="flex gap-1 p-1 rounded-lg bg-card/40 border border-border/40">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  tab === t.id ? "bg-amber-500/20 text-amber-200" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-card/40 border border-border/40">
            <button
              onClick={() => setSort("top")}
              className={`px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1 ${sort === "top" ? "bg-amber-500/20 text-amber-200" : "text-muted-foreground"}`}
            >
              <Flame className="w-3.5 h-3.5" /> Top
            </button>
            <button
              onClick={() => setSort("new")}
              className={`px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1 ${sort === "new" ? "bg-amber-500/20 text-amber-200" : "text-muted-foreground"}`}
            >
              <Clock className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground py-10 text-center">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-card/40 p-10 text-center">
            <p className="text-lg font-medium mb-1">No posts yet</p>
            <p className="text-muted-foreground text-sm mb-4">Be the first to share an update, a tournament link or a chess moment.</p>
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
      </main>
      <Footer />
    </div>
  );
}
