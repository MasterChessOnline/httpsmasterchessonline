import { useEffect, useState } from "react";

export const INSTALLED_KEY = "mc.install.done.v1";

/**
 * Reliable PWA install detection for iOS + Android + desktop.
 *
 * Sources of truth (any one ⇒ installed):
 *   1. `appinstalled` event fired (Chromium / Android)
 *   2. `(display-mode: standalone | window-controls-overlay | fullscreen | minimal-ui)`
 *      matches — covers Android, desktop and iOS 17+ Safari home-screen launches.
 *   3. `navigator.standalone === true` — iOS Safari home-screen launches.
 *   4. `navigator.getInstalledRelatedApps()` returns a related PWA — Chromium.
 *
 * We re-check on `visibilitychange` + `focus` so that when the user returns to
 * the page after installing, the overlay / install button disappear instantly
 * without requiring a hard refresh.
 */
export function useInstallStatus() {
  const [installed, setInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(INSTALLED_KEY) === "1";
  });
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return checkStandalone();
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const markInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_KEY, "1");
      } catch {}
      setInstalled(true);
    };

    const reevaluate = async () => {
      const standalone = checkStandalone();
      setIsStandalone(standalone);
      if (standalone) {
        markInstalled();
        return;
      }
      // Chromium: ask the platform if a related PWA is installed.
      const nav = navigator as Navigator & {
        getInstalledRelatedApps?: () => Promise<Array<{ platform?: string }>>;
      };
      if (typeof nav.getInstalledRelatedApps === "function") {
        try {
          const apps = await nav.getInstalledRelatedApps();
          if (apps && apps.length > 0) markInstalled();
        } catch {}
      }
    };

    // 1. Native install event
    const onInstalled = () => markInstalled();
    window.addEventListener("appinstalled", onInstalled);

    // 2. display-mode media-query listeners (any of these flips to true ⇒ PWA)
    const queries = [
      "(display-mode: standalone)",
      "(display-mode: window-controls-overlay)",
      "(display-mode: fullscreen)",
      "(display-mode: minimal-ui)",
    ].map((q) => window.matchMedia(q));
    const onMqChange = () => reevaluate();
    queries.forEach((mq) => {
      try {
        mq.addEventListener("change", onMqChange);
      } catch {
        // Safari < 14 fallback
        mq.addListener(onMqChange);
      }
    });

    // 3. Re-check whenever the page regains focus (iOS home-screen launch case)
    const onVisible = () => {
      if (document.visibilityState === "visible") reevaluate();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", reevaluate);
    window.addEventListener("pageshow", reevaluate);

    // Initial async check (related apps)
    reevaluate();

    return () => {
      window.removeEventListener("appinstalled", onInstalled);
      queries.forEach((mq) => {
        try {
          mq.removeEventListener("change", onMqChange);
        } catch {
          mq.removeListener(onMqChange);
        }
      });
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", reevaluate);
      window.removeEventListener("pageshow", reevaluate);
    };
  }, []);

  return { installed, isStandalone };
}

function checkStandalone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches
    ) {
      return true;
    }
  } catch {}
  // @ts-expect-error iOS-only
  if (window.navigator.standalone === true) return true;
  return false;
}
