import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Homepage Reviews CTA. Uses ONLY real `site_ratings` rows — never fabricates
 * a count or average. Hides the numeric block until at least one real rating
 * exists, but always links through to /reviews and /rate-masterchess.
 */
export default function ReviewsCta() {
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase
        .from("site_ratings")
        .select("rating")
        .eq("hidden", false);
      if (!alive) return;
      const rows = data ?? [];
      if (rows.length) {
        const sum = rows.reduce((s: number, r: any) => s + (r.rating || 0), 0);
        setAvg(sum / rows.length);
        setCount(rows.length);
      } else {
        setAvg(0);
        setCount(0);
      }
    };
    load();
    const ch = supabase
      .channel("home-reviews-cta")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_ratings" }, () => load())
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <section className="container mx-auto px-4 pb-10 max-w-3xl">
      <Link
        to="/reviews"
        className="block rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 via-card/60 to-card/40 backdrop-blur p-5 sm:p-6 hover:border-yellow-400/60 transition-colors group"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${
                    avg >= n - 0.25
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/40"
                  }`}
                />
              ))}
              {count > 0 ? (
                <span className="ml-2 font-display text-lg font-bold tabular-nums">
                  {avg.toFixed(1)}/5
                </span>
              ) : (
                <span className="ml-2 text-sm font-semibold text-muted-foreground">
                  No ratings yet
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {count > 0
                ? `${count.toLocaleString()} ${count === 1 ? "review" : "reviews"} from real chess players`
                : "Be the first to rate MasterChess — share your honest experience."}
            </p>
          </div>
          <span className="text-sm font-semibold text-yellow-400 group-hover:translate-x-1 transition-transform">
            {count > 0 ? "View all reviews →" : "Write the first review →"}
          </span>
        </div>
      </Link>
    </section>
  );
}
