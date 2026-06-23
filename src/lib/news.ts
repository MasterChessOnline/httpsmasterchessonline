// News helpers — HN-style ranking + slugification.
import { supabase } from "@/integrations/supabase/client";

export type NewsKind = "update" | "world" | "community";

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  url: string | null;
  body_md: string | null;
  kind: NewsKind;
  source: string | null;
  author_id: string | null;
  score: number;
  comment_count: number;
  created_at: string;
}

export interface NewsComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  body: string;
  created_at: string;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Classic Hacker News ranking: (score-1)/(age_hours+2)^1.8 */
export function hnRank(post: { score: number; created_at: string }): number {
  const ageHours = Math.max(0, (Date.now() - new Date(post.created_at).getTime()) / 3_600_000);
  return (post.score - 1) / Math.pow(ageHours + 2, 1.8);
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return `${Math.floor(s / 604800)}w ago`;
}

export const KIND_LABEL: Record<NewsKind, string> = {
  update: "MasterChess",
  world: "World Chess",
  community: "Community",
};

export const KIND_COLOR: Record<NewsKind, string> = {
  update: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  world: "text-sky-300 border-sky-400/30 bg-sky-500/10",
  community: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
};

export async function listNewsPosts(opts: { kind?: NewsKind; sort?: "top" | "new"; limit?: number } = {}) {
  const { kind, sort = "top", limit = 60 } = opts;
  let q = supabase.from("news_posts" as any).select("*").limit(limit);
  if (kind) q = q.eq("kind", kind);
  q = sort === "new" ? q.order("created_at", { ascending: false }) : q.order("score", { ascending: false }).order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data as unknown as NewsPost[]) ?? [];
  if (sort === "top") rows = [...rows].sort((a, b) => hnRank(b) - hnRank(a));
  return rows;
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  const { data, error } = await supabase.from("news_posts" as any).select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as unknown as NewsPost) ?? null;
}

export async function listComments(postId: string) {
  const { data, error } = await supabase
    .from("news_comments" as any)
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as unknown as NewsComment[]) ?? [];
}

export async function getMyVotes(postIds: string[]) {
  if (!postIds.length) return new Map<string, number>();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Map();
  const { data } = await supabase.from("news_votes" as any).select("post_id,value").in("post_id", postIds).eq("user_id", user.id);
  const m = new Map<string, number>();
  (data ?? []).forEach((v: any) => m.set(v.post_id, v.value));
  return m;
}

export async function castVote(postId: string, value: 1 | -1 | 0) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to vote");
  if (value === 0) {
    await supabase.from("news_votes" as any).delete().eq("post_id", postId).eq("user_id", user.id);
  } else {
    await supabase.from("news_votes" as any).upsert({ post_id: postId, user_id: user.id, value }, { onConflict: "post_id,user_id" });
  }
}
