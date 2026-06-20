// Global community map — shows opted-in players as pins on Google Maps.
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BROWSER_KEY = (import.meta as any).env?.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY ?? "";
const TRACKING = (import.meta as any).env?.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID ?? "";

declare global { interface Window { initCommunityMap?: () => void; google: any } }

export default function CommunityMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("community_map_pins" as any).select("*").limit(1000);
      if (error) setError(error.message); else setPins(data ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!BROWSER_KEY) { setError("Google Maps not configured"); return; }
    if (!ref.current || !pins.length) return;
    window.initCommunityMap = () => {
      const map = new window.google.maps.Map(ref.current!, {
        center: { lat: 30, lng: 0 }, zoom: 2,
        styles: [{ elementType: "geometry", stylers: [{ color: "#1a1a1a" }] }],
      });
      pins.forEach(p => {
        const marker = new window.google.maps.Marker({
          position: { lat: Number(p.lat), lng: Number(p.lng) },
          map, title: p.username ?? "",
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="color:#000"><strong>${p.username ?? "Player"}</strong><br/>Rating: ${p.rating ?? 1200}<br/>${p.city ?? ""}</div>`,
        });
        marker.addListener("click", () => info.open({ anchor: marker, map }));
      });
    };
    if (window.google?.maps) { window.initCommunityMap(); return; }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=initCommunityMap${TRACKING ? `&channel=${TRACKING}` : ""}`;
    s.async = true;
    document.head.appendChild(s);
  }, [pins]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Global Chess Community Map | MasterChess</title>
        <meta name="description" content="See chess players from around the world on the MasterChess global community map." />
        <link rel="canonical" href="https://masterchess.live/community/map" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Global Chess Community</h1>
        <p className="text-muted-foreground mb-6">{pins.length} players on the map.</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div ref={ref} className="w-full h-[70vh] rounded-lg overflow-hidden border border-border" />
      </main>
      <Footer />
    </div>
  );
}
