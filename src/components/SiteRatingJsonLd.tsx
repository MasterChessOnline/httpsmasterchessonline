import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Injects AggregateRating JSON-LD for MasterChess based ONLY on real
 * `site_ratings` rows. Google's structured data guidelines require ratings
 * to come from actual user reviews — we never bake a baseline number into
 * the schema. When there are no ratings yet we ship the WebSite payload
 * without aggregateRating so the snippet stays valid and empty.
 */
export default function SiteRatingJsonLd() {
  useEffect(() => {
    let alive = true;
    (async () => {
      let avg = 0;
      let count = 0;
      try {
        const { data } = await supabase
          .from("site_ratings")
          .select("rating")
          .eq("hidden", false);
        if (data && data.length > 0) {
          const sum = data.reduce((s: number, r: any) => s + (r.rating || 0), 0);
          avg = Math.round((sum / data.length) * 10) / 10;
          count = data.length;
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
