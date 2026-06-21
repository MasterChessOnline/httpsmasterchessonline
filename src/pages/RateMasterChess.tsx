import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, CheckCircle2, ShieldCheck, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useGoogleReview, trackReviewClick } from "@/lib/google-review";
import GoogleReviewsBlock from "@/components/GoogleReviewsBlock";

interface RatingRow {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
}

/**
 * Dedicated /rate-masterchess landing page — single-purpose, conversion-focused.
 * Submits to the same `site_ratings` table that powers the homepage widget
 * and /reviews hub, so every submission updates the global AggregateRating
 * schema automatically. No fake baselines: numbers reflect real users only.
 */
export default function RateMasterChess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { reviewUrl: GOOGLE_REVIEW_URL } = useGoogleReview();

  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("site_ratings")
        .select("id,user_id,rating,title,comment,created_at")
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (!alive) return;
      const rows = (data ?? []) as RatingRow[];
      setRatings(rows);
      if (user) {
        const mine = rows.find((r) => r.user_id === user.id);
        if (mine) {
          setStars(mine.rating);
          setTitle(mine.title ?? "");
          setComment(mine.comment ?? "");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const stats = useMemo(() => {
    const total = ratings.length;
    const avg = total ? ratings.reduce((s, r) => s + r.rating, 0) / total : 0;
    return { total, avg };
  }, [ratings]);

  async function submit() {
    if (!user) {
      toast.error("Sign in to rate MasterChess");
      navigate("/login?next=/rate-masterchess");
      return;
    }
    if (stars < 1) {
      toast.error("Please pick at least one star");
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
      toast.error("Could not save your rating. Please try again.");
      return;
    }
    setThanks(true);
    toast.success("Thank you for rating MasterChess!");
    // Ping IndexNow + Google so the new review surfaces in search faster.
    try {
      supabase.functions.invoke("indexnow-ping", {
        body: { urls: ["https://masterchess.live/reviews", "https://masterchess.live/"] },
      });
      supabase.functions.invoke("google-indexing-ping", {
        body: { url: "https://masterchess.live/reviews" },
      });
    } catch {}
    // Do NOT auto-redirect — the post-submit "Post on Google" CTA is the
    // funnel and it needs the user's attention. They click Skip to leave.
  }

  // Only emit schema when we have real ratings.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Rate MasterChess",
    url: "https://masterchess.live/rate-masterchess",
    description:
      "Rate MasterChess — share your honest 1–5 star review of the online chess platform.",
    isPartOf: { "@type": "WebSite", name: "MasterChess", url: "https://masterchess.live" },
  };
  if (stats.total > 0) {
    jsonLd.mainEntity = {
      "@type": "Product",
      name: "MasterChess",
      description:
        "Free online chess platform — play, train, and compete with players worldwide.",
      brand: { "@type": "Brand", name: "MasterChess" },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: stats.avg.toFixed(1),
        bestRating: 5,
        worstRating: 1,
        ratingCount: stats.total,
        reviewCount: stats.total,
      },
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Rate MasterChess — Share Your Review of the Chess Platform</title>
        <meta
          name="description"
          content="Rate MasterChess from 1 to 5 stars and tell other players what you think. Real reviews from real chess players."
        />
        <link rel="canonical" href="https://masterchess.live/rate-masterchess" />
        <meta property="og:title" content="Rate MasterChess" />
        <meta
          property="og:description"
          content="Share your honest rating and review of MasterChess — the free online chess platform."
        />
        <meta property="og:url" content="https://masterchess.live/rate-masterchess" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <section className="relative overflow-hidden border-b border-border/40">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at top, hsl(var(--primary)/0.25), transparent 60%)",
          }}
        />
        <div className="container mx-auto px-4 py-14 sm:py-20 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Real reviews from real players
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              Rate <span className="text-gradient-gold">MasterChess</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your honest feedback helps every chess player who visits this site.
            </p>

            {stats.total > 0 && (
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-yellow-400/30 bg-card/60 backdrop-blur px-4 py-2">
                <div className="flex">
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
                <span className="font-display font-bold tabular-nums text-yellow-400">
                  {stats.avg.toFixed(1)}/5
                </span>
                <span className="text-xs text-muted-foreground">
                  · {stats.total} {stats.total === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}
          </motion.div>
      </section>

      <section className="container mx-auto px-4 pt-6 max-w-3xl">
        <GoogleReviewsBlock title="Real Google reviews" />
      </section>

      <section className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="relative rounded-2xl border border-border bg-card/70 backdrop-blur p-6 sm:p-8 shadow-xl overflow-hidden">
          <AnimatePresence>
            {thanks && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/95 backdrop-blur p-6"
              >
                <CheckCircle2 className="w-14 h-14 text-green-400 mb-3" />
                <p className="font-display text-2xl font-semibold text-center">
                  Thanks! One last favor —
                </p>
                <p className="text-sm text-muted-foreground mt-2 mb-5 text-center max-w-sm">
                  Post the same review on Google so other chess players can find MasterChess. Takes 15 seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                  >
                    <a
                      href={GOOGLE_REVIEW_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackReviewClick("post-submit-funnel");
                        setTimeout(() => navigate("/reviews"), 800);
                      }}
                    >
                      <Star className="w-4 h-4 mr-2 fill-current" /> Post on Google
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/reviews")}
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-4">
                  Google reviews boost MasterChess's ranking in Google Maps & Search.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="flex items-center justify-center gap-1 mb-6"
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
                  className="p-1 transition-transform hover:scale-125 active:scale-95"
                >
                  <Star
                    className={`w-12 h-12 transition-colors ${
                      active
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.7)]"
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
            placeholder="Review title (optional, e.g. Best free chess site)"
            className="mb-3"
          />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            placeholder="Tell other players what you like about MasterChess…"
            rows={6}
            className="mb-3"
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground tabular-nums">
              {comment.length}/1000
            </span>
            {user ? (
              <Button onClick={submit} disabled={submitting || stars < 1} size="lg">
                {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Submit rating
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/login?next=/rate-masterchess">Sign in to rate</Link>
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 text-center">
            One rating per account. Submitting again updates your existing review.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <Link to="/reviews">
              <MessageSquare className="w-4 h-4 mr-2" /> See all reviews
            </Link>
          </Button>
        </div>

        {/* Google Business Profile review CTA — drives knowledge-panel stars */}
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-card/70 to-card/70 backdrop-blur p-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[11px] font-semibold mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-300" /> Help us on Google
          </div>
          <h2 className="font-display text-xl font-bold mb-1">Rate MasterChess on Google</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            One click, one minute. Your Google review puts MasterChess in front of every chess player searching Google — the best way to support a free, ad-free platform.
          </p>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-black">
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackReviewClick("rate-page")}
            >
              <Star className="w-4 h-4 mr-2 fill-current" /> Leave a Google review
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
