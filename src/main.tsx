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
  const [themes, boardThemes, sounds, a11y, track, analytics] = await Promise.all([
    import("./lib/site-themes"),
    import("./lib/board-themes"),
    import("./lib/chess-sounds"),
    import("./lib/accessibility"),
    import("./lib/track"),
    import("./lib/analytics"),
  ]);
  safeRun(themes.bootstrapSiteTheme);
  safeRun(boardThemes.bootstrapVisualSettings);
  safeRun(sounds.bootstrapSoundPack);
  safeRun(a11y.bootstrapA11y);
  safeRun(track.captureAttribution);
  safeRun(analytics.bootstrapAnalytics);

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
