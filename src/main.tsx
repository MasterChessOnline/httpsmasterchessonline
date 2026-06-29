import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/i18n/I18nProvider";
import App from "./App.tsx";
import "./index.css";

const STARTUP_TIMEOUT_MS = 5000;

function entryLog(label: string, payload?: unknown) {
  try {
    console.info(`[MasterChess Entry] ${label}`, payload ?? "");
  } catch {
    // Startup logging must never block rendering.
  }
}

function safeRun(task: () => void) {
  try {
    task();
  } catch {
    // Entry must never crash because of non-critical bootstraps.
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

entryLog("APP_INIT_START");

function renderStaticSafeHome(reason: string) {
  entryLog("ERROR_STATE", { step: "ENTRY_WATCHDOG", reason });
  rootEl.innerHTML = `
    <main data-entry-ready="static-fallback" style="min-height:100vh;display:grid;place-items:center;padding:24px;background:hsl(222 47% 5%);color:hsl(40 30% 94%);font-family:Inter,system-ui,sans-serif;text-align:center;position:relative;overflow:hidden;">
      <div aria-hidden="true" style="position:absolute;inset:0;background:radial-gradient(720px 520px at 50% 0%, hsl(43 90% 55% / .18), transparent 70%),radial-gradient(680px 520px at 100% 100%, hsl(217 91% 60% / .14), transparent 72%);"></div>
      <section style="position:relative;z-index:1;max-width:720px;">
        <div style="margin:0 auto 22px;display:grid;place-items:center;width:80px;height:80px;border-radius:18px;border:1px solid hsl(43 90% 55% / .35);background:hsl(43 90% 55% / .1);font-size:42px;color:hsl(43 90% 55%);">♛</div>
        <p style="margin:0 0 12px;color:hsl(43 90% 55%);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.18em;">Safe entry mode</p>
        <h1 style="margin:0;font-size:clamp(48px,12vw,92px);line-height:.9;font-family:Georgia,serif;text-transform:uppercase;">Master<span style="color:hsl(43 90% 55%);">Chess</span></h1>
        <p style="margin:22px auto 0;max-width:560px;color:hsl(220 12% 65%);font-size:17px;line-height:1.55;">The full app took too long to load. Use the safe links below or retry.</p>
        <nav style="margin-top:30px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
          <a href="/play-guest" style="display:inline-flex;height:48px;align-items:center;justify-content:center;border-radius:8px;background:hsl(43 90% 55%);color:hsl(222 47% 6%);padding:0 18px;font-weight:800;text-decoration:none;">Play now</a>
          <a href="/dragan-brakus/register" style="display:inline-flex;height:48px;align-items:center;justify-content:center;border-radius:8px;border:1px solid hsl(222 30% 16%);background:hsl(222 40% 9%);color:hsl(40 30% 94%);padding:0 18px;font-weight:800;text-decoration:none;">Register DB Cup</a>
          <button onclick="window.location.reload()" style="height:48px;border-radius:8px;border:1px solid hsl(222 30% 16%);background:hsl(222 30% 13%);color:hsl(40 30% 94%);padding:0 18px;font-weight:800;cursor:pointer;">Retry</button>
        </nav>
      </section>
    </main>`;
}

const root = createRoot(rootEl);

const entryWatchdog = window.setTimeout(() => {
  const hasReadyRoute = Boolean(document.querySelector("[data-entry-ready]"));
  const hasVisibleText = document.body.innerText.trim().length > 20;
  if (!hasReadyRoute || !hasVisibleText) {
    renderStaticSafeHome("startup-timeout");
  }
}, STARTUP_TIMEOUT_MS);

try {
  root.render(
    <HelmetProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </HelmetProvider>,
  );
} catch (error) {
  window.clearTimeout(entryWatchdog);
  renderStaticSafeHome("render-throw");
}

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
  const [themes, boardThemes, sounds, a11y, track] = await Promise.all([
    import("./lib/site-themes"),
    import("./lib/board-themes"),
    import("./lib/chess-sounds"),
    import("./lib/accessibility"),
    import("./lib/track"),
  ]);
  safeRun(themes.bootstrapSiteTheme);
  safeRun(boardThemes.bootstrapVisualSettings);
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
