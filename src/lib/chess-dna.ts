// Chess DNA: derive playstyle, mistake patterns, and behavioral insights
// from a player's recent online games. Pure analytics, no engine required.

import type { Chess } from "chess.js";

export type Playstyle = "Aggressive" | "Positional" | "Tactical" | "Defensive" | "Balanced";

export interface DNAGame {
  id: string;
  white_player_id: string;
  black_player_id: string;
  result: string | null;
  pgn: string | null;
  time_control_label: string | null;
  white_time?: number;
  black_time?: number;
  created_at: string;
}

export interface OpeningStat {
  name: string;
  games: number;
  wins: number;
  winRate: number;
}

export interface ChessDNA {
  style: Playstyle;
  styleConfidence: number; // 0..1
  totalGames: number;
  avgMovesPerGame: number;
  shortGameRate: number; // % of games ending under 25 moves
  longGameRate: number; // % over 50 moves
  openings: OpeningStat[];
  insights: string[];
  // Behavioral metrics
  timePressureLossRate: number; // % of losses where final time was very low (proxy for time trouble)
  blunderProxyRate: number; // % of losses ending under 25 moves (early collapses)
}

// Very lightweight opening detection from PGN — looks at SAN of first 4 plies.
const OPENING_SIGNATURES: { signature: string[]; name: string }[] = [
  { signature: ["e4", "e5", "Nf3", "Nc6"], name: "Open Game" },
  { signature: ["e4", "c5"], name: "Sicilian Defense" },
  { signature: ["e4", "e6"], name: "French Defense" },
  { signature: ["e4", "c6"], name: "Caro-Kann" },
  { signature: ["e4", "d5"], name: "Scandinavian" },
  { signature: ["e4", "d6"], name: "Pirc / Modern" },
  { signature: ["e4", "Nf6"], name: "Alekhine's Defense" },
  { signature: ["d4", "d5"], name: "Queen's Pawn" },
  { signature: ["d4", "Nf6"], name: "Indian Defense" },
  { signature: ["d4", "f5"], name: "Dutch Defense" },
  { signature: ["c4"], name: "English Opening" },
  { signature: ["Nf3"], name: "Réti / Flank" },
  { signature: ["e4"], name: "King's Pawn" },
  { signature: ["d4"], name: "Queen's Pawn" },
];

function detectOpening(sanMoves: string[]): string {
  for (const { signature, name } of OPENING_SIGNATURES) {
    if (signature.every((m, i) => sanMoves[i] === m)) return name;
  }
  return "Other";
}

function parsePgnMoves(pgn: string | null): string[] {
  if (!pgn) return [];
  // Strip headers and comments, keep SAN tokens.
  const body = pgn.replace(/\[[^\]]*\]/g, "").replace(/\{[^}]*\}/g, "");
  const tokens = body.split(/\s+/).filter(Boolean);
  return tokens.filter(t => !/^\d+\.+$/.test(t) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
}

export function computeChessDNA(userId: string, games: DNAGame[]): ChessDNA {
  if (games.length === 0) {
    return {
      style: "Balanced",
      styleConfidence: 0,
      totalGames: 0,
      avgMovesPerGame: 0,
      shortGameRate: 0,
      longGameRate: 0,
      openings: [],
      insights: ["Play more rated games to unlock your Chess DNA profile."],
      timePressureLossRate: 0,
      blunderProxyRate: 0,
    };
  }

  let totalMoves = 0;
  let shortGames = 0;
  let longGames = 0;
  let captures = 0;
  let checks = 0;
  let pawnPushes = 0;
  let castleCount = 0;
  let totalMovesScanned = 0;
  let lossesUnder25 = 0;
  let totalLosses = 0;
  let lowTimeLosses = 0;

  const openingMap: Record<string, { games: number; wins: number }> = {};

  for (const g of games) {
    const moves = parsePgnMoves(g.pgn);
    totalMoves += moves.length;
    if (moves.length > 0 && moves.length < 25) shortGames++;
    if (moves.length > 50) longGames++;

    const isWhite = g.white_player_id === userId;
    const won = (isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1");
    const lost = (isWhite && g.result === "0-1") || (!isWhite && g.result === "1-0");

    if (lost) {
      totalLosses++;
      if (moves.length > 0 && moves.length < 25) lossesUnder25++;
      const myFinalTime = isWhite ? g.white_time : g.black_time;
      if (myFinalTime !== undefined && myFinalTime <= 5) lowTimeLosses++;
    }

    // Style heuristics — only scan our side's moves
    for (let i = 0; i < moves.length; i++) {
      const isOurMove = isWhite ? i % 2 === 0 : i % 2 === 1;
      if (!isOurMove) continue;
      const m = moves[i];
      totalMovesScanned++;
      if (m.includes("x")) captures++;
      if (m.includes("+") || m.includes("#")) checks++;
      if (m === "O-O" || m === "O-O-O") castleCount++;
      // Pawn push = SAN starts with file letter only (no piece letter)
      if (/^[a-h]/.test(m) && !/^[a-h][x]/.test(m)) pawnPushes++;
    }

    // Opening detection
    const opening = detectOpening(moves.slice(0, 4));
    if (!openingMap[opening]) openingMap[opening] = { games: 0, wins: 0 };
    openingMap[opening].games++;
    if (won) openingMap[opening].wins++;
  }

  const captureRate = totalMovesScanned > 0 ? captures / totalMovesScanned : 0;
  const checkRate = totalMovesScanned > 0 ? checks / totalMovesScanned : 0;
  const pawnRate = totalMovesScanned > 0 ? pawnPushes / totalMovesScanned : 0;

  // Determine style
  let style: Playstyle = "Balanced";
  let styleConfidence = 0.4;
  if (checkRate > 0.08 && captureRate > 0.18) {
    style = "Tactical";
    styleConfidence = Math.min(1, (checkRate + captureRate) * 3);
  } else if (captureRate > 0.18 && shortGames / games.length > 0.35) {
    style = "Aggressive";
    styleConfidence = Math.min(1, captureRate * 4);
  } else if (longGames / games.length > 0.4 && pawnRate > 0.35) {
    style = "Positional";
    styleConfidence = Math.min(1, (longGames / games.length) + 0.3);
  } else if (longGames / games.length > 0.3 && captureRate < 0.12) {
    style = "Defensive";
    styleConfidence = 0.6;
  }

  const openings = Object.entries(openingMap)
    .map(([name, s]) => ({
      name,
      games: s.games,
      wins: s.wins,
      winRate: s.games > 0 ? Math.round((s.wins / s.games) * 100) : 0,
    }))
    .sort((a, b) => b.games - a.games)
    .slice(0, 6);

  const blunderProxyRate = totalLosses > 0 ? Math.round((lossesUnder25 / totalLosses) * 100) : 0;
  const timePressureLossRate = totalLosses > 0 ? Math.round((lowTimeLosses / totalLosses) * 100) : 0;
  const shortGameRate = Math.round((shortGames / games.length) * 100);
  const longGameRate = Math.round((longGames / games.length) * 100);

  // Insights
  const insights: string[] = [];
  if (blunderProxyRate >= 40) insights.push(`${blunderProxyRate}% of your losses end before move 25 — early blunders are your #1 leak.`);
  if (timePressureLossRate >= 30) insights.push(`You play too fast in critical positions — ${timePressureLossRate}% of losses end with almost no clock.`);
  if (style === "Aggressive") insights.push("You favor sharp, attacking play. Studying classic attacking games (Tal, Kasparov) will sharpen your edge.");
  if (style === "Positional") insights.push("You excel at long, strategic games. Endgame study will translate your advantages into points.");
  if (style === "Tactical") insights.push("You spot tactics well. Work on quiet positional moves so you don't go in circles when there's no combination.");
  if (style === "Defensive") insights.push("You're hard to break, but missed opportunities cost points. Train 'Convert Winning Position' to capitalize.");
  const worstOpening = openings.find(o => o.games >= 3 && o.winRate < 30);
  if (worstOpening) insights.push(`Your weakest opening: ${worstOpening.name} (${worstOpening.winRate}% over ${worstOpening.games} games). Consider switching or studying typical plans.`);
  const bestOpening = openings.find(o => o.games >= 3 && o.winRate >= 60);
  if (bestOpening) insights.push(`Your strongest weapon: ${bestOpening.name} (${bestOpening.winRate}%). Keep playing it.`);
  if (insights.length === 0) insights.push("Your performance is balanced. Keep playing rated games to surface patterns.");

  return {
    style,
    styleConfidence,
    totalGames: games.length,
    avgMovesPerGame: Math.round(totalMoves / games.length),
    shortGameRate,
    longGameRate,
    openings,
    insights,
    timePressureLossRate,
    blunderProxyRate,
  };
}
