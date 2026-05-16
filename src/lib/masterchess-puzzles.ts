// MasterChess puzzle loader. Loads /public/data/masterchess-puzzles.json — a
// curated, Stockfish-verified pool. 100% local: no external API calls.
// Exposes the same `loadPuzzles()` + `PuzzlePosition` types that Training and
// DailyChallenge consume, plus a tiered picker for daily mate puzzles.

import { Chess } from "chess.js";
import type { TrainingMode, TrainingPosition } from "./training-positions";

interface RawPuzzle {
  id: string;
  fen: string;
  setup: string;
  solution: string[];
  rating: number;
  themes: string;
  mode: TrainingMode;
  difficulty: "beginner" | "intermediate" | "advanced";
  bucket: string;
}

export interface PuzzlePosition extends TrainingPosition {
  /** Full move sequence in UCI starting from `fen` (after setup). Even indices = user moves. */
  solutionUci: string[];
  /** Raw difficulty rating from the curated pool. */
  rating: number;
  /** Raw theme string (used for tier filtering). */
  themes: string;
}

let cache: PuzzlePosition[] | null = null;
let inflight: Promise<PuzzlePosition[]> | null = null;

function themeLabel(themes: string): string {
  const t = themes.toLowerCase();
  if (t.includes("matein1")) return "Mate in 1";
  if (t.includes("matein2")) return "Mate in 2";
  if (t.includes("matein3")) return "Mate in 3";
  if (t.includes("matein4")) return "Mate in 4";
  if (t.includes("matein5")) return "Mate in 5";
  if (t.includes("mate")) return "Forced mate";
  if (t.includes("fork")) return "Tactical fork";
  if (t.includes("pin")) return "Pin tactic";
  if (t.includes("skewer")) return "Skewer";
  if (t.includes("discoveredattack")) return "Discovered attack";
  if (t.includes("sacrifice")) return "Sacrifice for advantage";
  if (t.includes("endgame")) return "Endgame technique";
  if (t.includes("middlegame")) return "Middlegame plan";
  if (t.includes("crushing")) return "Crushing blow";
  return "Tactical puzzle";
}

function explain(themes: string, rating: number): string {
  const t = themes.toLowerCase();
  if (t.includes("mate")) return `Forced mating sequence — every alternative loses by force. Verified at ${rating} difficulty. Play it through to checkmate.`;
  if (t.includes("fork")) return `Classic fork: one piece simultaneously attacks two enemy targets, winning material.`;
  if (t.includes("pin") || t.includes("skewer")) return `A pinning/skewering motif — the back piece can't move without losing more material.`;
  if (t.includes("sacrifice") || t.includes("attraction")) return `A precise sacrifice that leads to decisive advantage.`;
  if (t.includes("endgame")) return `Correct endgame technique. The other moves let the opponent hold or even escape.`;
  return `Best move per engine. Other moves either lose material or miss the strongest continuation.`;
}

function whyWrong(themes: string): string {
  const t = themes.toLowerCase();
  if (t.includes("mate")) return `Your move missed the forced mating line. Look for checks first — every check the opponent can't escape brings you closer to mate.`;
  if (t.includes("endgame")) return `In endgames, precision matters: every tempo counts. The wrong square lets the opponent activate counterplay.`;
  return `Engine prefers a different move — usually one that wins more material, gives a stronger attack, or avoids a hidden tactic.`;
}

export async function loadPuzzles(): Promise<PuzzlePosition[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await fetch("/data/masterchess-puzzles.json");
    const raw: RawPuzzle[] = await res.json();

    const out: PuzzlePosition[] = [];
    for (const p of raw) {
      try {
        const c = new Chess(p.fen);
        const setupMove = c.move({
          from: p.setup.slice(0, 2),
          to: p.setup.slice(2, 4),
          promotion: p.setup.length > 4 ? (p.setup[4] as "q" | "r" | "b" | "n") : undefined,
        });
        if (!setupMove) continue;
        if (!p.solution || p.solution.length === 0) continue;
        // MasterChess-branded id (strip any third-party prefix from the raw file)
        const id = p.id.startsWith("lichess-") ? p.id.replace(/^lichess-/, "mc-") : `mc-${p.id}`;
        out.push({
          id,
          mode: p.mode,
          fen: c.fen(),
          side: c.turn() as "w" | "b",
          bestMove: p.solution[0],
          acceptable: [p.solution[0]],
          title: themeLabel(p.themes) + ` · ${p.rating}`,
          hint: p.solution[0]
            ? `Look for a strong move involving the piece on ${p.solution[0].slice(0, 2)}.`
            : "Find the strongest move.",
          explanation: explain(p.themes, p.rating),
          whyWrong: whyWrong(p.themes),
          difficulty: p.difficulty,
          solutionUci: p.solution,
          rating: p.rating,
          themes: p.themes,
        });
      } catch {
        // skip invalid
      }
    }
    cache = out;
    return out;
  })();
  return inflight;
}

export function clearPuzzleCache() {
  cache = null;
  inflight = null;
}

/* ------------------------------------------------------------------ */
/*  Daily-tier picker — 4 tiers, deterministic per UTC day            */
/* ------------------------------------------------------------------ */

export type DailyTier = "easy" | "medium" | "hard" | "extreme";

export const DAILY_TIERS: { key: DailyTier; label: string; matesIn: number; xp: number; coins: number; color: string }[] = [
  { key: "easy",    label: "Easy",    matesIn: 1, xp: 25,  coins: 5,  color: "emerald" },
  { key: "medium",  label: "Medium",  matesIn: 2, xp: 60,  coins: 12, color: "sky"     },
  { key: "hard",    label: "Hard",    matesIn: 3, xp: 140, coins: 30, color: "amber"   },
  { key: "extreme", label: "Extreme", matesIn: 4, xp: 320, coins: 75, color: "rose"    },
];

function todayUtcStr(): string {
  return new Date().toISOString().split("T")[0];
}

function dayHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Returns one puzzle per tier for today, deterministic per UTC day. */
export async function getDailyTierPuzzles(): Promise<Record<DailyTier, PuzzlePosition | null>> {
  const all = await loadPuzzles();
  const day = todayUtcStr();
  const out: Record<DailyTier, PuzzlePosition | null> = {
    easy: null, medium: null, hard: null, extreme: null,
  };
  for (const tier of DAILY_TIERS) {
    const pool = all.filter((p) =>
      p.themes.toLowerCase().includes(`matein${tier.matesIn}`)
    );
    if (pool.length === 0) continue;
    const idx = dayHash(`${day}-${tier.key}`) % pool.length;
    out[tier.key] = pool[idx];
  }
  return out;
}
