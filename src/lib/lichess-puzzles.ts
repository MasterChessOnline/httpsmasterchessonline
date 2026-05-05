// Loader + types for the 150 Stockfish-vetted Lichess puzzles in /public/data/lichess-puzzles.json.
// Each puzzle stores the FEN BEFORE the opponent's setup move, then a UCI solution sequence.
// We auto-play the setup move so the user always has the side-to-move.

import { Chess } from "chess.js";
import type { TrainingMode, TrainingPosition } from "./training-positions";

interface RawLichessPuzzle {
  id: string;
  fen: string;
  setup: string;       // UCI of opponent's move that creates the puzzle
  solution: string[];  // UCI sequence: [user move, opp reply, user move, ...]
  rating: number;
  themes: string;
  mode: TrainingMode;
  difficulty: "beginner" | "intermediate" | "advanced";
  bucket: string;
}

let cache: TrainingPosition[] | null = null;
let inflight: Promise<TrainingPosition[]> | null = null;

function themeLabel(themes: string): string {
  const t = themes.toLowerCase();
  if (t.includes("matein1")) return "Mate in 1";
  if (t.includes("matein2")) return "Mate in 2";
  if (t.includes("matein3")) return "Mate in 3";
  if (t.includes("mateinx") || t.includes("mate")) return "Forced mate";
  if (t.includes("fork")) return "Tactical fork";
  if (t.includes("pin")) return "Pin tactic";
  if (t.includes("skewer")) return "Skewer";
  if (t.includes("discoveredattack")) return "Discovered attack";
  if (t.includes("sacrifice")) return "Sacrifice for advantage";
  if (t.includes("endgame")) return "Endgame technique";
  if (t.includes("middlegame")) return "Middlegame plan";
  if (t.includes("crushing")) return "Crushing blow";
  return "Stockfish puzzle";
}

function explain(themes: string, rating: number): string {
  const t = themes.toLowerCase();
  if (t.includes("mate")) return `Forced mating sequence — every alternative loses by force. Verified by Stockfish at ${rating} difficulty.`;
  if (t.includes("fork")) return `Classic fork: one piece simultaneously attacks two enemy targets, winning material.`;
  if (t.includes("pin") || t.includes("skewer")) return `A pinning/skewering motif — the back piece can't move without losing more material.`;
  if (t.includes("sacrifice") || t.includes("attraction")) return `A precise sacrifice that leads to decisive advantage. Stockfish-verified.`;
  if (t.includes("endgame")) return `Correct endgame technique. The other moves let the opponent hold or even escape.`;
  return `Best move per Stockfish. Other moves either lose material or miss the strongest continuation.`;
}

function whyWrong(themes: string): string {
  const t = themes.toLowerCase();
  if (t.includes("mate")) return `Your move missed the forced mate. Look for checks first — every check the opponent can't escape leads to mate.`;
  if (t.includes("endgame")) return `In endgames, precision matters: every tempo counts. The wrong square lets the opponent activate counterplay.`;
  return `Stockfish prefers a different move — usually one that wins more material, gives a stronger attack, or avoids a hidden tactic.`;
}

export async function loadLichessPuzzles(): Promise<TrainingPosition[]> {
  if (cache) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    const res = await fetch("/data/lichess-puzzles.json");
    const raw: RawLichessPuzzle[] = await res.json();

    const out: TrainingPosition[] = [];
    for (const p of raw) {
      try {
        // Apply the setup move so user starts with the right side to play
        const c = new Chess(p.fen);
        const setupMove = c.move({
          from: p.setup.slice(0, 2),
          to: p.setup.slice(2, 4),
          promotion: p.setup.length > 4 ? (p.setup[4] as "q" | "r" | "b" | "n") : undefined,
        });
        if (!setupMove) continue;
        out.push({
          id: p.id,
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

export function clearLichessPuzzleCache() {
  cache = null;
  inflight = null;
}
