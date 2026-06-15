// Single component used by all SEO landing routes. Looks up the config
// by the route path and renders the reusable template.
import { useLocation, Navigate } from "react-router-dom";
import SeoLandingPage from "@/components/SeoLandingPage";
import { SR_LANDINGS } from "@/lib/seo-landings-sr";
import { EN_LANDINGS } from "@/lib/seo-landings-en";

export default function SeoLandingRoute() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/$/, "") || "/";

  // Build a flat path -> config map (covers all SR + EN landings)
  const all = { ...EN_LANDINGS, ...SR_LANDINGS };
  const config = Object.values(all).find((c) => c.path === path);

  if (!config) return <Navigate to="/" replace />;
  return <SeoLandingPage config={config} />;
}
