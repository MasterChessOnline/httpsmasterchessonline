import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MapPin, Star, ExternalLink, ArrowLeft, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO_CITIES } from "@/lib/seo-cities";
import ChessVenueMap, { Venue } from "@/components/ChessVenueMap";
import { Button } from "@/components/ui/button";

type Place = Venue & {
  userRatingCount?: number;
  mapsUri?: string;
  websiteUri?: string;
  address: string;
};

export default function ChessInCity() {
  const { slug } = useParams<{ slug: string }>();
  const city = SEO_CITIES.find((c) => c.slug === slug);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.functions
      .invoke("chess-places-nearby", { body: { cityKey: slug } })
      .then(({ data }) => setPlaces((data as any)?.places ?? []))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!city) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">City not found</h1>
          <Link to="/" className="text-yellow-400 hover:underline">Back home</Link>
        </div>
      </div>
    );
  }

  const title = `Chess in ${city.city} — Clubs, Cafés & Online Play | MasterChess`;
  const desc = `Discover real chess clubs and meet-up spots in ${city.city}, ${city.country}. Plus play online against ${city.country} players on MasterChess.`;
  const url = `https://masterchess.live/chess/${city.slug}`;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
            { "@type": "ListItem", position: 2, name: "Chess World Map", item: "https://masterchess.live/chess-map" },
            { "@type": "ListItem", position: 3, name: `Chess in ${city.city}`, item: url },
          ],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: `MasterChess — Chess in ${city.city}`,
          description: desc,
          url,
          areaServed: { "@type": "City", name: city.city, address: { "@type": "PostalAddress", addressCountry: city.countryCode } },
          knowsAbout: ["chess", "online chess", "chess clubs", `chess ${city.city}`],
          priceRange: "Free",
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: `Where can I play chess in ${city.city}?`,
              acceptedAnswer: { "@type": "Answer", text: `You can play chess online for free from ${city.city} on MasterChess, and meet over the board at local clubs and cafés listed on this page.` } },
            { "@type": "Question", name: `Is online chess free in ${city.country}?`,
              acceptedAnswer: { "@type": "Answer", text: `Yes — MasterChess is completely free to play, with no ads or paywalls, for players in ${city.country} and worldwide.` } },
            { "@type": "Question", name: `How do I find chess clubs near me in ${city.city}?`,
              acceptedAnswer: { "@type": "Answer", text: `This page lists verified chess clubs, cafés and meet-up spots in ${city.city}, pulled from Google Maps. Click any venue for directions.` } },
          ],
        })}</script>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-yellow-400 mb-4">
          <ArrowLeft className="w-3 h-3" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{city.flag}</span>
          <span className="text-xs uppercase tracking-wider text-yellow-400/80">{city.country}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Chess in{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300">
            {city.city}
          </span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mb-8">{city.tagline}</p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link to={`/play-from/${city.slug}`}>
            <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
              <Crown className="w-4 h-4 mr-1" /> Play online from {city.city}
            </Button>
          </Link>
          <Link to="/near-me">
            <Button variant="outline" className="border-yellow-500/30 text-yellow-200 hover:bg-yellow-500/10">
              <MapPin className="w-4 h-4 mr-1" /> Find chess near me
            </Button>
          </Link>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Chess clubs & spots in {city.city}</h2>
          <ChessVenueMap venues={places} height={380} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {loading ? "Loading venues…" : `${places.length} chess venues`}
          </h2>
          {!loading && places.length === 0 && (
            <div className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 text-sm text-zinc-400">
              No verified chess venues found for {city.city} yet. Play online instead — over-the-board
              meet-ups are growing here.
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            {places.map((p) => (
              <a
                key={p.id}
                href={p.mapsUri ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + p.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-yellow-500/10 bg-[#121216] p-4 hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white">{p.name}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{p.address}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0" />
                </div>
                {p.rating != null && (
                  <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {p.rating.toFixed(1)}
                    {p.userRatingCount ? <span className="text-zinc-500">({p.userRatingCount})</span> : null}
                  </div>
                )}
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-yellow-500/10 bg-gradient-to-br from-yellow-500/5 to-transparent p-6">
          <h3 className="text-lg font-semibold mb-2">More chess cities</h3>
          <div className="flex flex-wrap gap-2">
            {SEO_CITIES.slice(0, 20).filter((c) => c.slug !== city.slug).map((c) => (
              <Link
                key={c.slug}
                to={`/chess/${c.slug}`}
                className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-yellow-500/40 text-zinc-300 hover:text-yellow-300 transition-colors"
              >
                {c.flag} {c.city}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
