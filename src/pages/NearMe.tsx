import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { MapPin, Star, ExternalLink, Loader2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChessVenueMap, { Venue } from "@/components/ChessVenueMap";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Place = Venue & { address: string; rating?: number; userRatingCount?: number; mapsUri?: string };

export default function NearMe() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<"idle" | "locating" | "loading" | "ready" | "denied" | "error">("idle");

  const findMe = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setStatus("denied"),
      { timeout: 10000, enableHighAccuracy: false },
    );
  };

  useEffect(() => {
    if (!coords) return;
    setStatus("loading");
    supabase.functions
      .invoke("chess-places-nearby", { body: { lat: coords.lat, lng: coords.lng, radius: 25000 } })
      .then(({ data }) => {
        setPlaces((data as any)?.places ?? []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [coords]);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>Find Chess Near Me — Clubs & Players Nearby | MasterChess</title>
        <meta name="description" content="Find real chess clubs, cafés and meet-ups near your location. Or jump online and play instantly on MasterChess." />
        <link rel="canonical" href="https://masterchess.live/near-me" />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 pt-10 pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <MapPin className="w-3 h-3" /> Near Me
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Find{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300">
              chess near you
            </span>
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Discover chess clubs, cafés and parks where people actually play, within 25 km of your location.
          </p>
        </div>

        {status === "idle" && (
          <div className="text-center mb-8">
            <Button size="lg" onClick={findMe} className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
              <MapPin className="w-4 h-4 mr-2" /> Use my location
            </Button>
            <p className="text-xs text-zinc-500 mt-3">We never store your location — it's used once to query Google Maps.</p>
          </div>
        )}

        {(status === "locating" || status === "loading") && (
          <div className="text-center py-12 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-yellow-400" />
            {status === "locating" ? "Finding your location…" : "Searching for chess venues…"}
          </div>
        )}

        {status === "denied" && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center max-w-md mx-auto">
            <p className="text-sm mb-3">Location permission denied. Try a city page instead:</p>
            <Link to="/chess/belgrade" className="text-yellow-400 hover:underline">Chess in Belgrade →</Link>
          </div>
        )}

        {status === "ready" && coords && (
          <>
            <div className="mb-6">
              <ChessVenueMap venues={places} center={coords} zoom={12} height={420} />
            </div>
            <h2 className="text-xl font-semibold mb-3">
              {places.length} chess {places.length === 1 ? "venue" : "venues"} nearby
            </h2>
            {places.length === 0 && (
              <div className="rounded-2xl border border-yellow-500/10 bg-[#121216] p-6 text-center text-sm text-zinc-400">
                No over-the-board chess venues found in your radius.
                <div className="mt-4">
                  <Link to="/play">
                    <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
                      <Crown className="w-4 h-4 mr-1" /> Play online instead
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-3">
              {places.map((p) => (
                <a
                  key={p.id}
                  href={p.mapsUri ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl border border-yellow-500/10 bg-[#121216] p-4 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">{p.address}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0" />
                  </div>
                  {p.rating != null && (
                    <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
                      <Star className="w-3 h-3 fill-yellow-400" /> {p.rating.toFixed(1)}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
