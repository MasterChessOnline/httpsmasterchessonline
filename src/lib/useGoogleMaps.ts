// Lightweight Maps JS loader. Loads once with loading=async + global callback.
import { useEffect, useState } from "react";

const KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const CHANNEL = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let promise: Promise<typeof google> | null = null;

function loadMaps(): Promise<typeof google> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (promise) return promise;
  if (!KEY) return Promise.reject(new Error("missing_browser_key"));

  promise = new Promise((resolve, reject) => {
    (window as any).__initGmaps = () => resolve((window as any).google);
    const s = document.createElement("script");
    const params = new URLSearchParams({
      key: KEY,
      loading: "async",
      callback: "__initGmaps",
      libraries: "places",
    });
    if (CHANNEL) params.set("channel", CHANNEL);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("script_error"));
    document.head.appendChild(s);
  });
  return promise;
}

export function useGoogleMaps() {
  const [ready, setReady] = useState<boolean>(
    typeof window !== "undefined" && !!(window as any).google?.maps,
  );
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (ready) return;
    loadMaps().then(() => setReady(true)).catch((e) => setError(e.message));
  }, [ready]);
  return { ready, error };
}
