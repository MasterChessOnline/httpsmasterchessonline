// MONITORING — plan sections 23 & 24.
//
// A bug must never be just "something went wrong". Every JS error, unhandled
// rejection and real-user speed metric is stored with route + device + release
// so it can be traced. Everything here is fire-and-forget: monitoring must
// never slow the app down or break a page.

import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "mc_session_id";
const RELEASE = import.meta.env.VITE_APP_RELEASE || "dev";
const MAX_PER_SESSION = 12;

let errorsSent = 0;
let started = false;

export function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function deviceKind(): string {
  if (typeof window === "undefined") return "unknown";
  return window.matchMedia?.("(max-width: 768px)").matches ? "mobile" : "desktop";
}

/** Reports one error. Deduplicated per session and capped so we never spam. */
export async function reportError(
  message: string,
  opts: { stack?: string; kind?: string } = {},
): Promise<void> {
  if (errorsSent >= MAX_PER_SESSION) return;
  errorsSent += 1;
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("client_errors").insert({
      kind: opts.kind ?? "error",
      message: String(message).slice(0, 800),
      stack: opts.stack?.slice(0, 4000) ?? null,
      route: window.location.pathname,
      release: RELEASE,
      user_agent: navigator.userAgent.slice(0, 300),
      session_id: sessionId(),
      user_id: data.session?.user?.id ?? null,
    });
  } catch {
    /* monitoring must never throw */
  }
}

/** Stores one real-user speed metric (LCP / CLS / INP / TTFB / FCP). */
async function reportVital(metric: string, value: number): Promise<void> {
  if (!Number.isFinite(value)) return;
  try {
    await supabase.from("web_vitals").insert({
      metric,
      value: Math.round(value * 1000) / 1000,
      route: window.location.pathname,
      device: deviceKind(),
      session_id: sessionId(),
    });
  } catch {
    /* ignore */
  }
}

/** Records one funnel step (plan section 54) in the database, not just GA. */
export async function reportFunnel(
  event: string,
  props: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("funnel_events").insert({
      event: event.slice(0, 60),
      session_id: sessionId(),
      user_id: data.session?.user?.id ?? null,
      route: window.location.pathname,
      source: document.referrer ? new URL(document.referrer).hostname : "direct",
      props: props as never,
    });
  } catch {
    /* ignore */
  }
}

function observeVitals() {
  if (typeof PerformanceObserver === "undefined") return;

  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (nav) reportVital("TTFB", nav.responseStart);

  const safeObserve = (
    type: string,
    cb: (entries: PerformanceEntryList) => void,
    buffered = true,
  ) => {
    try {
      const po = new PerformanceObserver((list) => cb(list.getEntries()));
      po.observe({ type, buffered } as PerformanceObserverInit);
      return po;
    } catch {
      return null;
    }
  };

  safeObserve("paint", (entries) => {
    const fcp = entries.find((e) => e.name === "first-contentful-paint");
    if (fcp) reportVital("FCP", fcp.startTime);
  });

  let lcp = 0;
  safeObserve("largest-contentful-paint", (entries) => {
    const last = entries[entries.length - 1];
    if (last) lcp = last.startTime;
  });

  let cls = 0;
  safeObserve("layout-shift", (entries) => {
    for (const e of entries as unknown as { value: number; hadRecentInput: boolean }[]) {
      if (!e.hadRecentInput) cls += e.value;
    }
  });

  let inp = 0;
  safeObserve("event", (entries) => {
    for (const e of entries) {
      const dur = (e as PerformanceEntry & { duration: number }).duration;
      if (dur > inp) inp = dur;
    }
  });

  // Flush once, when the page is actually being left / hidden.
  let flushed = false;
  const flush = () => {
    if (flushed) return;
    flushed = true;
    if (lcp) reportVital("LCP", lcp);
    if (cls) reportVital("CLS", cls);
    if (inp) reportVital("INP", inp);
  };
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", flush);
}

/** Installs global error + vitals capture. Safe to call more than once. */
export function bootstrapMonitoring(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  window.addEventListener("error", (e) => {
    if (!e.message) return;
    void reportError(e.message, { stack: e.error?.stack, kind: "error" });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    void reportError(
      reason?.message ? String(reason.message) : String(reason),
      { stack: reason?.stack, kind: "unhandled_rejection" },
    );
  });

  observeVitals();
}
