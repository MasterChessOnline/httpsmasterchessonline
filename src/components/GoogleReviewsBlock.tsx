import { useEffect, useState } from "react";
import { Star, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleReview, trackReviewClick } from "@/lib/google-review";

type GReview = {
  author: string;
  avatar: string | null;
  rating: number | null;
  text: string;
  relativeTime: string;
};

type Data = {
  reviews: GReview[];
  rating: number | null;
  total: number;
  mapsUri?: string | null;
  status?: string;
};

type Props = {
  /** how many reviews to render (max 5) */
  limit?: number;
  /** compact = 1 review, used in testimonial sliders */
  compact?: boolean;
  title?: string;
};

export default function GoogleReviewsBlock({ limit = 5, compact = false, title }: Props) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const { mapsUrl, reviewUrl } = useGoogleReview();

  useEffect(() => {
    let alive = true;
    supabase.functions
      .invoke("fetch-google-reviews", { body: {} })
      .then(({ data }) => {
        if (!alive) return;
        setData(data as Data);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return null;
  if (!data || !data.reviews?.length) return null;

  const reviews = data.reviews.slice(0, compact ? 1 : limit);
  const mapsHref = data.mapsUri || mapsUrl;

  return (
    <section className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/5 via-card/60 to-card/60 backdrop-blur p-5 sm:p-6">
      <header className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <GoogleG />
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold leading-tight">
              {title ?? "What players say on Google"}
            </h2>
            {data.rating != null && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-amber-400 tabular-nums">
                  {data.rating.toFixed(1)}
                </span>
                <Stars value={data.rating} />
                <span>· {data.total.toLocaleString()} Google reviews</span>
              </p>
            )}
          </div>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackReviewClick("g-reviews-block-header")}
          className="text-xs text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 font-medium"
        >
          View on Google Maps <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <div className={compact ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"}>
        {reviews.map((r, i) => (
          <article
            key={i}
            className="rounded-xl border border-border/40 bg-background/40 p-4 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              {r.avatar ? (
                <img
                  src={r.avatar}
                  alt=""
                  loading="lazy"
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                  {r.author?.[0] ?? "G"}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{r.author}</div>
                <div className="text-[11px] text-muted-foreground">{r.relativeTime}</div>
              </div>
            </div>
            {r.rating != null && <Stars value={r.rating} className="mb-2" />}
            <p className="text-sm text-muted-foreground line-clamp-5 flex-1">{r.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 text-center">
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackReviewClick("g-reviews-block-cta")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold"
        >
          <Star className="w-4 h-4 fill-current" /> Write your Google review
        </a>
      </div>
    </section>
  );
}

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${
            value >= n - 0.25 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </span>
  );
}

function GoogleG() {
  return (
    <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3-11.3-7.5l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.3 35.8 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
