import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle, Send, Sparkles, Swords, Trophy, TrendingUp, Users } from "lucide-react";

const EMOJIS = ["🔥", "🧠", "🤯", "😂", "♟️"];

type FeedItem = {
  id: string;
  user_id: string;
  kind: string;
  payload: any;
  reaction_count: number;
  comment_count: number;
  created_at: string;
  profile?: { username: string | null; avatar_url: string | null; rating: number | null } | null;
  opponent?: { username: string | null; avatar_url: string | null } | null;
  my_reactions?: string[];
  reactions_by_emoji?: Record<string, number>;
};

type Comment = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: { username: string | null; avatar_url: string | null } | null;
};

export default function Feed() {
  const { user } = useAuth();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [filter, setFilter] = useState<"following" | "global">("global");
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState<Record<string, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    document.title = "Feed — MasterChess";
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      let userIds: string[] | null = null;
      if (filter === "following" && user) {
        const { data: fl } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
        userIds = (fl ?? []).map((r: any) => r.following_id);
        if (userIds.length === 0) userIds = [user.id];
      }

      let q = supabase
        .from("feed_items")
        .select("id, user_id, kind, payload, reaction_count, comment_count, created_at")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(40);
      if (userIds) q = q.in("user_id", userIds);

      const { data, error } = await q;
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      const list = (data ?? []) as FeedItem[];

      const allUserIds = Array.from(
        new Set(
          list.flatMap((i) => [i.user_id, i.payload?.opponent_id].filter(Boolean) as string[]),
        ),
      );

      const [{ data: profs }, { data: myReacts }, { data: reactAll }] = await Promise.all([
        allUserIds.length
          ? supabase.from("profiles").select("id, username, avatar_url, rating").in("id", allUserIds)
          : Promise.resolve({ data: [] as any[] }),
        user && list.length
          ? supabase
              .from("feed_reactions")
              .select("feed_item_id, emoji")
              .eq("user_id", user.id)
              .in("feed_item_id", list.map((i) => i.id))
          : Promise.resolve({ data: [] as any[] }),
        list.length
          ? supabase
              .from("feed_reactions")
              .select("feed_item_id, emoji")
              .in("feed_item_id", list.map((i) => i.id))
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      const myMap: Record<string, string[]> = {};
      (myReacts ?? []).forEach((r: any) => {
        (myMap[r.feed_item_id] ??= []).push(r.emoji);
      });
      const byEmoji: Record<string, Record<string, number>> = {};
      (reactAll ?? []).forEach((r: any) => {
        const m = (byEmoji[r.feed_item_id] ??= {});
        m[r.emoji] = (m[r.emoji] ?? 0) + 1;
      });

      list.forEach((i) => {
        i.profile = profMap.get(i.user_id) ?? null;
        if (i.payload?.opponent_id) i.opponent = profMap.get(i.payload.opponent_id) ?? null;
        i.my_reactions = myMap[i.id] ?? [];
        i.reactions_by_emoji = byEmoji[i.id] ?? {};
      });
      if (!alive) return;
      setItems(list);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [filter, user]);

  // Realtime: when new reactions/comments arrive, refresh that item's counts
  useEffect(() => {
    const channel = supabase
      .channel("feed-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feed_reactions" },
        (payload: any) => {
          const itemId = payload.new?.feed_item_id ?? payload.old?.feed_item_id;
          setItems((prev) =>
            prev.map((i) => {
              if (i.id !== itemId) return i;
              const delta = payload.eventType === "INSERT" ? 1 : -1;
              const emoji = payload.new?.emoji ?? payload.old?.emoji;
              const rbe = { ...(i.reactions_by_emoji ?? {}) };
              rbe[emoji] = Math.max((rbe[emoji] ?? 0) + delta, 0);
              return { ...i, reaction_count: Math.max(i.reaction_count + delta, 0), reactions_by_emoji: rbe };
            }),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feed_comments" },
        (payload: any) => {
          setItems((prev) =>
            prev.map((i) => (i.id === payload.new.feed_item_id ? { ...i, comment_count: i.comment_count + 1 } : i)),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleReaction = async (item: FeedItem, emoji: string) => {
    if (!user) return toast.error("Prijavi se da reaguješ");
    const has = item.my_reactions?.includes(emoji);
    if (has) {
      await supabase
        .from("feed_reactions")
        .delete()
        .eq("feed_item_id", item.id)
        .eq("user_id", user.id)
        .eq("emoji", emoji);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, my_reactions: (i.my_reactions ?? []).filter((e) => e !== emoji) }
            : i,
        ),
      );
    } else {
      const { error } = await supabase.from("feed_reactions").insert({
        feed_item_id: item.id,
        user_id: user.id,
        emoji,
      });
      if (error) return toast.error(error.message);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, my_reactions: [...(i.my_reactions ?? []), emoji] } : i,
        ),
      );
    }
  };

  const loadComments = async (item: FeedItem) => {
    if (openComments[item.id]) {
      const copy = { ...openComments };
      delete copy[item.id];
      setOpenComments(copy);
      return;
    }
    const { data } = await supabase
      .from("feed_comments")
      .select("id, user_id, body, created_at")
      .eq("feed_item_id", item.id)
      .order("created_at", { ascending: true })
      .limit(50);
    const uids = Array.from(new Set((data ?? []).map((c: any) => c.user_id)));
    const { data: profs } = uids.length
      ? await supabase.from("profiles").select("id, username, avatar_url").in("id", uids)
      : { data: [] as any[] };
    const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
    const enriched = (data ?? []).map((c: any) => ({ ...c, profile: map.get(c.user_id) ?? null }));
    setOpenComments({ ...openComments, [item.id]: enriched });
  };

  const postComment = async (item: FeedItem) => {
    if (!user) return toast.error("Prijavi se");
    const body = (commentDraft[item.id] ?? "").trim();
    if (!body) return;
    const { data, error } = await supabase
      .from("feed_comments")
      .insert({ feed_item_id: item.id, user_id: user.id, body })
      .select("id, user_id, body, created_at")
      .single();
    if (error) return toast.error(error.message);
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    setOpenComments({
      ...openComments,
      [item.id]: [...(openComments[item.id] ?? []), { ...(data as any), profile: prof }],
    });
    setCommentDraft({ ...commentDraft, [item.id]: "" });
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="text-amber-400" /> Feed
          </h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === "global" ? "default" : "outline"}
              onClick={() => setFilter("global")}
            >
              Globalno
            </Button>
            <Button
              size="sm"
              variant={filter === "following" ? "default" : "outline"}
              onClick={() => setFilter("following")}
              disabled={!user}
            >
              <Users size={14} className="mr-1" /> Pratim
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-neutral-500 text-center py-10">Učitavanje…</p>
        ) : items.length === 0 ? (
          <Card className="p-10 text-center bg-neutral-950 border-neutral-900">
            <p className="text-neutral-400">Nema aktivnosti još.</p>
            <p className="text-xs text-neutral-500 mt-2">
              Odigraj partiju ili prati nekog igrača.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <FeedItemCard
                key={item.id}
                item={item}
                onReact={(e) => toggleReaction(item, e)}
                onToggleComments={() => loadComments(item)}
                commentsOpen={!!openComments[item.id]}
                comments={openComments[item.id] ?? []}
                draft={commentDraft[item.id] ?? ""}
                setDraft={(v) => setCommentDraft({ ...commentDraft, [item.id]: v })}
                onPost={() => postComment(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedItemCard({
  item,
  onReact,
  onToggleComments,
  commentsOpen,
  comments,
  draft,
  setDraft,
  onPost,
}: {
  item: FeedItem;
  onReact: (e: string) => void;
  onToggleComments: () => void;
  commentsOpen: boolean;
  comments: Comment[];
  draft: string;
  setDraft: (v: string) => void;
  onPost: () => void;
}) {
  const when = useMemo(() => timeAgo(item.created_at), [item.created_at]);
  const p = item.profile;
  const opp = item.opponent;
  const isMatch = item.kind === "match_story";
  const result = item.payload?.result;
  const iWon =
    isMatch &&
    ((item.payload?.color === "white" && result === "1-0") ||
      (item.payload?.color === "black" && result === "0-1"));
  const isDraw = isMatch && result === "1/2-1/2";

  const title = (() => {
    switch (item.kind) {
      case "match_story":
        if (isDraw) return "remizirao/la";
        return iWon ? "je pobedio/la" : "je izgubio/la";
      case "rating_up":
        return `dostigao/la rejting ${item.payload?.new_rating ?? ""}`;
      case "tournament_win":
        return `osvojio/la turnir: ${item.payload?.tournament_name ?? ""}`;
      case "streak":
        return `ima win streak ${item.payload?.count ?? ""}`;
      case "badge_earned":
        return `zaradio/la bedž ${item.payload?.badge_name ?? ""}`;
      case "club_join":
        return `se pridružio/la klubu ${item.payload?.club_name ?? ""}`;
      default:
        return item.kind;
    }
  })();

  return (
    <Card className="bg-neutral-950 border-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Link to={p?.username ? `/u/${p.username}` : "#"} className="shrink-0">
          <div className="w-11 h-11 rounded-full bg-neutral-800 overflow-hidden">
            {p?.avatar_url ? (
              <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">♟</div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-sm">
            <Link to={p?.username ? `/u/${p.username}` : "#"} className="font-semibold hover:underline">
              {p?.username ?? "Neko"}
            </Link>{" "}
            <span className="text-neutral-400">{title}</span>
            {isMatch && opp && (
              <>
                {" "}
                <span className="text-neutral-400">protiv</span>{" "}
                <Link
                  to={opp.username ? `/u/${opp.username}` : "#"}
                  className="font-semibold hover:underline"
                >
                  {opp.username ?? "?"}
                </Link>
              </>
            )}
          </div>
          <div className="text-xs text-neutral-500">{when}</div>
        </div>
        {isMatch && (
          <Badge
            className={
              iWon
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : isDraw
                  ? "bg-neutral-700/40 text-neutral-300"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
            }
          >
            {isDraw ? "½–½" : iWon ? "Pobeda" : "Poraz"}
          </Badge>
        )}
      </div>

      {/* Body */}
      {isMatch && (
        <Link
          to={`/game/${item.payload?.game_id}/story`}
          className="block px-4 pb-3 group"
        >
          <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 p-4 group-hover:from-amber-500/20 transition">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-300">
                <Swords size={14} className="text-amber-400" />
                <span>
                  {item.payload?.time_control ?? ""} · {item.payload?.move_number ?? "?"} poteza
                </span>
              </div>
              <span className="text-xs text-amber-400 group-hover:underline">Vidi Match Story →</span>
            </div>
            {item.payload?.end_reason && (
              <div className="text-xs text-neutral-500 mt-1">Kraj: {item.payload.end_reason}</div>
            )}
          </div>
        </Link>
      )}
      {item.kind === "rating_up" && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <TrendingUp size={16} />
            <span className="font-bold text-xl">{item.payload?.new_rating}</span>
          </div>
        </div>
      )}
      {item.kind === "tournament_win" && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy size={16} />
            <span className="font-bold">{item.payload?.tournament_name}</span>
          </div>
        </div>
      )}

      {/* Reactions bar */}
      <div className="px-4 py-2 border-t border-neutral-900 flex items-center gap-1 flex-wrap">
        {EMOJIS.map((e) => {
          const active = item.my_reactions?.includes(e);
          const count = item.reactions_by_emoji?.[e] ?? 0;
          return (
            <button
              key={e}
              onClick={() => onReact(e)}
              className={`px-2 py-1 rounded-full text-sm border transition ${
                active
                  ? "bg-amber-500/20 border-amber-500/50"
                  : "border-neutral-800 hover:border-neutral-700"
              }`}
            >
              {e} {count > 0 && <span className="text-xs text-neutral-400 ml-1">{count}</span>}
            </button>
          );
        })}
        <button
          onClick={onToggleComments}
          className="ml-auto flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 px-2 py-1"
        >
          <MessageCircle size={14} />
          {item.comment_count}
        </button>
      </div>

      {/* Comments */}
      {commentsOpen && (
        <div className="px-4 py-3 border-t border-neutral-900 space-y-2">
          {comments.length === 0 && (
            <p className="text-xs text-neutral-500 italic">Budi prvi da komentarišeš.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                {c.profile?.avatar_url ? (
                  <img src={c.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <Link
                  to={c.profile?.username ? `/u/${c.profile.username}` : "#"}
                  className="font-semibold text-xs hover:underline"
                >
                  {c.profile?.username ?? "?"}
                </Link>
                <div className="text-neutral-300">{c.body}</div>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Napiši komentar…"
              maxLength={500}
              onKeyDown={(e) => e.key === "Enter" && onPost()}
              className="h-9"
            />
            <Button size="sm" onClick={onPost} disabled={!draft.trim()}>
              <Send size={14} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "sada";
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  if (d < 86400) return `${Math.floor(d / 3600)}h`;
  if (d < 604800) return `${Math.floor(d / 86400)}d`;
  return new Date(iso).toLocaleDateString("sr-RS");
}
