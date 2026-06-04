// Nikola Sakotić — per-move commentary.
// He's the creator's AI clone, so he talks like a confident, friendly coach
// who knows every line. Triggered after each of his moves in Play.tsx.

import type { Chess } from "chess.js";

interface Ctx {
  ply: number;           // total half-moves played so far (including this one)
  fromBook: boolean;
  cpLoss: number;
  isCheck: boolean;
  isCheckmate: boolean;
  captured: boolean;
  san: string;
}

const OPENING_LINES = [
  "Theory. I've prepped this line for years.",
  "Main line — straight out of the book.",
  "Standard development. Nothing fancy yet.",
  "Classical setup. Solid as it gets.",
];

const EARLY_LINES = [
  "Developing with purpose.",
  "Eyes on the center.",
  "Setting up the structure.",
  "Patience. The plan is coming.",
];

const CAPTURE_LINES = [
  "Material talks. I'll take it.",
  "Clean exchange — my pieces are better placed.",
  "Trade accepted. The endgame favors me.",
];

const CHECK_LINES = [
  "Check. Forced response.",
  "Check — I already calculated your reply.",
  "Tempo move. Watch the clock.",
];

const MATE_LINES = [
  "Mate. GG. 👑",
  "Checkmate. As foreseen.",
  "And that's the game. Respect for fighting.",
];

const MIDGAME_LINES = [
  "I see the plan three moves ahead.",
  "This is where most players crack.",
  "Quiet move — building pressure.",
  "Engine eval says I'm winning.",
];

const ENDGAME_LINES = [
  "Endgame technique. Pure precision now.",
  "King activity wins endgames.",
  "Converting the advantage.",
];

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Returns a commentary string for Nikola's just-played move, or null when
 * he should stay silent (we don't want him talking every single turn).
 */
export function nikolaCommentary(ctx: Ctx): string | null {
  if (ctx.isCheckmate) return pick(MATE_LINES);
  if (ctx.isCheck && Math.random() < 0.7) return pick(CHECK_LINES);
  if (ctx.fromBook && ctx.ply <= 12 && Math.random() < 0.55) return pick(OPENING_LINES);
  if (ctx.ply <= 10 && Math.random() < 0.35) return pick(EARLY_LINES);
  if (ctx.captured && Math.random() < 0.45) return pick(CAPTURE_LINES);
  if (ctx.ply >= 40 && Math.random() < 0.4) return pick(ENDGAME_LINES);
  if (ctx.ply > 12 && ctx.ply < 40 && Math.random() < 0.22) return pick(MIDGAME_LINES);
  return null;
}
