// Validate caller-supplied returnUrl against an allowlist to prevent open-redirect
// attacks in payment success/cancel flows.
const ALLOWED_ORIGINS = new Set([
  "https://masterchess.live",
  "https://www.masterchess.live",
  "https://masterchess-live.lovable.app",
]);

export function safeReturnUrl(input: string | undefined, fallbackOrigin: string | null): string {
  const fallback = (fallbackOrigin && isAllowedOrigin(fallbackOrigin))
    ? fallbackOrigin
    : "https://masterchess.live";

  if (!input || typeof input !== "string") return fallback;

  try {
    const url = new URL(input);
    if (!isAllowedOrigin(url.origin)) return fallback;
    // Strip query/hash to avoid smuggling
    return `${url.origin}${url.pathname}`.replace(/\/$/, "") || url.origin;
  } catch {
    return fallback;
  }
}

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const u = new URL(origin);
    // Allow Lovable preview subdomains (e.g. id-preview--*.lovable.app)
    if (u.protocol === "https:" && u.hostname.endsWith(".lovable.app")) return true;
  } catch { /* ignore */ }
  return false;
}
