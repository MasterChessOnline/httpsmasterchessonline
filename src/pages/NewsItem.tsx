import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, ExternalLink, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getNewsBySlug, listComments, timeAgo, KIND_COLOR, KIND_LABEL, castVote, getMyVotes, type NewsPost, type NewsComment } from "@/lib/news";

export default function NewsItem() {
  const { slug = "" } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [myVote, setMyVote] = useState(0);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const p = await getNewsBySlug(slug);
      if (!alive) return;
      setPost(p);
      if (p) {
        setComments(await listComments(p.id));
        const v = await getMyVotes([p.id]);
        setMyVote(v.get(p.id) ?? 0);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [slug]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !post || !body.trim()) return;
    setSending(true);
    const { error } = await supabase.from("news_comments" as any).insert({
      post_id: post.id, user_id: user.id, body: body.trim(),
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    setComments(await listComments(post.id));
  }

  async function vote(v: 1 | -1) {
    if (!user || !post) { toast.error("Sign in to vote"); return; }
    const next = myVote === v ? 0 : v;
    const delta = next - myVote;
    await castVote(post.id, next as 1 | -1 | 0);
    setMyVote(next);
    setPost({ ...post, score: post.score + delta });
  }

  if (loading) return <div className="min-h-screen bg-background text-foreground"><Navbar /><main className="container mx-auto px-4 py-12 max-w-3xl text-muted-foreground">Loading…</main></div>;
  if (!post) return <div className="min-h-screen bg-background text-foreground"><Navbar /><main className="container mx-auto px-4 py-12 max-w-3xl"><p>Post not found.</p><Link to="/news" className="text-amber-300">← Back to News</Link></main></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={`${post.title} – MasterChess News`}
        description={(post.body_md ?? post.title).slice(0, 155)}
        path={`/news/${post.slug}`}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: post.title,
          datePublished: post.created_at,
          dateModified: post.created_at,
          url: `https://masterchess.live/news/${post.slug}`,
          publisher: { "@type": "Organization", name: "MasterChess", logo: { "@type": "ImageObject", url: "https://masterchess.live/og-image.jpg" } },
        }}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/news" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>

        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-xs">
            <span className={`px-1.5 py-0.5 rounded border ${KIND_COLOR[post.kind]}`}>{KIND_LABEL[post.kind]}</span>
            <span className="text-muted-foreground">{timeAgo(post.created_at)}</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{post.title}</h1>
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-amber-300 hover:text-amber-200 text-sm inline-flex items-center gap-1 mt-2">
              {post.url} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </header>

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => vote(1)} className={`px-3 py-1 rounded-lg border ${myVote === 1 ? "bg-amber-500/20 border-amber-400 text-amber-200" : "border-border/40 hover:border-amber-400/50"}`}>▲ Upvote</button>
          <span className="font-semibold tabular-nums">{post.score}</span>
          <button onClick={() => vote(-1)} className={`px-3 py-1 rounded-lg border ${myVote === -1 ? "bg-red-500/20 border-red-400 text-red-200" : "border-border/40 hover:border-red-400/50"}`}>▼</button>
        </div>

        {post.body_md && (
          <div className="prose prose-invert prose-amber max-w-none mb-10">
            <ReactMarkdown>{post.body_md}</ReactMarkdown>
          </div>
        )}

        <section>
          <h2 className="font-display text-xl font-semibold mb-3">{comments.length} comments</h2>
          {user ? (
            <form onSubmit={submitComment} className="mb-6">
              <textarea
                value={body} onChange={(e) => setBody(e.target.value)}
                rows={3} maxLength={4000}
                placeholder="Add a comment…"
                className="w-full rounded-lg bg-card/60 border border-border/40 p-3 text-sm focus:outline-none focus:border-amber-400/50"
              />
              <button type="submit" disabled={sending || !body.trim()} className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-sm font-semibold">
                <Send className="w-4 h-4" /> Post comment
              </button>
            </form>
          ) : (
            <p className="text-muted-foreground text-sm mb-6"><Link to="/login" className="text-amber-300">Sign in</Link> to comment.</p>
          )}

          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg bg-card/40 border border-border/30 p-3">
                <div className="text-xs text-muted-foreground mb-1">{timeAgo(c.created_at)}</div>
                <p className="text-sm whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
