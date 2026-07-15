// Lightweight tracking + UTM attribution helper.
// - Captures utm_* params on first visit and persists them for the session.
// - track(name, params) sends a GA4 event (when VITE_GA4_ID is configured)
//   and always pushes to window.dataLayer so GTM / other listeners can pick it up.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const STORAGE_KEY = "mc_attribution_v1";

type Attribution = Partial<Record<(typeof UTM_KEYS)[number] | "landing_path" | "referrer" | "first_seen", string>>;

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Attribution | null;
    const params = new URLSearchParams(window.location.search);
    const fresh: Attribution = {};
    let hasUtm = false;
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) {
        fresh[k] = v.slice(0, 80);
        hasUtm = true;
      }
    }
    // Only overwrite when there's a new UTM source, otherwise keep first-touch.
    if (hasUtm || !existing) {
      const next: Attribution = {
        ...(existing ?? {}),
        ...fresh,
        landing_path: existing?.landing_path ?? window.location.pathname,
        referrer: existing?.referrer ?? (document.referrer || "direct"),
        first_seen: existing?.first_seen ?? new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    /* ignore */
  }
}

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function track(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const enriched = { ...getAttribution(), ...params };
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...enriched });
    // Fan out to GA4 + Meta Pixel + TikTok Pixel (all no-op if not configured)
    import("./analytics").then((m) => m.pixelTrack(eventName, enriched)).catch(() => {});
  } catch {
    /* ignore */
  }
}
