import { Link } from "react-router-dom";
import { ChevronUp, ChevronDown, ExternalLink, MessageSquare } from "lucide-react";
import { useState } from "react";
import { castVote, KIND_COLOR, KIND_LABEL, timeAgo, type NewsPost } from "@/lib/news";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  rank: number;
  post: NewsPost;
  myVote: number;
  onVoted: (id: string, newVote: number, delta: number) => void;
}

export default function NewsRow({ rank, post, myVote, onVoted }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const isExternal = !!post.url;
  const href = isExternal ? post.url! : `/news/${post.slug}`;
  const host = isExternal ? safeHost(post.url!) : null;

  async function vote(value: 1 | -1) {
    if (!user) {
      toast.error("Sign in to vote");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const next = myVote === value ? 0 : value;
      const delta = next - myVote;
      await castVote(post.id, next as 1 | -1 | 0);
      onVoted(post.id, next, delta);
    } catch (e: any) {
      toast.error(e.message ?? "Vote failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="flex gap-3 px-3 py-2.5 rounded-lg hover:bg-card/40 transition-colors">
      <div className="text-muted-foreground text-sm w-6 text-right pt-1 tabular-nums select-none">{rank}.</div>
      <div className="flex flex-col items-center pt-0.5">
        <button
          aria-label="Upvote"
          onClick={() => vote(1)}
          disabled={busy}
          className={`p-0.5 rounded transition ${myVote === 1 ? "text-amber-400" : "text-muted-foreground hover:text-amber-300"}`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold tabular-nums">{post.score}</span>
        <button
          aria-label="Downvote"
          onClick={() => vote(-1)}
          disabled={busy}
          className={`p-0.5 rounded transition ${myVote === -1 ? "text-red-400" : "text-muted-foreground hover:text-red-300"}`}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-amber-300 font-medium">
              {post.title} <ExternalLink className="inline w-3 h-3 -mt-0.5" />
            </a>
          ) : (
            <Link to={href} className="text-foreground hover:text-amber-300 font-medium">
              {post.title}
            </Link>
          )}
          {host && <span className="text-xs text-muted-foreground">({host})</span>}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
          <span className={`px-1.5 py-0.5 rounded border ${KIND_COLOR[post.kind]}`}>{KIND_LABEL[post.kind]}</span>
          <span>{timeAgo(post.created_at)}</span>
          <Link to={`/news/${post.slug}`} className="inline-flex items-center gap-1 hover:text-foreground">
            <MessageSquare className="w-3 h-3" /> {post.comment_count} comments
          </Link>
        </div>
      </div>
    </article>
  );
}

function safeHost(u: string): string {
  try { return new URL(u).host.replace(/^www\./, ""); } catch { return ""; }
}
