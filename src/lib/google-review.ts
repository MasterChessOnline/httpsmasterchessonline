/**
 * Single source of truth for every "Review us on Google" / "Find us on Google Maps"
 * link in the app. When the Place ID becomes available (after GBP verification),
 * set the `VITE_GOOGLE_REVIEW_URL` env var to:
 *   https://search.google.com/local/writereview?placeid={PLACE_ID}
 * and every surface updates automatically.
 *
 * Pre-verification, the fallback opens Google Maps search (not generic Google
 * search) so the user lands inside Maps — better signal for the listing.
 */
export const GOOGLE_REVIEW_URL: string =
  (import.meta.env.VITE_GOOGLE_REVIEW_URL as string | undefined) ||
  "https://www.google.com/maps/search/?api=1&query=MasterChess+masterchess.live";

export const GOOGLE_MAPS_URL: string =
  "https://www.google.com/maps/search/?api=1&query=MasterChess+masterchess.live";

/** Light analytics ping — safe no-op if `gtag` isn't loaded. */
export function trackReviewClick(surface: string) {
  try {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    w.gtag?.("event", "gbp_review_click", { surface });
  } catch {
    // ignore
  }
}
