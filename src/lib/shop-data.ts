// Shop catalog — every item: key, name, type, price, rarity, preview.
// Keys for boards/pieces are reused in user-settings to apply the cosmetic.

export type ShopItemType = "board" | "pieces" | "effect" | "frame" | "avatar" | "title" | "badge";
export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface ShopItem {
  key: string;
  name: string;
  type: ShopItemType;
  price: number;
  rarity: Rarity;
  preview: string; // emoji / glyph
  blurb?: string;
}

export const RARITY_META: Record<Rarity, { label: string; color: string; ring: string; glow: string }> = {
  common: {
    label: "Common",
    color: "text-slate-300",
    ring: "ring-slate-400/30",
    glow: "shadow-[0_0_25px_hsl(220,15%,60%,0.25)]",
  },
  rare: {
    label: "Rare",
    color: "text-sky-300",
    ring: "ring-sky-400/40",
    glow: "shadow-[0_0_30px_hsl(200,90%,60%,0.35)]",
  },
  epic: {
    label: "Epic",
    color: "text-violet-300",
    ring: "ring-violet-400/40",
    glow: "shadow-[0_0_40px_hsl(270,90%,65%,0.45)]",
  },
  legendary: {
    label: "Legendary",
    color: "text-amber-300",
    ring: "ring-amber-400/50",
    glow: "shadow-[0_0_60px_hsl(43,95%,60%,0.55)]",
  },
};

export const SHOP_ITEMS: ShopItem[] = [
  // ───── BOARDS ─────
  { key: "board:classic_wood", name: "Classic Wood Board", type: "board", price: 500, rarity: "common", preview: "🪵", blurb: "Warm tournament wood." },
  { key: "board:marble_royal", name: "Marble Royal Board", type: "board", price: 800, rarity: "common", preview: "🏛️", blurb: "Polished white veins." },
  { key: "board:ice_crystal", name: "Ice Crystal Board", type: "board", price: 1200, rarity: "rare", preview: "🧊", blurb: "Glacier-blue translucent." },
  { key: "board:lava_volcano", name: "Lava Volcano Board", type: "board", price: 1500, rarity: "rare", preview: "🌋", blurb: "Molten edges." },
  { key: "board:neon_cyber", name: "Neon Cyber Board", type: "board", price: 2000, rarity: "epic", preview: "💜", blurb: "Synthwave grid." },
  { key: "board:galaxy_space", name: "Galaxy Space Board", type: "board", price: 2800, rarity: "epic", preview: "🌌", blurb: "Play among stars." },
  { key: "board:cyberpunk_city", name: "Cyberpunk City Board", type: "board", price: 3200, rarity: "epic", preview: "🏙️", blurb: "Night-city skyline." },
  { key: "board:master_elite", name: "Master Elite 3D Board", type: "board", price: 3800, rarity: "legendary", preview: "👑", blurb: "Tournament prestige." },
  { key: "board:universe_animated", name: "Animated Universe Board", type: "board", price: 5000, rarity: "legendary", preview: "✨", blurb: "Living nebula." },

  // ── Legendary Elemental Boards ──
  { key: "board:lava_forge", name: "Lava Forge Board", type: "board", price: 4200, rarity: "legendary", preview: "🔥", blurb: "Molten ember & obsidian." },
  { key: "board:deep_aquatic", name: "Deep Aquatic Board", type: "board", price: 4200, rarity: "legendary", preview: "🌊", blurb: "Sunken reef under turquoise glow." },
  { key: "board:aurora_borealis", name: "Aurora Borealis Board", type: "board", price: 4500, rarity: "legendary", preview: "🌌", blurb: "Polar lights frozen on ice." },
  { key: "board:obsidian_gold", name: "Obsidian Gold Board", type: "board", price: 4800, rarity: "legendary", preview: "🖤", blurb: "Pure black with gold inlay." },
  { key: "board:magma_glass", name: "Magma Glass Board", type: "board", price: 5200, rarity: "legendary", preview: "🌋", blurb: "Cooled lava sealed under crystal." },
  { key: "board:cosmic_nebula", name: "Cosmic Nebula Board", type: "board", price: 5500, rarity: "legendary", preview: "💫", blurb: "Pink-violet starfield." },
  { key: "board:lava_river", name: "Lava River Board", type: "board", price: 5200, rarity: "legendary", preview: "🔥", blurb: "Rivers of liquid fire." },
  { key: "board:tidal_wave", name: "Tidal Wave Board", type: "board", price: 5200, rarity: "legendary", preview: "🌊", blurb: "Shimmering tropical lagoon." },
  { key: "board:polar_aurora", name: "Polar Aurora Board", type: "board", price: 5400, rarity: "legendary", preview: "🌈", blurb: "Mint & violet sky-veils." },
  { key: "board:andromeda", name: "Andromeda Board", type: "board", price: 5800, rarity: "legendary", preview: "🌠", blurb: "Cyan & magenta star-dust." },

  // ───── PIECES ─────
  { key: "pieces:bronze", name: "Bronze Set", type: "pieces", price: 400, rarity: "common", preview: "🥉" },
  { key: "pieces:silver", name: "Silver Set", type: "pieces", price: 700, rarity: "common", preview: "🥈" },
  { key: "pieces:gold_royal", name: "Gold Royal Set", type: "pieces", price: 1200, rarity: "rare", preview: "🥇" },
  { key: "pieces:crystal_glow", name: "Crystal Glow Set", type: "pieces", price: 1800, rarity: "rare", preview: "💎" },
  { key: "pieces:samurai", name: "Samurai Warrior Set", type: "pieces", price: 2400, rarity: "epic", preview: "🗡️" },
  { key: "pieces:viking", name: "Viking Battle Set", type: "pieces", price: 2800, rarity: "epic", preview: "🪓" },
  { key: "pieces:dragon", name: "Dragon Flame Set", type: "pieces", price: 3200, rarity: "epic", preview: "🐉" },
  { key: "pieces:cyber_neon", name: "Cyber Neon Set", type: "pieces", price: 3800, rarity: "legendary", preview: "🤖" },
  { key: "pieces:mythic", name: "Mythic Legendary Set", type: "pieces", price: 5000, rarity: "legendary", preview: "🦄" },

  // ── Legendary Piece Sets ──
  { key: "pieces:inferno", name: "Inferno Pieces", type: "pieces", price: 4200, rarity: "legendary", preview: "🔥", blurb: "Forged in lava." },
  { key: "pieces:abyssal", name: "Abyssal Pieces", type: "pieces", price: 4200, rarity: "legendary", preview: "🌊", blurb: "Carved from deep coral." },
  { key: "pieces:celestial", name: "Celestial Pieces", type: "pieces", price: 4500, rarity: "legendary", preview: "🌠", blurb: "Star-forged royalty." },
  { key: "pieces:obsidian", name: "Obsidian Pieces", type: "pieces", price: 4800, rarity: "legendary", preview: "🖤", blurb: "Black volcanic glass." },
  // ── New legendary elemental piece sets ──
  { key: "pieces:ember", name: "Ember Pieces", type: "pieces", price: 4000, rarity: "legendary", preview: "🟥", blurb: "Glowing coals — radiant orange." },
  { key: "pieces:aqua_crystal", name: "Aqua Crystal Pieces", type: "pieces", price: 4000, rarity: "legendary", preview: "🟦", blurb: "Translucent ocean glass." },
  { key: "pieces:aurora_set", name: "Aurora Pieces", type: "pieces", price: 4400, rarity: "legendary", preview: "🟩", blurb: "Polar mint-violet shimmer." },
  { key: "pieces:blood_ruby", name: "Blood Ruby Pieces", type: "pieces", price: 4600, rarity: "legendary", preview: "❤️", blurb: "Deep red gemstone facets." },
  { key: "pieces:jade", name: "Imperial Jade Pieces", type: "pieces", price: 4600, rarity: "legendary", preview: "🟢", blurb: "Carved jade & imperial gold." },
  { key: "pieces:frost", name: "Frost Bite Pieces", type: "pieces", price: 4400, rarity: "legendary", preview: "❄️", blurb: "Pure ice with icy glow." },
  { key: "pieces:sakura", name: "Sakura Pieces", type: "pieces", price: 4400, rarity: "legendary", preview: "🌸", blurb: "Cherry blossom on dark stone." },

  // ───── GRAFFITI / STREET ─────
  { key: "board:graffiti_1", name: "Graffiti Set #1", type: "board", price: 1500, rarity: "rare", preview: "🎨" },
  { key: "board:graffiti_2", name: "Graffiti Set #2", type: "board", price: 2000, rarity: "rare", preview: "🖌️" },
  { key: "board:urban_street", name: "Urban Street Board", type: "board", price: 2800, rarity: "epic", preview: "🏚️" },
  { key: "board:neon_graffiti", name: "Neon Graffiti Board", type: "board", price: 3500, rarity: "epic", preview: "🌃" },
  { key: "board:street_art_animated", name: "Animated Street Art Pack", type: "board", price: 5000, rarity: "legendary", preview: "💫" },

  // ───── EFFECTS ─────
  { key: "effect:fire", name: "Fire Effect", type: "effect", price: 1000, rarity: "rare", preview: "🔥" },
  { key: "effect:ice", name: "Ice Effect", type: "effect", price: 1000, rarity: "rare", preview: "❄️" },
  { key: "effect:lightning", name: "Lightning Effect", type: "effect", price: 1500, rarity: "rare", preview: "⚡" },
  { key: "effect:galaxy_aura", name: "Galaxy Aura Effect", type: "effect", price: 2200, rarity: "epic", preview: "🌠" },
  { key: "effect:neon_glow", name: "Neon Glow Effect", type: "effect", price: 2800, rarity: "epic", preview: "💡" },
  { key: "effect:legendary_aura", name: "Legendary Aura Effect", type: "effect", price: 4500, rarity: "legendary", preview: "👼" },

  // ───── FRAMES ─────
  { key: "frame:basic", name: "Basic Frame", type: "frame", price: 300, rarity: "common", preview: "⬜" },
  { key: "frame:silver", name: "Silver Frame", type: "frame", price: 600, rarity: "common", preview: "▫️" },
  { key: "frame:gold", name: "Gold Frame", type: "frame", price: 1000, rarity: "rare", preview: "🟨" },
  { key: "frame:diamond", name: "Diamond Frame", type: "frame", price: 1800, rarity: "epic", preview: "💠" },
  { key: "frame:animated", name: "Animated Frame", type: "frame", price: 3000, rarity: "epic", preview: "🔄" },
  { key: "frame:legendary", name: "Legendary Frame", type: "frame", price: 5000, rarity: "legendary", preview: "🏆" },

  // ───── AVATARS ─────
  { key: "avatar:golden_knight", name: "Golden Knight", type: "avatar", price: 600, rarity: "rare", preview: "♞" },
  { key: "avatar:fire_king", name: "Fire King", type: "avatar", price: 1500, rarity: "epic", preview: "🔥" },
  { key: "avatar:phoenix", name: "Phoenix", type: "avatar", price: 2000, rarity: "legendary", preview: "🦅" },

  // ───── TITLES ─────
  { key: "title:rising_star", name: "Rising Star Title", type: "title", price: 500, rarity: "common", preview: "⭐" },
  { key: "title:tactician", name: "Tactician Title", type: "title", price: 900, rarity: "rare", preview: "♟" },
  { key: "title:grand_legend", name: "Grand Legend Title", type: "title", price: 1500, rarity: "legendary", preview: "👑" },

  // ───── BADGES ─────
  { key: "badge:first_blood", name: "First Blood Badge", type: "badge", price: 100, rarity: "common", preview: "🩸" },
  { key: "badge:streak_master", name: "Streak Master Badge", type: "badge", price: 500, rarity: "rare", preview: "🔥" },
  { key: "badge:champion", name: "Champion Badge", type: "badge", price: 1000, rarity: "epic", preview: "🏅" },
];

export const SHOP_CATEGORIES: { key: ShopItemType | "all"; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "✨" },
  { key: "board", label: "Boards", icon: "🪵" },
  { key: "pieces", label: "Pieces", icon: "♟" },
  { key: "effect", label: "Effects", icon: "🔥" },
  { key: "frame", label: "Frames", icon: "🖼️" },
  { key: "avatar", label: "Avatars", icon: "👤" },
  { key: "title", label: "Titles", icon: "📛" },
  { key: "badge", label: "Badges", icon: "🏅" },
];

export function getItem(key: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.key === key);
}
