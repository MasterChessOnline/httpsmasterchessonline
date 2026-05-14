// Lightweight analytics loader. Activates only when VITE_GA4_ID is set.
// Add it to your env (e.g. "G-XXXXXXXXXX") and the GA4 tag loads sitewide.
// Includes SPA pageview tracking on every route change.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = import.meta.env.VITE_GA4_ID as string | undefined;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let injected = false;
function injectGtag(id: string) {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, { send_page_view: false });
}

export default function Analytics() {
  const location = useLocation();
  useEffect(() => {
    if (!GA_ID) return;
    injectGtag(GA_ID);
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);
  return null;
}
