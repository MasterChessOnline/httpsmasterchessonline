import { Star, Quote, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";

// Integrity rule (project memory): ZERO fake engagement data.
// Everything on this section is sourced from real site_ratings rows.
// If fewer than MIN_REVIEWS public reviews with text exist, we hide
// the testimonial grid entirely and show only a small CTA to write one.

const MIN_REVIEWS = 3;

type Review = {
  id: string;
  rating: number;
  comment: string;
  title: string | null;
  created_at: string;
  author: string;
  country: string | null;
  elo: number | null;
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

const TestimonialsSection = () => {
  const [loaded, setLoaded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: rows } = await supabase
          .from("site_ratings")
          .select("id, user_id, rating, comment, title, created_at, hidden, pinned")
          .eq("hidden", false)
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(50);
        if (!alive) return;
        const all = (rows ?? []) as any[];
        const totalCount = all.length;
        const totalAvg = totalCount > 0
          ? Math.round((all.reduce((s, r) => s + (r.rating || 0), 0) / totalCount) * 10) / 10
          : 0;

        const withText = all.filter((r) => r.comment && String(r.comment).trim().length > 0).slice(0, 6);
        const ids = Array.from(new Set(withText.map((r) => r.user_id)));
        let profMap = new Map<string, any>();
        if (ids.length > 0) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("user_id, display_name, country, current_rating")
            .in("user_id", ids);
          (profs ?? []).forEach((p: any) => profMap.set(p.user_id, p));
        }
        const mapped: Review[] = withText.map((r) => {
          const p = profMap.get(r.user_id) || {};
          return {
            id: r.id,
            rating: r.rating,
            comment: String(r.comment),
            title: r.title ?? null,
            created_at: r.created_at,
            author: p.display_name || "MasterChess Player",
            country: p.country || null,
            elo: typeof p.current_rating === "number" ? p.current_rating : null,
          };
        });
        if (!alive) return;
        setReviews(mapped);
        setAvg(totalAvg);
        setCount(totalCount);
      } catch {
        /* hide silently — never fake */
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  // While loading: render nothing (no flash of fake content).
  if (!loaded) return null;

  // Not enough real reviews → show only a thin CTA strip, no grid.
  if (reviews.length < MIN_REVIEWS) {
    return (
      <section className="relative py-16 overflow-hidden">
        <div className="container mx-auto px-6">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl rounded-2xl glass-elevated p-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <PenLine className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Be one of the first to <span className="text-gradient-gold">review MasterChess</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Real players, real words. No bots, no paid reviews — we only show what people actually wrote.
              </p>
              <Link
                to="/rate"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Write a review
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-28 overflow-hidden section-depth grain-texture">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="container mx-auto px-6 relative">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              Real reviews
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              What real players <span className="text-gradient-gold">say</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Every word below was written by a verified MasterChess account.
            </p>

            <motion.div
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i <= Math.round(avg) ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-primary">{avg.toFixed(1)}/5</span>
              <span className="text-xs text-muted-foreground">
                from {count} {count === 1 ? "review" : "reviews"}
              </span>
            </motion.div>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {reviews.map((r) => (
            <motion.div
              key={r.id}
              variants={cardVariants}
              className="rounded-2xl glass-elevated p-6 h-full overflow-hidden relative group depth-card light-sweep"
              whileHover={{ y: -4 }}
            >
              <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/5 group-hover:text-primary/10 transition-colors duration-500" />

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-3.5 w-3.5 ${j < r.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>

              {r.title && (
                <div className="text-sm font-semibold text-foreground mb-2 line-clamp-1">{r.title}</div>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-5">"{r.comment}"</p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                  {r.country ? r.country : (r.author?.[0]?.toUpperCase() ?? "?")}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{r.author}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {r.elo ? `${r.elo} ELO · ` : ""}{fmtDate(r.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <Link
            to="/reviews"
            className="text-sm font-semibold text-primary hover:underline"
          >
            See all reviews →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
