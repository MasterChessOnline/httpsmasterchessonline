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
  // — Originals —
  { key: "classic",   label: "Dark Wood",         description: "Polished dark walnut tournament board", light: "30 35% 52%",  dark: "22 45% 16%" },
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

  // — Classic warm tones —
  { key: "brown",     label: "Classic Brown",     description: "Iconic warm brown",            light: "32 47% 78%",  dark: "26 40% 38%" },
  { key: "blue3",     label: "Sky Blue",          description: "Soft pastel sky",              light: "210 60% 88%", dark: "210 50% 48%" },
  { key: "purple",    label: "Royal Purple",      description: "Deep regal purple",            light: "275 35% 80%", dark: "275 45% 30%" },

  // — New colors —
  { key: "sand",      label: "Desert Sand",       description: "Warm dunes",                   light: "40 55% 82%",  dark: "30 40% 42%" },
  { key: "ice",       label: "Glacier Ice",       description: "Frozen blue-white",            light: "195 60% 92%", dark: "200 35% 45%" },
  { key: "coral",     label: "Coral Reef",        description: "Warm tropical coral",          light: "15 70% 85%",  dark: "10 50% 38%" },
  { key: "olive",     label: "Olive Grove",       description: "Mediterranean olive",          light: "65 30% 72%",  dark: "75 25% 28%" },
  { key: "midnight",  label: "Midnight",          description: "Deep navy noir",               light: "220 30% 35%", dark: "225 50% 10%" },
  { key: "sunset",    label: "Sunset",            description: "Warm orange & wine",           light: "25 75% 70%",  dark: "350 45% 25%" },
  { key: "mint",      label: "Mint Fresh",        description: "Crisp mint pastel",            light: "150 50% 85%", dark: "165 40% 35%" },

  // — Tournament & specialty —
  { key: "tournament", label: "Tournament Vinyl", description: "Standard FIDE vinyl",          light: "45 25% 88%",  dark: "150 25% 30%" },
  { key: "glassmorph", label: "Glassmorphic",     description: "Frosted glass aesthetic",      light: "200 30% 90%", dark: "215 40% 20%" },
  { key: "carbon",    label: "Carbon Fiber",      description: "Tech matte black",             light: "210 8% 32%",  dark: "210 10% 14%" },
  { key: "ivory",     label: "Antique Ivory",     description: "Warm aged ivory",              light: "40 40% 85%",  dark: "30 20% 25%" },
  { key: "emerald",   label: "Emerald",           description: "Jeweled deep green",           light: "150 35% 75%", dark: "155 60% 18%" },
  { key: "ruby",      label: "Ruby",              description: "Burgundy & rose",              light: "350 45% 80%", dark: "355 55% 25%" },
  { key: "sapphire",  label: "Sapphire",          description: "Royal jewel blue",             light: "215 55% 78%", dark: "220 70% 22%" },

  // — Seasonal —
  { key: "halloween", label: "Halloween",         description: "Pumpkin & shadow",             light: "30 80% 60%",  dark: "270 50% 14%" },
  { key: "winter",    label: "Winter",            description: "Snow & frost",                 light: "200 30% 95%", dark: "215 25% 35%" },
  { key: "spring",    label: "Spring Bloom",      description: "Cherry blossom pastel",        light: "340 55% 90%", dark: "120 25% 40%" },
];

export interface PieceGlyphSet {
  // Each entry is the glyph (or short string) used to render that piece — only
  // used by the Unicode-based "standard" family. SVG-based sets ignore this
  // and load actual piece artwork from /public/pieces/<set>/<color><type>.svg.
  K: string; Q: string; R: string; B: string; N: string; P: string; // white
  k: string; q: string; r: string; b: string; n: string; p: string; // black
}

// Standard chess Unicode set (used by the Unicode-render family of styles).
const GLYPHS_STANDARD: PieceGlyphSet = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

export interface PieceStyle {
  key: string;
  label: string;
  description: string;
  // Render mode:
  //  - "unicode" → render the glyph from `glyphs` and tint with whiteFill/blackFill
  //  - "svg"     → render <img src="/pieces/<svgFolder>/wK.svg"> (real artwork)
  mode: "unicode" | "svg";
  glyphs: PieceGlyphSet;
  // SVG folder under /public/pieces — only used when mode === "svg"
  svgFolder?: "cburnett" | "merida" | "cardinal" | "pixel";
  // Pure-CSS rendering recipe (used by unicode mode + as accent on some svg sets)
  render: {
    whiteFill: string;          // CSS color for white pieces (unicode only)
    blackFill: string;          // CSS color for black pieces (unicode only)
    whiteStroke?: string;       // Optional outline for white
    blackStroke?: string;       // Optional outline for black
    fontWeight?: number;
    glow?: string;              // box/text-shadow color for accents
    // Filter applied to SVG <img> for tonal tweaks (e.g. brightness, hue-rotate).
    svgFilter?: string;
    // Pixel rendering — used by 8-bit set so it stays crisp.
    pixelated?: boolean;
  };
}

export const PIECE_STYLES: PieceStyle[] = [
  // === REAL SVG PIECE SETS — authentic chess piece artwork ===
  {
    key: "merida",
    label: "Merida",
    description: "Tournament classic — Italian competition style (default)",
    mode: "svg",
    svgFolder: "merida",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#ffffff", blackFill: "#000000" },
  },
  {
    key: "cburnett",
    label: "Cburnett Classic",
    description: "Iconic Staunton — hand-drawn tournament style",
    mode: "svg",
    svgFolder: "cburnett",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#fbf3e0", blackFill: "#161214" },
  },
  {
    key: "neo",
    label: "Neo Modern",
    description: "Bold silhouettes with strong outlines",
    mode: "svg",
    svgFolder: "cardinal",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#ffffff", blackFill: "#000000" },
  },
  {
    key: "pixel",
    label: "Pixel (8-bit)",
    description: "Retro 8-bit pieces — crunchy & nostalgic",
    mode: "svg",
    svgFolder: "pixel",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#ffffff", blackFill: "#000000", pixelated: true },
  },

  // === UNICODE STAUNTON FAMILY — fast, no assets, color/finish variations ===
  {
    key: "standard",
    label: "Classic Staunton",
    description: "Polished ivory & ebony, tournament finish",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#fbf3e0", blackFill: "#161214", whiteStroke: "rgba(40,25,10,0.75)", blackStroke: "rgba(255,235,200,0.18)", fontWeight: 500, glow: "rgba(255,220,170,0.22)" },
  },
  {
    key: "minimal",
    label: "Modern Minimal",
    description: "Light, clean silhouettes",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#f4f4f5", blackFill: "#18181b", fontWeight: 300 },
  },
  {
    key: "bold",
    label: "Bold High-Contrast",
    description: "Heavy weight, easy to read",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#ffffff", blackFill: "#000000", whiteStroke: "rgba(0,0,0,1)", blackStroke: "rgba(255,255,255,0.4)", fontWeight: 700 },
  },
  {
    key: "glass",
    label: "Glass",
    description: "Translucent with subtle glow",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "rgba(255,255,255,0.85)", blackFill: "rgba(20,20,30,0.85)", whiteStroke: "rgba(255,255,255,0.6)", blackStroke: "rgba(180,180,255,0.5)", glow: "rgba(180,200,255,0.45)", fontWeight: 400 },
  },
  {
    key: "outline",
    label: "Outline",
    description: "Hollow pieces, max clarity",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "transparent", blackFill: "transparent", whiteStroke: "rgba(255,255,255,1)", blackStroke: "rgba(0,0,0,1)", fontWeight: 600 },
  },
  {
    key: "neon",
    label: "Neon Glow",
    description: "Cyber-style with light bloom",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#fef3c7", blackFill: "#a78bfa", glow: "rgba(168,85,247,0.6)", fontWeight: 500 },
  },
  {
    key: "royal",
    label: "Golden Royal",
    description: "Premium gold accents",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#fbbf24", blackFill: "#1f1611", whiteStroke: "rgba(120,80,0,0.7)", fontWeight: 500 },
  },
  {
    key: "monochrome",
    label: "Monochrome",
    description: "Pure black on white",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#e5e5e5", blackFill: "#0a0a0a", fontWeight: 400 },
  },
  {
    key: "wood3d",
    label: "Polished Walnut",
    description: "Hand-carved walnut, lacquered tournament finish",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#f7e2b8", blackFill: "#1a0a04", whiteStroke: "rgba(90,55,20,0.95)", blackStroke: "rgba(255,210,150,0.45)", fontWeight: 600, glow: "rgba(180,110,40,0.5)" },
  },
  {
    key: "fantasy",
    label: "Fantasy",
    description: "Mystical themed pieces with magical aura",
    mode: "unicode",
    glyphs: GLYPHS_STANDARD,
    render: { whiteFill: "#e0f7ff", blackFill: "#2a0a3a", whiteStroke: "rgba(120,200,255,0.9)", blackStroke: "rgba(220,140,255,0.7)", fontWeight: 600, glow: "rgba(160,120,255,0.55)" },
  },
];

const STORAGE_KEY = "chess-settings";
const PIECE_STYLE_EVENT = "masterchess:piecestyle-change";

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

let activePieceStyle: PieceStyle = PIECE_STYLES[0];

export function getActivePieceStyle(): PieceStyle {
  return activePieceStyle;
}

/** Apply a piece style — CSS vars + broadcasts an event so React boards re-render with new glyphs. */
export function applyPieceStyle(styleKey: string) {
  const style = PIECE_STYLES.find(s => s.key === styleKey) || PIECE_STYLES[0];
  activePieceStyle = style;
  const root = document.documentElement;
  root.style.setProperty("--piece-white", style.render.whiteFill);
  root.style.setProperty("--piece-black", style.render.blackFill);
  root.style.setProperty("--piece-white-stroke", style.render.whiteStroke || "transparent");
  root.style.setProperty("--piece-black-stroke", style.render.blackStroke || "transparent");
  root.style.setProperty("--piece-weight", String(style.render.fontWeight || 400));
  root.style.setProperty("--piece-glow", style.render.glow || "transparent");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PIECE_STYLE_EVENT, { detail: style.key }));
  }
}

/** Subscribe to piece-style changes (returns unsubscribe). */
export function onPieceStyleChange(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(PIECE_STYLE_EVENT, listener);
  return () => window.removeEventListener(PIECE_STYLE_EVENT, listener);
}

/** Bootstrap on app start: load saved theme + piece style and apply to :root. */
export function bootstrapVisualSettings() {
  if (typeof window === "undefined") return;
  const s = readSettings();
  if (s.boardTheme) applyBoardTheme(s.boardTheme);
  // Migrate old keys that no longer exist (emoji, animals, letters, etc.) → fall back.
  const validKey = PIECE_STYLES.find(p => p.key === s.pieceStyle)?.key || "merida";
  applyPieceStyle(validKey);
}
