import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  ThumbsUp,
  Heart,
  Flame,
  Flag,
  ShieldCheck,
  PenSquare,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Clock,
  Pin,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGoogleReview, trackReviewClick } from "@/lib/google-review";

interface ReviewRow {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  helpful_count: number;
  like_count: number;
  love_count: number;
  report_count: number;
  featured: boolean;
  pinned: boolean;
  hidden: boolean;
}
interface ProfileLite {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  rating?: number | null;
  total_games?: number | null;
}
interface ReactionRow {
  review_id: string;
  user_id: string;
  reaction: "like" | "love" | "helpful" | "report";
}

type Filter = "all" | "5" | "4" | "3" | "2" | "1" | "verified" | "helpful" | "newest" | "oldest";

const REACTIONS = [
  { key: "like" as const, icon: ThumbsUp, label: "Like", color: "text-blue-400" },
  { key: "love" as const, icon: Heart, label: "Love", color: "text-rose-400" },
  { key: "helpful" as const, icon: Flame, label: "Helpful", color: "text-orange-400" },
  { key: "report" as const, icon: Flag, label: "Report", color: "text-muted-foreground" },
];

function isVerified(p?: ProfileLite | null) {
  if (!p) return false;
  return (p.total_games ?? 0) >= 50 || (p.rating ?? 0) >= 1400;
}

export default function Reviews() {
  const { user } = useAuth();
  const { reviewUrl: GOOGLE_REVIEW_URL } = useGoogleReview();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set()); // key = `${review_id}:${reaction}`
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // form state
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("site_ratings")
      .select(
        "id,user_id,rating,title,comment,created_at,helpful_count,like_count,love_count,report_count,featured,pinned,hidden",
      )
      .eq("hidden", false)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    const rows = (data ?? []) as ReviewRow[];
    setReviews(rows);

    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url,rating,total_games")
        .in("user_id", ids);
      const map: Record<string, ProfileLite> = {};
      (profs ?? []).forEach((p: any) => (map[p.user_id] = p));
      setProfiles(map);
    }

    if (user) {
      const { data: mine } = await supabase
        .from("site_review_reactions")
        .select("review_id,user_id,reaction")
        .eq("user_id", user.id);
      const set = new Set<string>();
      (mine ?? []).forEach((r: ReactionRow) => set.add(`${r.review_id}:${r.reaction}`));
      setMyReactions(set);

      // hydrate form with existing review
      const my = rows.find((r) => r.user_id === user.id);
      if (my) {
        setStars(my.rating);
        setTitle(my.title ?? "");
        setComment(my.comment ?? "");
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user?.id]);

  // realtime updates
  useEffect(() => {
    const ch = supabase
      .channel("reviews-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_ratings" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    /* eslint-disable-next-line */
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => (dist[Math.max(1, Math.min(5, r.rating)) - 1] += 1));
    const helpful = reviews.reduce((s, r) => s + r.helpful_count, 0);
    const verifiedCount = reviews.filter((r) => isVerified(profiles[r.user_id])).length;
    return { total, avg, dist, helpful, verifiedCount };
  }, [reviews, profiles]);

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (["5", "4", "3", "2", "1"].includes(filter)) {
      list = list.filter((r) => r.rating === Number(filter));
    } else if (filter === "verified") {
      list = list.filter((r) => isVerified(profiles[r.user_id]));
    } else if (filter === "helpful") {
      list.sort((a, b) => b.helpful_count - a.helpful_count);
    } else if (filter === "oldest") {
      list.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    } else if (filter === "newest") {
      list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => {
        const name = profiles[r.user_id]?.display_name?.toLowerCase() ?? "";
        return (
          name.includes(q) ||
          (r.title ?? "").toLowerCase().includes(q) ||
          (r.comment ?? "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [reviews, filter, query, profiles]);

  const topReviews = useMemo(
    () =>
      [...reviews]
        .filter((r) => r.rating >= 5 && (r.comment?.length ?? 0) > 20)
        .sort((a, b) => b.helpful_count + b.like_count - (a.helpful_count + a.like_count))
        .slice(0, 3),
    [reviews],
  );

  async function submit() {
    if (!user) {
      toast.error("Sign in to write a review");
      return;
    }
    if (stars < 1) {
      toast.error("Pick at least one star");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("site_ratings").upsert(
      {
        user_id: user.id,
        rating: stars,
        title: title.trim().slice(0, 100) || null,
        comment: comment.trim().slice(0, 1000) || null,
      },
      { onConflict: "user_id" },
    );
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit your review.");
      return;
    }
    setThanks(true);
    setTimeout(() => {
      setThanks(false);
      setOpen(false);
    }, 1800);
    toast.success("Thanks for your review!");
    await load();
  }

  async function toggleReaction(reviewId: string, reaction: ReactionRow["reaction"]) {
    if (!user) {
      toast.error("Sign in to react");
      return;
    }
    const key = `${reviewId}:${reaction}`;
    const has = myReactions.has(key);
    // optimistic
    setMyReactions((prev) => {
      const next = new Set(prev);
      has ? next.delete(key) : next.add(key);
      return next;
    });
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const delta = has ? -1 : 1;
        return {
          ...r,
          like_count: r.like_count + (reaction === "like" ? delta : 0),
          love_count: r.love_count + (reaction === "love" ? delta : 0),
          helpful_count: r.helpful_count + (reaction === "helpful" ? delta : 0),
          report_count: r.report_count + (reaction === "report" ? delta : 0),
        };
      }),
    );
    if (has) {
      await supabase
        .from("site_review_reactions")
        .delete()
        .eq("review_id", reviewId)
        .eq("user_id", user.id)
        .eq("reaction", reaction);
    } else {
      await supabase
        .from("site_review_reactions")
        .insert({ review_id: reviewId, user_id: user.id, reaction });
      if (reaction === "report") toast.success("Review reported. Thanks!");
    }
  }

  // JSON-LD aggregate rating + reviews — REAL data only. When there are no
  // ratings yet we omit aggregateRating entirely so Google never sees a fake
  // number (per https://developers.google.com/search/docs/appearance/structured-data/review-snippet).
  const jsonLd = useMemo(() => {
    const base: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "MasterChess",
      description: "Play chess online — tournaments, bots, lessons, and a worldwide community.",
      brand: { "@type": "Brand", name: "MasterChess" },
    };
    if (stats.total > 0) {
      base.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: stats.avg.toFixed(1),
        reviewCount: stats.total,
        ratingCount: stats.total,
        bestRating: 5,
        worstRating: 1,
      };
    }
    if (topReviews.length > 0) {
      base.review = topReviews.map((r) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        author: {
          "@type": "Person",
          name: profiles[r.user_id]?.display_name || "MasterChess player",
        },
        datePublished: r.created_at,
        name: r.title || "MasterChess review",
        reviewBody: r.comment || "",
      }));
    }
    return base;
  }, [stats.total, stats.avg, topReviews, profiles]);

  const avgDisplay = stats.total > 0 ? stats.avg.toFixed(1) : "—";
  const titleTag = stats.total > 0
    ? `MasterChess Reviews — Rated ${avgDisplay}/5 by ${stats.total} Chess Players`
    : "MasterChess Reviews — Real Player Ratings & Feedback";
  const descTag = stats.total > 0
    ? `Read ${stats.total} real player reviews of MasterChess. Average rating ${avgDisplay}/5. Write your own review and share your chess experience.`
    : "Read real player reviews of MasterChess. Tournaments, AI coach, puzzles, lessons — rated by the community. Write your own review and share your experience.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{titleTag}</title>
        <meta name="description" content={descTag} />
        <link rel="canonical" href="https://masterchess.live/reviews" />
        <meta property="og:title" content={titleTag} />
        <meta property="og:description" content={descTag} />
        <meta property="og:url" content="https://masterchess.live/reviews" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at top, hsl(var(--primary)/0.25), transparent 60%), radial-gradient(ellipse at bottom right, hsl(45 100% 50% / 0.15), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 py-14 sm:py-20 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-yellow-400/10 text-yellow-400 border-yellow-400/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Trusted by chess players worldwide
            </Badge>
            <div className="flex justify-center mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="w-8 h-8 sm:w-10 sm:h-10 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                />
              ))}
            </div>
            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight">
              {stats.total > 0 ? (
                <>
                  <span className="text-yellow-400">{stats.avg.toFixed(1)}</span>
                  <span className="text-muted-foreground">/5</span> Average Rating
                </>
              ) : (
                <>Be the first to rate <span className="text-gradient-gold">MasterChess</span></>
              )}
            </h1>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              {stats.total > 0
                ? `Based on ${stats.total.toLocaleString()} ${stats.total === 1 ? "review" : "reviews"} from real players`
                : "Real reviews only — no fake ratings, no baseline numbers."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300">
                    <PenSquare className="w-4 h-4 mr-2" /> Write a review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Write your review</DialogTitle>
                  </DialogHeader>
                  <div className="relative">
                    <AnimatePresence>
                      {thanks && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex items-center justify-center bg-card/95 backdrop-blur"
                        >
                          <div className="text-center">
                            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <p className="font-display text-lg font-semibold">
                              Thank you for your review!
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      className="flex justify-center gap-1 my-4"
                      onMouseLeave={() => setHover(0)}
                    >
                      {[1, 2, 3, 4, 5].map((n) => {
                        const active = (hover || stars) >= n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setStars(n)}
                            onMouseEnter={() => setHover(n)}
                            className="p-1 transition-transform hover:scale-125 active:scale-95"
                            aria-label={`${n} star${n > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={`w-10 h-10 transition-colors ${
                                active
                                  ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)]"
                                  : "text-muted-foreground/40"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                      placeholder="Review title (e.g. Amazing chess platform)"
                      className="mb-3"
                    />
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value.slice(0, 1000))}
                      placeholder="Share your experience with MasterChess…"
                      rows={5}
                      className="mb-3"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {comment.length}/1000
                      </span>
                      {user ? (
                        <Button onClick={submit} disabled={submitting || stars < 1}>
                          {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                          Submit review
                        </Button>
                      ) : (
                        <Button asChild>
                          <Link to="/login">Sign in to review</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button asChild size="lg" variant="outline">
                <a href="#all-reviews">Read reviews</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
              >
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackReviewClick("reviews-hero")}
                >
                  <Star className="w-4 h-4 mr-2 fill-current" /> Review on Google
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 text-center">
            <div className="text-5xl font-display font-bold text-yellow-400 tabular-nums">
              {stats.total > 0 ? stats.avg.toFixed(1) : "—"}
            </div>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${
                    stats.avg >= n - 0.25
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average rating</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = stats.dist[n - 1];
              const pct = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2 mb-1.5 last:mb-0">
                  <span className="text-xs w-7 text-muted-foreground tabular-nums">{n}★</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                  <span className="text-xs w-10 text-right text-muted-foreground tabular-nums">
                    {stats.total ? `${Math.round(pct)}%` : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-6 grid grid-cols-2 gap-3 text-center">
            <Stat label="Total reviews" value={stats.total.toLocaleString()} />
            <Stat label="Helpful votes" value={stats.helpful.toLocaleString()} />
            <Stat label="Verified players" value={stats.verifiedCount.toLocaleString()} />
            <Stat label="5★ count" value={stats.dist[4].toLocaleString()} />
          </div>
        </div>
      </section>

      {/* TOP REVIEWS */}
      {topReviews.length > 0 && (
        <section className="container mx-auto px-4 pb-8 max-w-5xl">
          <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" /> Top reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topReviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                profile={profiles[r.user_id]}
                myReactions={myReactions}
                onReact={toggleReaction}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* FILTERS + SEARCH */}
      <section id="all-reviews" className="container mx-auto px-4 pb-4 max-w-5xl scroll-mt-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" /> All reviews
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, title, keyword…"
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["all", "All"],
              ["5", "5★"],
              ["4", "4★"],
              ["3", "3★"],
              ["2", "2★"],
              ["1", "1★"],
              ["verified", "Verified"],
              ["helpful", "Most helpful"],
              ["newest", "Newest"],
              ["oldest", "Oldest"],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filter === k
                  ? "bg-yellow-400 text-black border-yellow-400"
                  : "border-border/60 bg-card/40 text-foreground/80 hover:bg-card"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* LIST */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground italic">
            No reviews match this filter. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                profile={profiles[r.user_id]}
                myReactions={myReactions}
                onReact={toggleReaction}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 border border-border/40 p-3">
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ReviewCard({
  review,
  profile,
  myReactions,
  onReact,
  compact = false,
}: {
  review: ReviewRow;
  profile?: ProfileLite;
  myReactions: Set<string>;
  onReact: (id: string, r: ReactionRow["reaction"]) => void;
  compact?: boolean;
}) {
  const name = profile?.display_name?.trim() || "Anonymous player";
  const initial = name.charAt(0).toUpperCase();
  const verified = isVerified(profile);
  const date = new Date(review.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border ${
        review.pinned
          ? "border-yellow-400/40 bg-yellow-400/5"
          : "border-border/60 bg-card/60"
      } backdrop-blur p-5 shadow-lg`}
    >
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              className="w-10 h-10 rounded-full object-cover border border-border/60"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm truncate max-w-[180px]">{name}</span>
              {verified && (
                <Badge className="h-5 px-1.5 bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">
                  <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified
                </Badge>
              )}
              {review.pinned && (
                <Badge className="h-5 px-1.5 bg-yellow-400/15 text-yellow-400 border-yellow-400/30 text-[10px]">
                  <Pin className="w-3 h-3 mr-0.5" /> Pinned
                </Badge>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground">{date}</div>
          </div>
        </div>
        <div className="flex shrink-0">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`w-4 h-4 ${
                review.rating >= n
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </header>

      {review.title && (
        <h3 className="font-display text-lg font-bold mb-1 leading-snug">{review.title}</h3>
      )}
      {review.comment && (
        <p
          className={`text-sm text-foreground/85 whitespace-pre-wrap ${
            compact ? "line-clamp-4" : ""
          }`}
        >
          {review.comment}
        </p>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-2">
        {REACTIONS.map(({ key, icon: Icon, label, color }) => {
          const active = myReactions.has(`${review.id}:${key}`);
          const count =
            key === "like"
              ? review.like_count
              : key === "love"
                ? review.love_count
                : key === "helpful"
                  ? review.helpful_count
                  : review.report_count;
          return (
            <button
              key={key}
              onClick={() => onReact(review.id, key)}
              className={`inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                active
                  ? `${color} border-current bg-current/10`
                  : "text-muted-foreground border-border/60 hover:bg-card"
              }`}
              aria-label={label}
            >
              <Icon className="w-3.5 h-3.5" />
              {key !== "report" && <span className="tabular-nums">{count}</span>}
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </footer>
    </motion.article>
  );
}
