import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/i18n/I18nProvider";
import App from "./App.tsx";
import "./index.css";

function safeRun(task: () => void) {
  try {
    task();
  } catch {
    // Non-critical bootstraps must never crash startup.
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <HelmetProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </HelmetProvider>,
);

// Everything below is non-critical and runs after the first paint.
const afterFirstPaint = (cb: () => void) => {
  const run = () => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(cb, { timeout: 1200 });
    } else {
      window.setTimeout(cb, 250);
    }
  };
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
};

afterFirstPaint(async () => {
  // Avoid one large parse/execute spike immediately after first paint on a
  // phone. Visual settings come first; telemetry and audio can follow once the
  // main thread has yielded.
  const [themes, boardThemes, a11y] = await Promise.all([
    import("./lib/site-themes"),
    import("./lib/board-themes"),
    import("./lib/accessibility"),
  ]);
  safeRun(themes.bootstrapSiteTheme);
  safeRun(boardThemes.bootstrapVisualSettings);
  safeRun(a11y.bootstrapA11y);

  await new Promise<void>((resolve) => window.setTimeout(resolve, 350));
  const [sounds, track, analytics] = await Promise.all([
    import("./lib/chess-sounds"),
    import("./lib/track"),
    import("./lib/analytics"),
  ]);
  safeRun(sounds.bootstrapSoundPack);
  safeRun(track.captureAttribution);
  // Funnel: records the visit day so a next-day return is measurable.
  import("./lib/funnel").then((m) => safeRun(m.markVisit)).catch(() => {});
  safeRun(analytics.bootstrapAnalytics);
  // Monitoring (errors + real-user Core Web Vitals) — plan sections 23/24.
  import("./lib/monitoring")
    .then((m) => {
      safeRun(m.bootstrapMonitoring);
      void m.reportFunnel("page_view");
    })
    .catch(() => {});

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations?.()
      .then((regs) => regs.forEach((reg) => reg.unregister()))
      .catch(() => {});
  }
  if ("caches" in window) {
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("mc-shell")).map((key) => caches.delete(key))))
      .catch(() => {});
  }
});
