/**
 * Maps shop-item keys → an EXACT visual representation of what gets
 * unlocked. Used so Shop & Chest cards render the real board palette
 * or the real piece artwork, never a placeholder emoji.
 */
import { BOARD_THEMES, PIECE_STYLES, type BoardTheme, type PieceStyle } from "@/lib/board-themes";

export type ShopPreview =
  | { kind: "board"; light: string; dark: string; themeKey?: string }
  | { kind: "pieces"; style: PieceStyle }
  | { kind: "emoji"; emoji: string };

// Shop-key → existing BOARD_THEMES key (for items that already map to a real theme)
const SHOP_BOARD_ALIAS: Record<string, string> = {
  "board:classic_wood": "classic",
  "board:marble_royal": "marble",
  "board:ice_crystal": "ice",
  "board:lava_volcano": "ruby",
  "board:neon_cyber": "neon",
  "board:galaxy_space": "midnight",
  "board:cyberpunk_city": "carbon",
  "board:master_elite": "gold",
  "board:universe_animated": "sapphire",
  "board:graffiti_1": "coral",
  "board:graffiti_2": "rose",
  "board:urban_street": "olive",
  "board:neon_graffiti": "neon",
  "board:street_art_animated": "sunset",
  // New legendary elemental boards
  "board:lava_forge": "lava",
  "board:deep_aquatic": "aqua",
  "board:aurora_borealis": "aurora",
  "board:obsidian_gold": "obsidian",
  "board:magma_glass": "magma",
  "board:cosmic_nebula": "nebula",
  "board:lava_river": "lava_alt",
  "board:tidal_wave": "aqua_alt",
  "board:polar_aurora": "aurora_alt",
  "board:andromeda": "nebula_alt",
};

// Exotic palettes invented purely for shop-only boards that don't map cleanly
const CUSTOM_BOARD_PALETTES: Record<string, { light: string; dark: string }> = {
  // none for now — extend if needed
};

// Shop pieces → existing PIECE_STYLES key
const SHOP_PIECE_ALIAS: Record<string, string> = {
  "pieces:bronze": "wood3d",
  "pieces:silver": "minimal",
  "pieces:gold_royal": "royal",
  "pieces:crystal_glow": "glass",
  "pieces:samurai": "bold",
  "pieces:viking": "standard",
  "pieces:dragon": "fantasy",
  "pieces:cyber_neon": "neon",
  "pieces:mythic": "fantasy",
  // New legendary piece sets → distinct elemental styles
  "pieces:inferno": "ember",
  "pieces:abyssal": "aqua",
  "pieces:celestial": "aurora_p",
  "pieces:obsidian": "obsidian_p",
  "pieces:ember": "ember",
  "pieces:aqua_crystal": "aqua",
  "pieces:aurora_set": "aurora_p",
  "pieces:blood_ruby": "blood_ruby",
  "pieces:jade": "jade",
  "pieces:frost": "frost",
  "pieces:sakura": "sakura",
};

export function getShopPreview(key: string, fallbackEmoji: string): ShopPreview {
  // BOARDS
  const aliasBoard = SHOP_BOARD_ALIAS[key];
  if (aliasBoard) {
    const t = BOARD_THEMES.find(b => b.key === aliasBoard);
    if (t) return { kind: "board", light: t.light, dark: t.dark, themeKey: t.key };
  }
  if (CUSTOM_BOARD_PALETTES[key]) {
    return { kind: "board", ...CUSTOM_BOARD_PALETTES[key] };
  }
  // PIECES
  const aliasPiece = SHOP_PIECE_ALIAS[key];
  if (aliasPiece) {
    const p = PIECE_STYLES.find(ps => ps.key === aliasPiece);
    if (p) return { kind: "pieces", style: p };
  }
  return { kind: "emoji", emoji: fallbackEmoji };
}

/** Look up by board theme key (for chests that store registry keys directly). */
export function getBoardTheme(themeKey: string): BoardTheme | undefined {
  return BOARD_THEMES.find(b => b.key === themeKey);
}
export function getPieceStyle(styleKey: string): PieceStyle | undefined {
  return PIECE_STYLES.find(p => p.key === styleKey);
}
