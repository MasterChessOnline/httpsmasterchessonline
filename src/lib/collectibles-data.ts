export interface Collectible {
  key: string;
  name: string;
  type: "board" | "pieces" | "avatar";
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  preview: string; // emoji or icon key
}

export const COLLECTIBLES: Collectible[] = [
  // Board themes
  { key: "board_marble", name: "Marble Board", type: "board", description: "Elegant white marble board with grey veins.", rarity: "rare", preview: "🏛️" },
  { key: "board_dark_wood", name: "Dark Wood", type: "board", description: "Rich mahogany wood finish.", rarity: "common", preview: "🪵" },
  { key: "board_galaxy", name: "Galaxy Board", type: "board", description: "Play among the stars with this cosmic board.", rarity: "epic", preview: "🌌" },
  { key: "board_ocean", name: "Ocean Board", type: "board", description: "Deep blue ocean-themed board.", rarity: "rare", preview: "🌊" },
  { key: "board_royal_purple", name: "Royal Purple", type: "board", description: "A regal purple and gold board fit for royalty.", rarity: "legendary", preview: "👑" },

  // Piece sets
  { key: "pieces_crystal", name: "Crystal Pieces", type: "pieces", description: "Translucent crystal chess pieces.", rarity: "rare", preview: "💎" },
  { key: "pieces_neon", name: "Neon Glow", type: "pieces", description: "Vibrant neon-lit chess pieces.", rarity: "epic", preview: "✨" },
  { key: "pieces_diamond", name: "Diamond Set", type: "pieces", description: "The ultimate diamond-encrusted piece set.", rarity: "legendary", preview: "💠" },
  { key: "pieces_gold", name: "Golden Set", type: "pieces", description: "Shimmering gold tournament pieces.", rarity: "legendary", preview: "🥇" },

  // Avatars
  { key: "avatar_golden_knight", name: "Golden Knight", type: "avatar", description: "A majestic golden knight avatar.", rarity: "common", preview: "♞" },
  { key: "avatar_fire_king", name: "Fire King", type: "avatar", description: "A blazing fire king avatar.", rarity: "epic", preview: "🔥" },
  { key: "avatar_phoenix", name: "Phoenix", type: "avatar", description: "Rise from the ashes with this legendary avatar.", rarity: "legendary", preview: "🦅" },
];

export const RARITY_COLORS: Record<string, string> = {
  common: "text-muted-foreground border-muted",
  rare: "text-blue-400 border-blue-400/30",
  epic: "text-purple-400 border-purple-400/30",
  legendary: "text-primary border-primary/30",
};
