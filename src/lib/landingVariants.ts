/**
 * A/B-TESTABLE LANDING COPY
 *
 * Headline + CTA text live here so a variant can be swapped without touching
 * layout code. A visitor is assigned one variant (sticky in localStorage) and
 * the assignment is reported with every funnel event, so we can measure which
 * copy produces registrations and first games — not just clicks.
 *
 * Force a variant for a screenshot or a paid campaign with ?v=b / ?v=c.
 */

export type LandingVariantKey = "a" | "b" | "c";

export interface LandingVariant {
  key: LandingVariantKey;
  /** Big line under the MASTERCHESS wordmark. */
  headline: string;
  /** One sentence that explains the product. */
  subheadline: string;
  /** Dominant button label. */
  primaryCta: string;
  /** Quiet secondary button label. */
  secondaryCta: string;
}

export const LANDING_VARIANTS: Record<LandingVariantKey, LandingVariant> = {
  a: {
    key: "a",
    headline: "PLAY CHESS. LIVE.",
    subheadline:
      "Challenge real opponents, climb the leaderboard, and become a MasterChess champion.",
    primaryCta: "PLAY NOW ♟",
    secondaryCta: "EXPLORE MASTERCHESS",
  },
  b: {
    key: "b",
    headline: "YOUR NEXT CHESS GAME STARTS HERE.",
    subheadline:
      "Challenge real opponents, climb the leaderboard, and become a MasterChess champion.",
    primaryCta: "PLAY FREE",
    secondaryCta: "EXPLORE MASTERCHESS",
  },
  c: {
    key: "c",
    headline: "CAN YOU BEAT YOUR NEXT OPPONENT?",
    subheadline:
      "Live games, real ratings and daily tournaments. Start playing in one tap.",
    primaryCta: "START PLAYING",
    secondaryCta: "EXPLORE MASTERCHESS",
  },
};

const STORAGE_KEY = "mc_landing_variant";

function isKey(v: string | null): v is LandingVariantKey {
  return v === "a" || v === "b" || v === "c";
}

/** Sticky variant assignment. URL (?v=) always wins and is remembered. */
export function getLandingVariant(): LandingVariant {
  let key: LandingVariantKey = "a";
  try {
    const forced = new URLSearchParams(window.location.search).get("v");
    if (isKey(forced)) {
      key = forced;
      localStorage.setItem(STORAGE_KEY, key);
      return LANDING_VARIANTS[key];
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isKey(stored)) return LANDING_VARIANTS[stored];
    // Even split across the three copy directions.
    key = (["a", "b", "c"] as LandingVariantKey[])[Math.floor(Math.random() * 3)];
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* private mode — fall back to variant A */
  }
  return LANDING_VARIANTS[key];
}

/** Where PLAY NOW goes: straight to live matchmaking, signup only if needed. */
export const MATCHMAKING_PATH = "/play/online?auto=1";

/**
 * Where a brand-new account lands: one warm-up game against the weakest bot,
 * with the live-opponent button on the post-game screen. Dropping a first-time
 * player straight into an empty matchmaking queue reads as a dead site.
 */
export const FIRST_GAME_PATH = "/first-game";

export function playNowHref(isSignedIn: boolean): string {
  return isSignedIn
    ? MATCHMAKING_PATH
    : `/signup?redirect=${encodeURIComponent(FIRST_GAME_PATH)}`;
}

/** True when this visitor arrived through a paid ad landing page. */
export function isAdSession(): boolean {
  try {
    return localStorage.getItem("mc_ig_session") === "1";
  } catch {
    return false;
  }
}

/** True when the visit came from an Instagram campaign link. */
export function isInstagramTraffic(search = window.location.search): boolean {
  const source = (new URLSearchParams(search).get("utm_source") || "").toLowerCase();
  return source === "instagram" || source === "ig";
}
