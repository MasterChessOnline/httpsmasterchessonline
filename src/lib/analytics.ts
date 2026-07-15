// Unified analytics loader — GA4, Meta Pixel, TikTok Pixel.
// All pixels are opt-in via env vars; missing IDs are no-ops so the site
// keeps working before the user pastes their tracking codes.
//
// Env vars (all optional, all VITE_ prefixed so Vite inlines them):
//   VITE_GA4_ID           e.g. G-XXXXXXXXXX
//   VITE_META_PIXEL_ID    e.g. 1234567890
//   VITE_TIKTOK_PIXEL_ID  e.g. CXXXXXXXXXXXXXXXXXXX

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      load: (id: string) => void;
      identify?: (params: Record<string, unknown>) => void;
      instances?: unknown[];
    };
    TiktokAnalyticsObject?: string;
  }
}

let bootstrapped = false;

function inject(src: string, attrs: Record<string, string> = {}) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  document.head.appendChild(s);
  return s;
}

export function bootstrapAnalytics(): void {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;

  const META = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
  const TIKTOK = import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined;

  // GA4 is loaded by <Analytics /> component (SPA page_view on route change).
  window.dataLayer = window.dataLayer || [];

  // --- Meta Pixel ---
  if (META) {
    (function (f: Window, b: Document, e: string, v: string) {
      if ((f as unknown as { fbq?: unknown }).fbq) return;
      const n = (f as unknown as { fbq: unknown }).fbq = function (this: unknown, ...args: unknown[]) {
        const fn = n as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] };
        fn.callMethod ? fn.callMethod(...args) : fn.queue.push(args);
      } as unknown as Window["fbq"];
      if (!f._fbq) f._fbq = n;
      (n as unknown as { push: unknown; loaded: boolean; version: string; queue: unknown[] }).push = n;
      (n as unknown as { loaded: boolean }).loaded = true;
      (n as unknown as { version: string }).version = "2.0";
      (n as unknown as { queue: unknown[] }).queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s.parentNode?.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq?.("init", META);
    window.fbq?.("track", "PageView");
  }

  // --- TikTok Pixel ---
  if (TIKTOK) {
    // Minimal TikTok pixel bootstrap
    const w = window as unknown as { TiktokAnalyticsObject: string; ttq: Record<string, unknown> };
    w.TiktokAnalyticsObject = "ttq";
    const ttq: Record<string, unknown> = w.ttq = w.ttq || {};
    (ttq as { methods?: string[] }).methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
    (ttq as { setAndDefer: (t: Record<string, unknown>, m: string) => void }).setAndDefer = function (t, m) {
      (t as Record<string, unknown>)[m] = function (...args: unknown[]) {
        ((t as { _i?: Record<string, unknown[][]> })._i = (t as { _i?: Record<string, unknown[][]> })._i || {});
        // no-op deferred queue
        return args;
      };
    };
    inject(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${TIKTOK}&lib=ttq`);
    window.ttq?.load?.(TIKTOK);
    window.ttq?.page?.();
  }
}

// Fan-out helpers used by track()
export function pixelTrack(eventName: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    // GA4
    window.gtag?.("event", eventName, params);
    // Meta Pixel — map common events, otherwise send as custom
    const metaStd: Record<string, string> = {
      signup_completed: "CompleteRegistration",
      tournament_registered: "Lead",
      game_started: "StartTrial",
      purchase: "Purchase",
      pwa_installed: "Subscribe",
    };
    if (window.fbq) {
      const std = metaStd[eventName];
      if (std) window.fbq("track", std, params);
      else window.fbq("trackCustom", eventName, params);
    }
    // TikTok
    window.ttq?.track?.(eventName, params);
  } catch {
    /* ignore */
  }
}
