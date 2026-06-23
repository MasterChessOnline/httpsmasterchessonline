import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Globe2, Users, MapPin, Swords, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    google?: any;
    __initChessMap?: () => void;
  }
}

type City = {
  key: string;
  name: string;
  country_name: string;
  country_code: string;
  flag: string;
  region: string;
  lat: number;
  lng: number;
};

type CityWithCount = City & { players: number };

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

function loadMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve();
    if (!BROWSER_KEY) return reject(new Error("Missing Google Maps browser key"));
    const existing = document.getElementById("gmaps-script") as HTMLScriptElement | null;
    window.__initChessMap = () => resolve();
    if (existing) return;
    const s = document.createElement("script");
    s.id = "gmaps-script";
    s.async = true;
    s.defer = true;
    s.src =
      `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}` +
      `&loading=async&callback=__initChessMap` +
      (TRACKING_ID ? `&channel=${TRACKING_ID}` : "");
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

function normalize(s: string | null | undefined) {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function ChessMap() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [cities, setCities] = useState<CityWithCount[]>([]);
  const [active, setActive] = useState<CityWithCount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cities + profiles, build counts
  useEffect(() => {
    (async () => {
      try {
        const [{ data: citiesData, error: cErr }, { data: profilesData }] = await Promise.all([
          supabase
            .from("cities")
            .select("key,name,country_name,country_code,flag,region,lat,lng")
            .not("lat", "is", null)
            .not("lng", "is", null),
          supabase.from("profiles").select("city").not("city", "is", null).limit(5000),
        ]);
        if (cErr) throw cErr;

        const counts = new Map<string, number>();
        (profilesData ?? []).forEach((p: any) => {
          const k = normalize(p.city);
          if (!k) return;
          counts.set(k, (counts.get(k) ?? 0) + 1);
        });

        const merged: CityWithCount[] = (citiesData ?? []).map((c: any) => {
          // try multiple match shapes: key, name lowered, name with dashes
          const players =
            counts.get(c.key) ??
            counts.get(normalize(c.name)) ??
            0;
          return {
            key: c.key,
            name: c.name,
            country_name: c.country_name,
            country_code: c.country_code,
            flag: c.flag,
            region: c.region,
            lat: Number(c.lat),
            lng: Number(c.lng),
            players,
          };
        });
        setCities(merged);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Render map once cities are ready
  useEffect(() => {
    if (!cities.length || !mapRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        await loadMapsScript();
        if (cancelled) return;
        const map = new window.google.maps.Map(mapRef.current!, {
          center: { lat: 30, lng: 15 },
          zoom: 2,
          minZoom: 2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          backgroundColor: "#0b0b0d",
          styles: NIGHT_STYLES,
        });
        const InfoWindow = new window.google.maps.InfoWindow();
        cities.forEach((c) => {
          const hasPlayers = c.players > 0;
          const radius = Math.max(6, Math.min(22, 6 + Math.sqrt(c.players) * 4));
          const marker = new window.google.maps.Marker({
            position: { lat: c.lat, lng: c.lng },
            map,
            title: `${c.name} — ${c.players} player${c.players === 1 ? "" : "s"}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: hasPlayers ? radius : 4,
              fillColor: hasPlayers ? "#f5c518" : "#6b7280",
              fillOpacity: hasPlayers ? 0.9 : 0.55,
              strokeColor: "#0b0b0d",
              strokeWeight: 1.5,
            },
          });
          marker.addListener("click", () => {
            setActive(c);
            InfoWindow.setContent(
              `<div style="color:#0b0b0d;font-family:ui-sans-serif,system-ui;min-width:160px">` +
                `<div style="font-weight:700;font-size:14px">${c.flag} ${c.name}</div>` +
                `<div style="font-size:12px;color:#555">${c.country_name}</div>` +
                `<div style="margin-top:6px;font-size:12px"><b>${c.players}</b> player${c.players === 1 ? "" : "s"}</div>` +
              `</div>`
            );
            InfoWindow.open({ map, anchor: marker });
          });
        });
      } catch (e: any) {
        setError(e?.message ?? "Map failed to load");
      }
    })();
    return () => { cancelled = true; };
  }, [cities]);

  const top = useMemo(
    () => [...cities].sort((a, b) => b.players - a.players).slice(0, 8),
    [cities],
  );
  const totalPlayers = cities.reduce((s, c) => s + c.players, 0);
  const activeCities = cities.filter((c) => c.players > 0).length;

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white">
      <Helmet>
        <title>Chess World Map — Live Players from {cities.length || 130}+ Cities | MasterChess</title>
        <meta
          name="description"
          content="Explore the MasterChess world map. See live chess players from cities across the Balkans, Europe, Asia, and the Americas. Click any city to join local players."
        />
        <link rel="canonical" href="https://masterchess.live/chess-map" />
        <meta property="og:title" content="Chess World Map — MasterChess" />
        <meta property="og:url" content="https://masterchess.live/chess-map" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://masterchess.live/" },
            { "@type": "ListItem", position: 2, name: "Chess World Map", item: "https://masterchess.live/chess-map" },
          ],
        })}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-3">
            <Globe2 className="w-3 h-3" /> Live Chess World Map
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
            Chess across{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300">
              {cities.length || "—"} cities
            </span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            <Users className="w-4 h-4 inline mr-1" />
            {totalPlayers.toLocaleString()} players · {activeCities} active cities · click any dot to find local players
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div className="relative rounded-2xl overflow-hidden border border-yellow-500/20 bg-[#121216]" style={{ height: 560 }}>
            {!BROWSER_KEY && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm px-6 text-center">
                Google Maps key not configured. Connect the Google Maps Platform integration to enable the live map.
              </div>
            )}
            {error && (
              <div className="absolute top-3 left-3 right-3 z-10 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-3 py-2">
                {error}
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                Loading map…
              </div>
            )}
            <div ref={mapRef} className="absolute inset-0" />
          </div>

          <aside className="rounded-2xl border border-yellow-500/20 bg-[#121216] p-4">
            <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" /> Top cities
            </h2>
            {top.length === 0 ? (
              <p className="text-xs text-zinc-500">Be the first player in your city — set your city in your profile.</p>
            ) : (
              <ol className="space-y-2 mb-4">
                {top.map((c, i) => (
                  <li key={c.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="text-zinc-500 w-5 text-right">{i + 1}</span>
                      <span>{c.flag}</span>
                      <Link to={`/chess/${c.key}`} className="hover:text-yellow-300">{c.name}</Link>
                    </span>
                    <span className="text-zinc-400 text-xs">{c.players}</span>
                  </li>
                ))}
              </ol>
            )}

            {active && (
              <div className="rounded-xl border border-yellow-500/20 bg-[#0b0b0d] p-3 mb-4">
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Selected
                </div>
                <div className="text-base font-semibold">{active.flag} {active.name}</div>
                <div className="text-xs text-zinc-400 mb-3">{active.country_name} · {active.players} player{active.players === 1 ? "" : "s"}</div>
                <div className="flex flex-col gap-2">
                  <Link
                    to={`/chess/${active.key}`}
                    className="text-xs px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 text-center"
                  >
                    Open city page
                  </Link>
                  <Link
                    to="/play/online"
                    className="text-xs px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-400 text-center inline-flex items-center justify-center gap-1"
                  >
                    <Swords className="w-3 h-3" /> Play now
                  </Link>
                </div>
              </div>
            )}

            <div className="text-[11px] text-zinc-500 leading-relaxed">
              Yellow dots show cities with active MasterChess players. Grey dots are cities waiting for their first player — claim yours by updating your profile city.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// Subtle dark theme for the map
const NIGHT_STYLES: any[] = [
  { elementType: "geometry", stylers: [{ color: "#0b0b0d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b0d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1f1f25" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#2a2a32" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#121216" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#07070a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3b3b44" }] },
];
