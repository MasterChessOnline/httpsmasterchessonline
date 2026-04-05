import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Heart, MessageCircle, Share2, Plus, Trophy, Crown,
  Flame, TrendingUp, Star, Image as ImageIcon, Swords
} from "lucide-react";
import { getRank } from "@/lib/ranks";

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  fen: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: { display_name: string | null; rating: number; avatar_url: string | null };
  liked?: boolean;
}

export default function Community() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [tab, setTab] = useState<"feed" | "trending" | "following">("feed");
  const [topPlayers, setTopPlayers] = useState<any[]>([]);

  useEffect(() => {
    loadPosts();
    loadTopPlayers();
  }, [tab]);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, rating, avatar_url").in("user_id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      let likedSet = new Set<string>();
      if (user) {
        const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_id", user.id);
        likedSet = new Set(likes?.map(l => l.post_id) || []);
      }

      setPosts(data.map(p => ({
        ...p,
        profile: profileMap.get(p.user_id),
        liked: likedSet.has(p.id),
      })));
    }
  };

  const loadTopPlayers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, rating, games_won, games_played, avatar_url")
      .order("rating", { ascending: false })
      .limit(5);
    if (data) setTopPlayers(data);
  };

  const handlePost = async () => {
    if (!user || !newPost.trim()) return;
    setPosting(true);
    await supabase.from("community_posts").insert({
      user_id: user.id,
      content: newPost.trim(),
      post_type: "text",
    });
    setNewPost("");
    setShowCompose(false);
    setPosting(false);
    loadPosts();
  };

  const toggleLike = async (post: CommunityPost) => {
    if (!user) return;
    if (post.liked) {
      await supabase.from("post_likes").delete().eq("user_id", user.id).eq("post_id", post.id);
    } else {
      await supabase.from("post_likes").insert({ user_id: user.id, post_id: post.id });
    }
    loadPosts();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Community</h1>
              <p className="text-sm text-muted-foreground">Share, discuss, and connect with chess players</p>
            </div>
          </div>
          {user && (
            <Button onClick={() => setShowCompose(true)}>
              <Plus className="w-4 h-4 mr-1" /> New Post
            </Button>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-muted/30 border border-border w-fit">
          {(["feed", "trending", "following"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Posts Feed */}
          <div className="space-y-4">
            {/* Compose */}
            <AnimatePresence>
              {showCompose && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-primary/20 bg-card p-4">
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share a chess moment, analysis, or thought..."
                    className="w-full bg-transparent border-none outline-none resize-none min-h-[80px] text-sm" />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm"><ImageIcon className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><Swords className="w-4 h-4" /></Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>Cancel</Button>
                      <Button size="sm" onClick={handlePost} disabled={posting || !newPost.trim()}>Post</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Post List */}
            {posts.map((post, i) => {
              const rank = post.profile ? getRank(post.profile.rating) : null;
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl border border-border bg-card/50 p-4 hover:border-border/60 transition-colors">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                      {post.profile?.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${post.user_id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                        {post.profile?.display_name || "Player"}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {rank && <span>{rank.icon} {rank.label}</span>}
                        <span>·</span>
                        <span>{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleLike(post)}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${post.liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}`}>
                      <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                      <span>{post.likes_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" /><span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="w-4 h-4" /><span>Share</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {posts.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No posts yet. Be the first to share!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Top Players */}
            <div className="rounded-2xl border border-border bg-card/50 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Top Players
              </h3>
              <div className="space-y-2.5">
                {topPlayers.map((p, i) => {
                  const rank = getRank(p.rating);
                  return (
                    <Link key={p.user_id} to={`/profile/${p.user_id}`}
                      className="flex items-center gap-2.5 hover:bg-muted/30 rounded-lg p-1.5 -mx-1.5 transition-colors">
                      <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {p.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.display_name || "Player"}</div>
                        <div className="text-[10px] text-muted-foreground">{rank.icon} {p.rating} ELO</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-border bg-card/50 p-4">
              <h3 className="font-semibold mb-3 text-sm">Explore</h3>
              <div className="space-y-1.5">
                {[
                  { to: "/clubs", icon: Users, label: "Chess Clubs" },
                  { to: "/leaderboard", icon: TrendingUp, label: "Leaderboard" },
                  { to: "/tournaments", icon: Crown, label: "Tournaments" },
                  { to: "/friends", icon: Star, label: "Friends" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
