import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface RatingRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ProfileLite {
  user_id: string;
  display_name: string | null;
  avatar_url?: string | null;
}

export default function SiteRating() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [myRating, setMyRating] = useState<RatingRow | null>(null);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_ratings")
      .select("id,user_id,rating,comment,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    const rows = (data ?? []) as RatingRow[];
    setRatings(rows);

    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url")
        .in("user_id", ids);
      const map: Record<string, ProfileLite> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.user_id] = p;
      });
      setProfiles(map);
    }

    if (user) {
      const mine = rows.find((r) => r.user_id === user.id) ?? null;
      setMyRating(mine);
      if (mine) {
        setStars(mine.rating);
        setComment(mine.comment ?? "");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [user?.id]);

  const avg = useMemo(() => {
    if (!ratings.length) return 0;
    return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
  }, [ratings]);

  const distribution = useMemo(() => {
    const buckets = [0, 0, 0, 0, 0]; // index 0 = 1 star
    ratings.forEach((r) => {
      const i = Math.max(1, Math.min(5, r.rating)) - 1;
      buckets[i] += 1;
    });
    return buckets;
  }, [ratings]);

  const submit = async () => {
    if (!user) {
      toast.error("Sign in to leave a rating");
      return;
    }
    if (stars < 1) {
      toast.error("Pick at least one star");
      return;
    }
    setSubmitting(true);
    const payload = {
      user_id: user.id,
      rating: stars,
      comment: comment.trim().slice(0, 500) || null,
    };
    const { error } = await supabase
      .from("site_ratings")
      .upsert(payload, { onConflict: "user_id" });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit your rating. Please try again.");
      return;
    }
    toast.success(myRating ? "Your rating was updated" : "Thank you for your rating!");
    setThanks(true);
    setTimeout(() => setThanks(false), 3500);
    await load();
  };

  return (
    <section
      id="rate-this-site"
      className="container mx-auto px-4 py-16 max-w-3xl scroll-mt-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 sm:p-8 shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Rate this site
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Tell us how MasterChess feels. Your feedback shapes the next update.
          </p>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-border/50 bg-background/40 p-4 flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-yellow-400 tabular-nums">
                {ratings.length > 0 ? avg.toFixed(1) : "—"}
                <span className="text-xl text-muted-foreground"> / 5</span>
              </div>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${
                      avg >= n - 0.25
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {ratings.length} {ratings.length === 1 ? "rating" : "ratings"}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/40 p-4">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = distribution[n - 1];
              const pct = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2 mb-1 last:mb-0">
                  <span className="text-xs w-6 text-muted-foreground tabular-nums">
                    {n}★
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                  <span className="text-xs w-8 text-right text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-border/60 bg-background/40 p-5 mb-6 relative overflow-hidden">
          <AnimatePresence>
            {thanks && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-card/90 backdrop-blur-sm"
              >
                <div className="text-center">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-green-400 mb-2" />
                  <p className="font-display text-lg font-semibold">
                    Thank you for your rating!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="flex items-center justify-center gap-1 mb-4"
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
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      active
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            placeholder="Write your feedback here…"
            rows={3}
            className="mb-3"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              {comment.length}/500
            </span>
            {user ? (
              <Button onClick={submit} disabled={submitting || stars < 1}>
                {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                {myRating ? "Update rating" : "Submit rating"}
              </Button>
            ) : (
              <Button asChild>
                <Link to="/login">Sign in to rate</Link>
              </Button>
            )}
          </div>
          {myRating && !thanks && (
            <p className="text-[11px] text-muted-foreground mt-2 text-center">
              You already rated MasterChess — submitting again updates your existing rating.
            </p>
          )}
        </div>

        {/* Public reviews list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Recent community reviews
            </h3>
            {ratings.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {ratings.length} total
              </span>
            )}
          </div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : ratings.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">
              No ratings yet. Be the first to share your thoughts!
            </div>
          ) : (
            ratings
              .filter((r) => r.comment) // show reviews with comments first
              .slice(0, 10)
              .concat(
                ratings.filter((r) => !r.comment).slice(0, 5),
              )
              .map((r) => {
                const p = profiles[r.user_id];
                const name = p?.display_name?.trim() || "Anonymous player";
                const initial = name.charAt(0).toUpperCase();
                const date = new Date(r.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border/50 bg-background/30 p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {p?.avatar_url ? (
                          <img
                            src={p.avatar_url}
                            alt={name}
                            className="w-7 h-7 rounded-full object-cover border border-border/60"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                            {initial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{name}</div>
                          <div className="text-[10px] text-muted-foreground">{date}</div>
                        </div>
                      </div>
                      <div className="flex shrink-0">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-3.5 h-3.5 ${
                              r.rating >= n
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-foreground/85 whitespace-pre-wrap">
                        {r.comment}
                      </p>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </motion.div>
    </section>
  );
}
