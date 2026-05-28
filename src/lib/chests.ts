/**
 * Reward Chests — XP-gated cosmetic chests that unlock board themes & piece skins.
 * Pure localStorage; no backend required.
 *
 * Soul note from Nikola: "Treasure should feel like treasure. Open it slow,
 * watch the gold spill out. — N."
 */

export type ChestTier = "wood" | "silver" | "gold" | "diamond";

export interface ChestReward {
  kind: "board" | "pieces" | "xp";
  /** matches keys used in user-settings (board theme key / piece set key) */
  key: string;
  label: string;
  /** emoji preview */
  preview: string;
  /** xp granted (only when kind === 'xp') */
  amount?: number;
}

export interface ChestDef {
  tier: ChestTier;
  name: string;
  /** Total XP the player must have to unlock the chest (one-time spend uses 'cost') */
  unlockXP: number;
  /** XP cost to open (deducted from spendable XP counter, not from total) */
  cost: number;
  /** Loot table — one random pick on open. */
  loot: ChestReward[];
  /** Tailwind gradient classes for the visual */
  gradient: string;
  glow: string;
  emoji: string;
  blurb: string;
}

export const CHESTS: ChestDef[] = [
  {
    tier: "wood",
    name: "Wooden Chest",
    unlockXP: 0,
    cost: 100,
    emoji: "📦",
    gradient: "from-amber-900/70 via-amber-700/50 to-amber-900/70",
    glow: "shadow-[0_0_40px_hsl(30,60%,40%,0.45)]",
    blurb: "A humble starter. Cracks open with a satisfying creak.",
    loot: [
      { kind: "board", key: "board_dark_wood", label: "Dark Wood Board", preview: "🪵" },
      { kind: "pieces", key: "merida", label: "Merida Pieces", preview: "♞" },
      { kind: "xp", key: "xp_50", label: "+50 XP", preview: "✨", amount: 50 },
    ],
  },
  {
    tier: "silver",
    name: "Silver Chest",
    unlockXP: 500,
    cost: 350,
    emoji: "🗃️",
    gradient: "from-slate-400/60 via-slate-200/50 to-slate-400/60",
    glow: "shadow-[0_0_50px_hsl(220,15%,75%,0.45)]",
    blurb: "Silver-bound. Smells faintly of old tournament halls.",
    loot: [
      { kind: "board", key: "board_marble", label: "Marble Board", preview: "🏛️" },
      { kind: "board", key: "board_ocean", label: "Ocean Board", preview: "🌊" },
      { kind: "pieces", key: "cburnett", label: "Cburnett Pieces", preview: "♛" },
      { kind: "xp", key: "xp_150", label: "+150 XP", preview: "✨", amount: 150 },
    ],
  },
  {
    tier: "gold",
    name: "Golden Chest",
    unlockXP: 2000,
    cost: 1000,
    emoji: "🏆",
    gradient: "from-yellow-500/70 via-amber-300/60 to-yellow-600/70",
    glow: "shadow-[0_0_70px_hsl(43,90%,55%,0.55)]",
    blurb: "The classic Nikola-special. Heavy. Loud when it opens.",
    loot: [
      { kind: "board", key: "board_galaxy", label: "Galaxy Board", preview: "🌌" },
      { kind: "pieces", key: "cardinal", label: "Cardinal Pieces", preview: "♚" },
      { kind: "pieces", key: "pixel", label: "Pixel Pieces", preview: "👾" },
      { kind: "xp", key: "xp_500", label: "+500 XP", preview: "✨", amount: 500 },
    ],
  },
  {
    tier: "diamond",
    name: "Diamond Chest",
    unlockXP: 8000,
    cost: 3000,
    emoji: "💎",
    gradient: "from-cyan-300/70 via-violet-300/60 to-pink-300/70",
    glow: "shadow-[0_0_90px_hsl(200,90%,70%,0.6)]",
    blurb: "The crown jewel. Reserved for those who really live in the game.",
    loot: [
      { kind: "board", key: "board_royal_purple", label: "Royal Purple Board", preview: "👑" },
      { kind: "pieces", key: "cburnett", label: "Cburnett Pieces", preview: "♛" },
      { kind: "xp", key: "xp_2000", label: "+2000 XP", preview: "✨", amount: 2000 },
    ],
  },
];

const UNLOCK_KEY = "mc:chests:unlocked";
const SPEND_KEY = "mc:chests:xp_spent";
const STREAK_KEY = "mc:chests:open_count";

export function getUnlocked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCK_KEY) || "[]");
  } catch {
    return [];
  }
}

export function isUnlocked(key: string): boolean {
  return getUnlocked().includes(key);
}

function setUnlocked(list: string[]) {
  localStorage.setItem(UNLOCK_KEY, JSON.stringify(Array.from(new Set(list))));
}

export function getSpentXP(): number {
  return Number(localStorage.getItem(SPEND_KEY) || 0);
}
function addSpentXP(n: number) {
  localStorage.setItem(SPEND_KEY, String(getSpentXP() + n));
}

export function getOpenCount(): number {
  return Number(localStorage.getItem(STREAK_KEY) || 0);
}
function bumpOpenCount() {
  localStorage.setItem(STREAK_KEY, String(getOpenCount() + 1));
}

/** Spendable XP = total XP earned - already spent on chests. */
export function getSpendableXP(totalXP: number): number {
  return Math.max(0, totalXP - getSpentXP());
}

export interface OpenResult {
  reward: ChestReward;
  isNew: boolean;
}

export function openChest(chest: ChestDef, totalXP: number): OpenResult | { error: string } {
  if (totalXP < chest.unlockXP) {
    return { error: `Need ${chest.unlockXP} total XP to unlock this chest.` };
  }
  if (getSpendableXP(totalXP) < chest.cost) {
    return { error: `Need ${chest.cost} spendable XP. You have ${getSpendableXP(totalXP)}.` };
  }
  // Weighted random — bias toward cosmetics over plain XP
  const weighted: ChestReward[] = [];
  chest.loot.forEach((r) => {
    const w = r.kind === "xp" ? 1 : 2;
    for (let i = 0; i < w; i++) weighted.push(r);
  });
  const reward = weighted[Math.floor(Math.random() * weighted.length)];
  addSpentXP(chest.cost);
  bumpOpenCount();
  const isNew = reward.kind !== "xp" && !isUnlocked(reward.key);
  if (reward.kind !== "xp") {
    setUnlocked([...getUnlocked(), reward.key]);
  }
  return { reward, isNew };
}
