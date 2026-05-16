// App Badging API — updates the number badge on the installed PWA icon
// (iOS 16.4+ supports it for PWAs added to Home Screen; Android Chrome supports it).
// No-op on unsupported devices. Safe to call frequently.

type NavigatorWithBadge = Navigator & {
  setAppBadge?: (n?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export function badgeSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof (navigator as NavigatorWithBadge).setAppBadge === "function";
}

export async function setAppBadge(count: number): Promise<void> {
  if (!badgeSupported()) return;
  try {
    const nav = navigator as NavigatorWithBadge;
    if (count <= 0) await nav.clearAppBadge?.();
    else await nav.setAppBadge?.(count);
  } catch {
    /* ignore — badging is best-effort */
  }
}

export async function clearAppBadge(): Promise<void> {
  if (!badgeSupported()) return;
  try {
    await (navigator as NavigatorWithBadge).clearAppBadge?.();
  } catch {
    /* ignore */
  }
}
