/**
 * Single source of truth for every "Review on Google" / "Find on Google Maps"
 * link in the app. Resolution priority:
 *   1. VITE_GOOGLE_REVIEW_URL env override (emergency hand-pasted value)
 *   2. site_config.place_id from the database (auto-resolved by the
 *      `resolve-place-id` edge function once GBP is verified)
 *   3. Maps search fallback so the user still lands inside Google Maps
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=MasterChess+masterchess.live";

const ENV_OVERRIDE =
  (import.meta.env.VITE_GOOGLE_REVIEW_URL as string | undefined) || "";

export const GOOGLE_REVIEW_URL: string = ENV_OVERRIDE || FALLBACK_MAPS_URL;
export const GOOGLE_MAPS_URL: string = FALLBACK_MAPS_URL;

const CACHE_KEY = "mc:gbp:place";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type PlaceConfig = {
  place_id?: string;
  place_url?: string;
  maps_url?: string;
  review_url?: string;
};

function buildReviewUrl(placeId?: string): string {
  if (ENV_OVERRIDE) return ENV_OVERRIDE;
  if (placeId) return `https://search.google.com/local/writereview?placeid=${placeId}`;
  return FALLBACK_MAPS_URL;
}

function buildMapsUrl(cfg: PlaceConfig | null): string {
  return cfg?.place_url || cfg?.maps_url || FALLBACK_MAPS_URL;
}

export function useGoogleReview() {
  const [cfg, setCfg] = useState<PlaceConfig | null>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.t > CACHE_TTL_MS) return null;
      return parsed.v as PlaceConfig;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("site_config" as any)
          .select("value")
          .eq("key", "google_place")
          .maybeSingle();
        if (cancelled) return;
        const value = (data as any)?.value as PlaceConfig | undefined;
        if (value) {
          setCfg(value);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: value }));
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore — fallback still works
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    reviewUrl: buildReviewUrl(cfg?.place_id),
    mapsUrl: buildMapsUrl(cfg),
    placeId: cfg?.place_id ?? null,
  };
}

/** Light analytics ping — safe no-op if `gtag` isn't loaded. */
export function trackReviewClick(surface: string) {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", "gbp_review_click", { surface });
  } catch {
    // ignore
  }
}
