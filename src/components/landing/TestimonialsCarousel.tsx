import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  display_name: string | null;
}

export default function TestimonialsCarousel() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Pull recent 4-5 star ratings with comments
      const { data: ratings } = await supabase
        .from("site_ratings")
        .select("id, rating, comment, user_id")
        .gte("rating", 4)
        .not("comment", "is", null)
        .order("created_at", { ascending: false })
        .limit(12);

      if (cancelled || !ratings?.length) return;
      const userIds = Array.from(new Set(ratings.map((r) => r.user_id))).filter(Boolean);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const nameMap = new Map<string, string | null>((profiles || []).map((p) => [p.user_id, p.display_name]));

      const cleaned = ratings
        .filter((r) => (r.comment || "").trim().length > 5)
        .map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: (r.comment || "").trim(),
          display_name: nameMap.get(r.user_id) ?? null,
        }));

      if (!cancelled) setItems(cleaned);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;
  const current = items[index];

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          What players say
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Real reviews from real players — straight from our site rating system.
        </p>
      </motion.div>

      <div className="relative max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-primary/15 glass-4d p-6 sm:p-8 relative overflow-hidden"
          >
            <Quote className="absolute top-3 right-3 h-12 w-12 text-primary/10" />
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < current.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="text-foreground text-sm sm:text-base leading-relaxed italic">
              "{current.comment}"
            </p>
            <p className="mt-4 text-xs text-muted-foreground font-medium">
              — {current.display_name || "MasterChess player"}
            </p>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
