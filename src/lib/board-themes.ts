// Centralized board themes + piece style registry.
// Writes the chosen palette to CSS variables so every <ChessBoard /> on the
// platform updates instantly with no React state plumbing.

export interface BoardTheme {
  key: string;
  label: string;
  description: string;
  light: string; // HSL string "h s% l%"
  dark: string;  // HSL string "h s% l%"
}

export const BOARD_THEMES: BoardTheme[] = [
  { key: "classic",   label: "Classic Wood",      description: "Warm tournament wood",         light: "33 45% 70%",  dark: "25 38% 32%" },
  { key: "green",     label: "Green Tournament",  description: "Olympiad green felt",          light: "120 22% 80%", dark: "145 32% 36%" },
  { key: "blue",      label: "Blue Modern",       description: "Cool deep ocean",              light: "210 38% 78%", dark: "210 45% 32%" },
  { key: "dark",      label: "Dark Minimal",      description: "Pure dark, distraction-free",  light: "220 12% 28%", dark: "220 14% 12%" },
  { key: "contrast",  label: "High Contrast",     description: "Maximum visibility",           light: "0 0% 100%",   dark: "0 0% 8%"     },
  { key: "marble",    label: "Marble",            description: "Polished stone",               light: "0 0% 92%",    dark: "0 0% 48%"    },
  { key: "neon",      label: "Neon Cyber",        description: "Violet bloom, modern UI",      light: "280 50% 70%", dark: "265 60% 22%" },
  { key: "gold",      label: "Black & Gold",      description: "MasterChess signature",        light: "43 60% 60%",  dark: "0 0% 12%"    },
  { key: "minimal",   label: "Flat Minimal",      description: "No texture, soft greys",       light: "220 8% 88%",  dark: "220 10% 38%" },
  { key: "forest",    label: "Forest",            description: "Earth & moss",                 light: "75 25% 70%",  dark: "120 30% 22%" },
  { key: "rose",      label: "Rose Quartz",       description: "Soft warm pink",               light: "350 60% 88%", dark: "345 30% 38%" },
];

export interface PieceStyle {
  key: string;
  label: string;
  description: string;
  // Pure-CSS rendering recipe so we don't need image assets
  render: {
    whiteFill: string;          // CSS color for white pieces
    blackFill: string;          // CSS color for black pieces
    whiteStroke?: string;       // Optional outline for white
    blackStroke?: string;       // Optional outline for black
    fontWeight?: number;
    glow?: string;              // box/text-shadow color for accents
  };
}

export const PIECE_STYLES: PieceStyle[] = [
  {
    key: "standard",
    label: "Standard",
    description: "Classic chess pieces",
    render: { whiteFill: "#ffffff", blackFill: "hsl(220,15%,8%)", whiteStroke: "rgba(0,0,0,0.85)", fontWeight: 400 },
  },
  {
    key: "minimal",
    label: "Modern Minimal",
    description: "Light, clean silhouettes",
    render: { whiteFill: "#f4f4f5", blackFill: "#18181b", fontWeight: 300 },
  },
  {
    key: "bold",
    label: "Bold High-Contrast",
    description: "Heavy weight, easy to read",
    render: { whiteFill: "#ffffff", blackFill: "#000000", whiteStroke: "rgba(0,0,0,1)", blackStroke: "rgba(255,255,255,0.4)", fontWeight: 700 },
  },
  {
    key: "neon",
    label: "Neon Glow",
    description: "Cyber-style with light bloom",
    render: { whiteFill: "#fef3c7", blackFill: "#a78bfa", glow: "rgba(168,85,247,0.6)", fontWeight: 500 },
  },
  {
    key: "royal",
    label: "Golden Royal",
    description: "Premium gold accents",
    render: { whiteFill: "#fbbf24", blackFill: "#1f1611", whiteStroke: "rgba(120,80,0,0.7)", fontWeight: 500 },
  },
  {
    key: "monochrome",
    label: "Monochrome",
    description: "Pure black on white",
    render: { whiteFill: "#e5e5e5", blackFill: "#0a0a0a", fontWeight: 400 },
  },
];

const STORAGE_KEY = "chess-settings";

function readSettings(): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

/** Apply a board theme by writing CSS variables on :root. Picks up live across the app. */
export function applyBoardTheme(themeKey: string) {
  const theme = BOARD_THEMES.find(t => t.key === themeKey) || BOARD_THEMES[0];
  const root = document.documentElement;
  root.style.setProperty("--board-light", theme.light);
  root.style.setProperty("--board-dark", theme.dark);
}

/** Apply a piece style by writing CSS variables consumed by chess pieces. */
export function applyPieceStyle(styleKey: string) {
  const style = PIECE_STYLES.find(s => s.key === styleKey) || PIECE_STYLES[0];
  const root = document.documentElement;
  root.style.setProperty("--piece-white", style.render.whiteFill);
  root.style.setProperty("--piece-black", style.render.blackFill);
  root.style.setProperty("--piece-white-stroke", style.render.whiteStroke || "transparent");
  root.style.setProperty("--piece-black-stroke", style.render.blackStroke || "transparent");
  root.style.setProperty("--piece-weight", String(style.render.fontWeight || 400));
  root.style.setProperty("--piece-glow", style.render.glow || "transparent");
}

/** Bootstrap on app start: load saved theme + piece style and apply to :root. */
export function bootstrapVisualSettings() {
  if (typeof window === "undefined") return;
  const s = readSettings();
  if (s.boardTheme) applyBoardTheme(s.boardTheme);
  if (s.pieceStyle) applyPieceStyle(s.pieceStyle);
}
