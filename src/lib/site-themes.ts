// Site-wide color themes. Each theme writes a small set of CSS variables on
// :root (via data-site-theme="..." attribute, with the CSS overrides defined in
// index.css). Five vibrant top themes show as inline swatches; the rest live in
// the "More" popover so the navbar stays clean.

export interface SiteTheme {
  key: string;
  label: string;
  swatch: string;       // hex for the picker chip
  description: string;
}

// Top 5 (inline swatches in navbar) intentionally mix dark + light + warm + cool
// so the picker visibly reads as "puno boja, ljudski", not all-black.
export const SITE_THEMES: SiteTheme[] = [
  // Single canonical look used site-wide. Five-color palette: gold accent,
  // sapphire CTAs, emerald "live", coral timers, deep-night background.
  { key: "live",       label: "MasterChess Live", swatch: "#d4af37", description: "Five-color tournament look — gold, sapphire, emerald, coral on midnight" },
  // Kept only for back-compat with old localStorage values; not selectable.
  { key: "royal",      label: "Royal Sapphire",  swatch: "#3b82f6", description: "Legacy" },
  { key: "gold",       label: "Gold & Black",    swatch: "#d4af37", description: "Legacy" },
];


const STORAGE_KEY = "mc.site-theme";
const EVENT = "masterchess:site-theme-change";

export function applySiteTheme(key: string) {
  const theme = SITE_THEMES.find(t => t.key === key) || SITE_THEMES[0];
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-site-theme", theme.key);
  try { localStorage.setItem(STORAGE_KEY, theme.key); } catch {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: theme.key }));
  }
}

export function getActiveSiteTheme(): string {
  if (typeof document === "undefined") return "royal";
  return document.documentElement.getAttribute("data-site-theme") || "royal";
}

export function onSiteThemeChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

export function bootstrapSiteTheme() {
  if (typeof window === "undefined") return;
  // Theme picker removed — every visitor gets the same rich multi-color
  // "MasterChess Live" look. Any legacy localStorage value is ignored.
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  applySiteTheme("live");
}

