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
  { key: "royal",      label: "Royal Sapphire",  swatch: "#3b82f6", description: "Tournament-blue accents on midnight" },
  { key: "emerald",    label: "Emerald Hall",    swatch: "#10b981", description: "Deep green felt, classic club energy" },
  { key: "sunset",     label: "Sunset Coral",    swatch: "#fb923c", description: "Warm coral on warm black" },
  { key: "terracotta", label: "Terracotta Café", swatch: "#c2410c", description: "Light warm café — terracotta + olive" },
  { key: "sky",        label: "Sky Studio",      swatch: "#0ea5e9", description: "Light sky blue tournament-room mode" },
  // overflow themes (still selectable from the "More" popover)
  { key: "gold",       label: "Gold & Black",    swatch: "#d4af37", description: "Signature MasterChess gold on deep black" },
  { key: "ruby",       label: "Ruby Knight",     swatch: "#ef4444", description: "Crimson red on charcoal" },
  { key: "violet",     label: "Violet Arena",    swatch: "#a855f7", description: "Twitch-purple cinematic accents" },
  { key: "ocean",      label: "Ocean Cyan",      swatch: "#06b6d4", description: "Cool cyan on deep navy" },
  { key: "ivory",      label: "Ivory Day",       swatch: "#f5f3ee", description: "Light tournament-room mode" },
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

