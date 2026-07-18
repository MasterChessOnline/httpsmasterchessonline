// Public page: /chess-in/:citySlug — programmatic SEO landing per city.
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFound from "./NotFound";
import { MapPin, Star, ExternalLink } from "lucide-react";

interface CityHub {
  city_slug: string;
  city_name: string;
  country: string;
  region: string | null;
  lat: number | null;
  lng: number | null;
  places_cached: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    userRatingCount?: number;
    location?: { latitude: number; longitude: number };
    websiteUri?: string;
    googleMapsUri?: string;
  }>;
  place_count: number;
  updated_at: string;
}

const BASE = "https://masterchess.live";

export default function CityChessHub() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [hub, setHub] = useState<CityHub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!citySlug) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("city_chess_hubs" as any)
        .select("*")
        .eq("city_slug", citySlug)
        .maybeSingle();
      if (cancelled) return;
      setHub((data as any) ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [citySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!hub) return <NotFound />;

  const url = `${BASE}/chess-in/${hub.city_slug}`;
  const title = `Chess in ${hub.city_name} — Clubs, Players & Online Games`;
  const description = `Find chess clubs in ${hub.city_name}. Compare ${hub.place_count} local venues, then play online against ${hub.city_name} players on MasterChess.`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url,
          about: hub.places_cached.slice(0, 10).map((p) => ({
            "@type": "SportsClub",
            name: p.displayName?.text,
            address: p.formattedAddress,
            aggregateRating: p.rating ? {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              reviewCount: p.userRatingCount ?? 0,
            } : undefined,
          })),
        })}</script>
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-8">
          <div className="text-sm text-muted-foreground mb-2">{hub.region ?? hub.country}</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Chess in {hub.city_name}</h1>
          <p className="text-lg text-muted-foreground">
            {hub.place_count} chess venues in {hub.city_name}. Play online now against players from your city.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/play-guest?src=city-hub" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90">
              Play now — no signup
            </Link>
            <Link to="/tournaments" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-semibold hover:bg-muted">
              See tournaments
            </Link>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Chess clubs & venues in {hub.city_name}</h2>
          {hub.places_cached.length === 0 ? (
            <p className="text-muted-foreground">No public listings found yet. Check back soon.</p>
          ) : (
            <div className="grid gap-3">
              {hub.places_cached.map((p, i) => (
                <div key={p.id ?? i} className="p-4 border border-border rounded-lg bg-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{p.displayName?.text ?? "Unnamed venue"}</div>
                      {p.formattedAddress && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {p.formattedAddress}
                        </div>
                      )}
                      {p.rating && (
                        <div className="text-sm text-amber-500 flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-current" /> {p.rating.toFixed(1)} ({p.userRatingCount ?? 0} reviews)
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {p.googleMapsUri && (
                        <a href={p.googleMapsUri} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 border border-border rounded hover:bg-muted inline-flex items-center gap-1">
                          Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {p.websiteUri && (
                        <a href={p.websiteUri} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 border border-border rounded hover:bg-muted inline-flex items-center gap-1">
                          Site <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="p-6 border border-primary/30 rounded-xl bg-primary/5">
          <h2 className="text-2xl font-bold mb-2">Can't make it to a club?</h2>
          <p className="text-muted-foreground mb-4">
            Play against real chess players from {hub.city_name} instantly on MasterChess. No signup, no ads, just chess.
          </p>
          <Link to="/play-guest?src=city-hub-cta" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold">
            Play a game right now
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
