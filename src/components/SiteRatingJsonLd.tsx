import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Injects WebSite + AggregateRating + Review[] JSON-LD for MasterChess based
 * ONLY on real `site_ratings` rows. Google needs both AggregateRating AND
 * individual Review items (with author + rating + body) to render review
 * rich-snippets (star + reviewer name) in SERPs.
 *
 * Integrity rule: never fabricate or bake any baseline rating. If no real
 * ratings exist yet, we ship the WebSite payload without ratings.
 */
export default function SiteRatingJsonLd() {
  useEffect(() => {
    let alive = true;
    (async () => {
      let avg = 0;
      let count = 0;
      let reviews: Array<{
        rating: number;
        comment: string | null;
        created_at: string;
        title?: string | null;
        author: string;
      }> = [];

      try {
        const { data: rows } = await supabase
          .from("site_ratings")
          .select("user_id, rating, comment, title, created_at, hidden")
          .eq("hidden", false)
          .order("created_at", { ascending: false })
          .limit(200);

        const all = (rows ?? []) as any[];
        if (all.length > 0) {
          const sum = all.reduce((s, r) => s + (r.rating || 0), 0);
          avg = Math.round((sum / all.length) * 10) / 10;
          count = all.length;

          // Pull author display names for the most recent reviews with text
          const withText = all.filter((r) => r.comment && r.comment.trim().length > 0).slice(0, 20);
          const ids = Array.from(new Set(withText.map((r) => r.user_id)));
          let names = new Map<string, string>();
          if (ids.length > 0) {
            const { data: profs } = await supabase
              .from("profiles")
              .select("user_id, display_name")
              .in("user_id", ids);
            (profs ?? []).forEach((p: any) => {
              if (p.display_name) names.set(p.user_id, p.display_name);
            });
          }
          reviews = withText.map((r) => ({
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            title: r.title ?? null,
            author: names.get(r.user_id) || "MasterChess Player",
          }));
        }
      } catch {
        /* no schema injection on error */
      }
      if (!alive) return;

      const payload: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "MasterChess",
        url: "https://masterchess.live",
      };

      if (count > 0) {
        payload.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: avg.toFixed(1),
          bestRating: "5",
          worstRating: "1",
          ratingCount: String(count),
          reviewCount: String(count),
        };
      }

      if (reviews.length > 0) {
        payload.review = reviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          datePublished: new Date(r.created_at).toISOString().split("T")[0],
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(r.rating),
            bestRating: "5",
            worstRating: "1",
          },
          ...(r.title ? { name: r.title } : {}),
          reviewBody: (r.comment || "").slice(0, 500),
          itemReviewed: {
            "@type": "WebSite",
            name: "MasterChess",
            url: "https://masterchess.live",
          },
        }));
      }

      const id = "mc-aggregate-rating-jsonld";
      const existing = document.getElementById(id);
      if (existing) existing.remove();
      const tag = document.createElement("script");
      tag.type = "application/ld+json";
      tag.id = id;
      tag.text = JSON.stringify(payload);
      document.head.appendChild(tag);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return null;
}
