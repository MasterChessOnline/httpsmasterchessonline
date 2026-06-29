import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/i18n/I18nProvider";
import App from "./App.tsx";
import "./index.css";

function safeRun(task: () => void) {
  try {
    task();
  } catch {
    // Entry must never crash because of non-critical bootstraps.
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

// Everything below is non-critical and runs after the first Home paint.
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
  const [themes, sounds, a11y, track] = await Promise.all([
    import("./lib/site-themes"),
    import("./lib/chess-sounds"),
    import("./lib/accessibility"),
    import("./lib/track"),
  ]);
  safeRun(themes.bootstrapSiteTheme);
  safeRun(sounds.bootstrapSoundPack);
  safeRun(a11y.bootstrapA11y);
  safeRun(track.captureAttribution);

  // Hard entry reset: old service workers/cached shells caused the stuck splash.
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
