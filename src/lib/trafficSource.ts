/**
 * TRAFFIC SOURCE DETECTION
 *
 * A visitor who taps the link in an Instagram bio or story almost never carries
 * clean utm parameters: Instagram strips them from bio links, and the in-app
 * browser sends its own user agent. So detection uses three signals, in order:
 *
 *   1. utm_source / ref query parameters (paid campaigns — most reliable)
 *   2. document.referrer (instagram.com, l.instagram.com, lm.facebook.com …)
 *   3. the in-app browser user agent ("Instagram" / "FBAV" tokens)
 *
 * The result is sticky for the whole session so the funnel and the signup form
 * keep the same attribution even after in-app navigation drops the referrer.
 */

export type TrafficSource =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "google"
  | "youtube"
  | "reddit"
  | "direct"
  | "other";

const SOURCE_KEY = "mc_traffic_source";
const SOURCE_DETAIL_KEY = "mc_traffic_signal";

function normalize(raw: string): TrafficSource | null {
  const v = raw.toLowerCase();
  if (!v) return null;
  if (v.includes("instagram") || v === "ig") return "instagram";
  if (v.includes("facebook") || v.includes("fb") || v.includes("meta")) return "facebook";
  if (v.includes("tiktok") || v === "tt") return "tiktok";
  if (v.includes("google") || v.includes("adwords") || v.includes("gads")) return "google";
  if (v.includes("youtube") || v.includes("yt")) return "youtube";
  if (v.includes("reddit")) return "reddit";
  return null;
}

/** Which of the three signals identified the source (useful for debugging). */
export type SourceSignal = "utm" | "referrer" | "in-app-browser" | "stored" | "none";

export interface DetectedSource {
  source: TrafficSource;
  signal: SourceSignal;
}

/** True when the page is rendered inside the Instagram / Facebook in-app browser. */
export function isInAppBrowser(ua = navigator.userAgent): "instagram" | "facebook" | null {
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  return null;
}

/** Detect the source once and remember it for the rest of the session. */
export function detectTrafficSource(): DetectedSource {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUtm =
      normalize(params.get("utm_source") || "") || normalize(params.get("ref") || "");
    if (fromUtm) {
      persist(fromUtm, "utm");
      return { source: fromUtm, signal: "utm" };
    }

    const referrer = document.referrer || "";
    if (referrer) {
      try {
        const host = new URL(referrer).hostname.replace(/^www\./, "");
        const fromRef = normalize(host);
        if (fromRef) {
          persist(fromRef, "referrer");
          return { source: fromRef, signal: "referrer" };
        }
      } catch {
        /* malformed referrer — ignore */
      }
    }

    const inApp = isInAppBrowser();
    if (inApp) {
      persist(inApp, "in-app-browser");
      return { source: inApp, signal: "in-app-browser" };
    }

    const stored = sessionStorage.getItem(SOURCE_KEY);
    const normalizedStored = stored ? normalize(stored) : null;
    if (normalizedStored) return { source: normalizedStored, signal: "stored" };
  } catch {
    /* private mode — detection is best-effort */
  }
  return { source: "direct", signal: "none" };
}

function persist(source: TrafficSource, signal: SourceSignal) {
  try {
    sessionStorage.setItem(SOURCE_KEY, source);
    sessionStorage.setItem(SOURCE_DETAIL_KEY, signal);
    if (source === "instagram" || source === "facebook") {
      localStorage.setItem("mc_ig_session", "1");
    }
  } catch {
    /* ignore */
  }
}

/** Sticky read without re-running detection (safe on every render). */
export function getStoredSource(): DetectedSource {
  try {
    const s = normalize(sessionStorage.getItem(SOURCE_KEY) || "");
    const sig = (sessionStorage.getItem(SOURCE_DETAIL_KEY) || "none") as SourceSignal;
    if (s) return { source: s, signal: sig };
  } catch {
    /* ignore */
  }
  return { source: "direct", signal: "none" };
}

/**
 * Social traffic gets the beginner-first funnel (bot game first, account after),
 * because those visitors did not search for chess — they tapped a video.
 */
export function isSocialSource(source: TrafficSource): boolean {
  return source === "instagram" || source === "facebook" || source === "tiktok";
}
