import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { detectTrafficSource, isSocialSource } from "@/lib/trafficSource";
import { track } from "@/lib/track";

const REDIRECTED_KEY = "mc_social_routed";

/**
 * SOCIAL ENTRY ROUTER
 *
 * An Instagram visitor who lands on the home page sees a full site: menus,
 * sections, sign-in. That is the wrong first screen for someone who tapped a
 * video, so the very first home view from Instagram / Facebook / TikTok is
 * forwarded once to the beginner-first ad funnel (`/ig`), where a bot game
 * starts on the first tap and the account offer comes after it.
 *
 * Runs only for the home page, only once per session, never for signed-in
 * users (they keep their dashboard) and never for crawlers.
 */
export default function SocialTrafficRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname !== "/") return;
    // Never hijack the funnel pages themselves or an explicit deep link.
    try {
      if (sessionStorage.getItem(REDIRECTED_KEY) === "1") return;
      // A returning player has a saved session — do not push them into the ad page.
      const hasAccount = Object.keys(localStorage).some((k) =>
        k.startsWith("sb-") && k.endsWith("-auth-token"),
      );
      if (hasAccount) return;
    } catch {
      return;
    }

    const { source, signal } = detectTrafficSource();
    if (!isSocialSource(source)) return;

    try {
      sessionStorage.setItem(REDIRECTED_KEY, "1");
    } catch {
      /* ignore */
    }

    track("social_entry_detected", { surface: "home", ad_source: source, variant: signal });

    const params = new URLSearchParams(location.search);
    if (!params.get("utm_source")) params.set("utm_source", source);
    params.set("detected", signal);
    navigate(`/ig?${params.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  return null;
}
