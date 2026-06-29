import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { toast } from "sonner";
import { I18nProvider } from "@/i18n/I18nProvider";
import App from "./App.tsx";
import "./index.css";
import { bootstrapVisualSettings } from "./lib/board-themes";
import { bootstrapSoundPack } from "./lib/chess-sounds";
import { bootstrapA11y } from "./lib/accessibility";
import { captureAttribution } from "./lib/track";
import { bootstrapSiteTheme } from "./lib/site-themes";

function installEntryWatchdog() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const isHome = window.location.pathname === "/" || window.location.pathname === "";
  if (!isHome) return;

  const check = async () => {
    if (document.querySelector('[data-entry-ready="home"]')) return;

    const key = "mc.entry.watchdog.reloaded";
    const alreadyReloaded = sessionStorage.getItem(key) === "1";
    const root = document.getElementById("root");

    if (!alreadyReloaded) {
      sessionStorage.setItem(key, "1");
      sessionStorage.removeItem("mc.splash.shown");
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch {}
      try {
        const regs = await navigator.serviceWorker?.getRegistrations?.();
        await Promise.all((regs ?? []).map((reg) => reg.unregister()));
      } catch {}
      const url = new URL(window.location.href);
      url.searchParams.set("entry", "fresh");
      window.location.replace(url.toString());
      return;
    }

    if (root && !document.querySelector('[data-entry-ready="home"]')) {
      root.innerHTML = `
        <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#070b14;color:#fff;font-family:Inter,system-ui,sans-serif;text-align:center">
          <section style="max-width:440px;width:100%">
            <div style="font-size:48px;margin-bottom:14px">♛</div>
            <h1 style="margin:0 0 10px;font-size:34px;letter-spacing:.04em;color:#f5c542">MASTERCHESS</h1>
            <p style="margin:0 0 24px;color:#cbd5e1">Entry recovered. Choose where to start.</p>
            <a href="/play-guest" style="display:block;background:#f5c542;color:#09090b;border-radius:14px;padding:16px 18px;margin-bottom:12px;text-decoration:none;font-weight:800">PLAY ONLINE</a>
            <a href="/dragan-brakus" style="display:block;border:1px solid rgba(245,197,66,.5);color:#f8e7a1;border-radius:14px;padding:15px 18px;text-decoration:none;font-weight:700">DB Chess Cup</a>
          </section>
        </main>`;
    }
  };

  window.setTimeout(check, 1600);
  window.setTimeout(check, 3200);
}

bootstrapSiteTheme();
bootstrapVisualSettings();
bootstrapSoundPack();
bootstrapA11y();
captureAttribution();
installEntryWatchdog();

// Capture the install prompt at the earliest possible moment so it's never
// missed by late-mounting components. Chrome fires `beforeinstallprompt`
// once and won't refire — we stash it on window for the Install button.
(() => {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    (window as unknown as { __mcInstallPrompt?: Event }).__mcInstallPrompt = e;
    window.dispatchEvent(new Event("mc:install-ready"));
  });
})();

// Service worker: register only in production AND only outside Lovable previews/iframes.
// Inside the editor preview a cached shell would mask code changes.
//
// Auto-update flow:
//   1. We register `/sw.js?v=<APP_VERSION>` so each new release fetches a
//      different worker URL — the browser treats it as a new SW and installs it.
//   2. While the app is open we poll `registration.update()` every 60s and on
//      visibility/focus so users on a long-lived tab pick up new builds fast.
//   3. When a new worker reaches the `installed` state and there's already a
//      controlling SW, we show a "New version available" toast. Accepting it
//      posts `SKIP_WAITING` to the waiting worker, which activates immediately.
//   4. `controllerchange` then fires and we reload the page exactly once so
//      the user lands on the new build — no manual hard-refresh required.
(() => {
  if (!("serviceWorker" in navigator)) return;
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const host = window.location.hostname;
  const isPreview = host.includes("id-preview--") || host.includes("lovableproject.com");
  if (!import.meta.env.PROD || inIframe || isPreview) {
    // Make sure no stale worker keeps serving cached HTML in the editor.
    navigator.serviceWorker.getRegistrations?.()
      .then((rs) => rs.forEach((r) => r.unregister()))
      .catch(() => {});
    return;
  }

  const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";
  const SW_URL = `/sw.js?v=${encodeURIComponent(APP_VERSION)}`;

  const promptUpdate = (worker: ServiceWorker) => {
    toast("New version available", {
      description: "MasterChess just got an update. Reload to apply it.",
      duration: Infinity,
      action: {
        label: "Reload",
        onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
      },
    });
  };

  const trackWaiting = (reg: ServiceWorkerRegistration) => {
    // A worker already installed and waiting from a previous session.
    if (reg.waiting && navigator.serviceWorker.controller) {
      promptUpdate(reg.waiting);
    }
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          promptUpdate(nw);
        }
      });
    });
  };

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SW_URL)
      .then((reg) => {
        trackWaiting(reg);

        // Background update polling — every 60s while the tab is alive.
        const poll = window.setInterval(() => {
          reg.update().catch(() => {});
        }, 60_000);

        const onVisible = () => {
          if (document.visibilityState === "visible") reg.update().catch(() => {});
        };
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", () => reg.update().catch(() => {}));

        window.addEventListener("beforeunload", () => {
          window.clearInterval(poll);
          document.removeEventListener("visibilitychange", onVisible);
        });
      })
      .catch(() => {});

    // Reload exactly once when a new worker takes control.
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  });
})();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <I18nProvider>
      <App />
    </I18nProvider>
  </HelmetProvider>
);
