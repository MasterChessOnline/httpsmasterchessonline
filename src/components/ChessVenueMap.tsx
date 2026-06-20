import { useEffect, useRef } from "react";
import { useGoogleMaps } from "@/lib/useGoogleMaps";

export type Venue = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
  address?: string;
};

type Props = {
  venues: Venue[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: number;
};

export default function ChessVenueMap({ venues, center, zoom = 12, height = 420 }: Props) {
  const { ready, error } = useGoogleMaps();
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!ready || !ref.current) return;
    const g = (window as any).google;
    const c = center ??
      (venues[0] ? { lat: venues[0].lat, lng: venues[0].lng } : { lat: 44.81, lng: 20.46 });
    if (!mapRef.current) {
      mapRef.current = new g.maps.Map(ref.current, {
        center: c,
        zoom,
        styles: DARK_STYLE,
        disableDefaultUI: false,
        clickableIcons: false,
      });
    } else {
      mapRef.current.setCenter(c);
    }

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = venues.map((v) => {
      const m = new g.maps.Marker({
        position: { lat: v.lat, lng: v.lng },
        map: mapRef.current,
        title: v.name,
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#eab308",
          fillOpacity: 1,
          strokeColor: "#000",
          strokeWeight: 2,
        },
      });
      const info = new g.maps.InfoWindow({
        content: `<div style="color:#111;max-width:220px"><b>${escapeHtml(v.name)}</b>${
          v.rating ? `<br/>⭐ ${v.rating.toFixed(1)}` : ""
        }${v.address ? `<br/><small>${escapeHtml(v.address)}</small>` : ""}</div>`,
      });
      m.addListener("click", () => info.open({ map: mapRef.current, anchor: m }));
      return m;
    });
  }, [ready, venues, center, zoom]);

  if (error) {
    return (
      <div
        style={{ height }}
        className="rounded-2xl bg-zinc-900 border border-yellow-500/10 flex items-center justify-center text-sm text-zinc-400"
      >
        Map unavailable
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{ height }}
      className="rounded-2xl overflow-hidden border border-yellow-500/10 bg-zinc-950"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

const DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0b0b0d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a1a1aa" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b0d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f1f23" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#08131c" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#27272a" }] },
];
