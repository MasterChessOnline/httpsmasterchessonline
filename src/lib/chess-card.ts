// Chess Card analytics — derives a 7-skill profile (0-100 each) from a player's
// online + bot games. Pure analytics — no engine required.
// Categories: Opening • Middlegame • Endgame • Tactics • Positional • Time Management • Consistency

export type SkillKey =
  | "opening"
  | "middlegame"
  | "endgame"
  | "tactics"
  | "positional"
  | "timeManagement"
  | "consistency";

export interface SkillScore {
  key: SkillKey;
  label: string;
  score: number;       // 0-100
  level: string;       // "Beginner" → "Grandmaster"
  description: string; // short tooltip
  icon: string;        // emoji icon
}

export interface ChessCardGame {
  white_player_id: string;
  black_player_id: string;
  result: string | null;
  pgn: string | null;
  time_control_label?: string | null;
  white_time?: number;
  black_time?: number;
  created_at: string;
  source?: "online" | "bot";
  opponent_rating?: number;
}

export interface ChessCardProfile {
  totalGames: number;
  rating: number;
  overallScore: number;
  overallLevel: string;
  skills: SkillScore[];
  summary: string;
  topStrength: SkillKey;
  topWeakness: SkillKey;
}

const LEVELS = [
  { min: 0,  label: "Beginner" },
  { min: 25, label: "Casual" },
  { min: 45, label: "Club Player" },
  { min: 60, label: "Advanced" },
  { min: 75, label: "Expert" },
  { min: 88, label: "Master" },
  { min: 95, label: "Grandmaster" },
];

function levelFor(score: number): string {
  let label = LEVELS[0].label;
  for (const l of LEVELS) if (score >= l.min) label = l.label;
  return label;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function parseSanMoves(pgn: string | null): string[] {
  if (!pgn) return [];
  const body = pgn.replace(/\[[^\]]*\]/g, "").replace(/\{[^}]*\}/g, "");
  const tokens = body.split(/\s+/).filter(Boolean);
  return tokens.filter(t => !/^\d+\.+$/.test(t) && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(t));
}

interface PerGameMetrics {
  total: number;
  ourMoves: number;
  ourCaptures: number;
  ourChecks: number;
  ourPawnPushes: number;
  ourPieceMoves: number;
  ourCenterMoves: number;
  ourCastled: boolean;
  ourPromotions: number;
  outcome: 1 | 0 | 0.5;       // win/loss/draw from player perspective
  totalLen: number;
  finalTime?: number;          // seconds remaining for player at end
  startingTimeSec?: number;
}

const CENTER_FILES = new Set(["c", "d", "e", "f"]);

function parseTimeControl(label?: string | null): number | undefined {
  if (!label) return undefined;
  const m = label.match(/^(\d+)/);
  if (!m) return undefined;
  return parseInt(m[1], 10) * 60;
}

function analyzeGame(userId: string, g: ChessCardGame): PerGameMetrics {
  const isWhite = g.white_player_id === userId;
  const moves = parseSanMoves(g.pgn);
  const m: PerGameMetrics = {
    total: 1,
    ourMoves: 0,
    ourCaptures: 0,
    ourChecks: 0,
    ourPawnPushes: 0,
    ourPieceMoves: 0,
    ourCenterMoves: 0,
    ourCastled: false,
    ourPromotions: 0,
    outcome: g.result === "1/2-1/2" ? 0.5 : ((isWhite && g.result === "1-0") || (!isWhite && g.result === "0-1")) ? 1 : 0,
    totalLen: moves.length,
    finalTime: isWhite ? g.white_time : g.black_time,
    startingTimeSec: parseTimeControl(g.time_control_label),
  };

  for (let i = 0; i < moves.length; i++) {
    const ours = isWhite ? i % 2 === 0 : i % 2 === 1;
    if (!ours) continue;
    const mv = moves[i];
    m.ourMoves++;
    if (mv.includes("x")) m.ourCaptures++;
    if (mv.includes("+") || mv.includes("#")) m.ourChecks++;
    if (mv.includes("=")) m.ourPromotions++;
    if (mv === "O-O" || mv === "O-O-O") { m.ourCastled = true; continue; }
    // Pawn push: SAN starts with file letter and is not a capture
    if (/^[a-h]/.test(mv) && !mv.includes("x")) {
      m.ourPawnPushes++;
      if (CENTER_FILES.has(mv[0])) m.ourCenterMoves++;
    } else {
      m.ourPieceMoves++;
      // Piece destination square: last 2 chars usually = square (e.g. Nf3)
      const destFile = mv.replace(/[+#]/g, "").slice(-2)[0];
      if (CENTER_FILES.has(destFile)) m.ourCenterMoves++;
    }
  }

  return m;
}

// ============================================================
// Skill computations — each returns 0..100
// ============================================================

function scoreOpening(games: PerGameMetrics[], baselineRating: number): number {
  if (games.length === 0) return ratingFloor(baselineRating);
  // Reward: castling rate, central play in first 10 moves, surviving past move 15.
  let castled = 0, centered = 0, survived = 0;
  for (const g of games) {
    if (g.ourCastled) castled++;
    if (g.totalLen >= 15) survived++;
    // We approximate "central opening play" via center-move rate scaled to first 10 plies
    const earlyShare = g.ourMoves > 0 ? g.ourCenterMoves / g.ourMoves : 0;
    if (earlyShare >= 0.4) centered++;
  }
  const castleRate = castled / games.length;
  const centerRate = centered / games.length;
  const survivalRate = survived / games.length;
  const raw = castleRate * 35 + centerRate * 30 + survivalRate * 35;
  return blend(raw, baselineRating);
}

function scoreMiddlegame(games: PerGameMetrics[], baselineRating: number): number {
  if (games.length === 0) return ratingFloor(baselineRating);
  // Reward sustained activity in moves 15-40: capture+check density and not crashing.
  let activitySum = 0;
  let reachedMid = 0;
  for (const g of games) {
    if (g.totalLen >= 20) reachedMid++;
    const density = g.ourMoves > 0 ? (g.ourCaptures + g.ourChecks) / g.ourMoves : 0;
    activitySum += Math.min(0.35, density); // cap so trades don't dominate
  }
  const activity = (activitySum / games.length) / 0.35; // 0..1
  const reach = reachedMid / games.length;
  const raw = activity * 50 + reach * 50;
  return blend(raw, baselineRating);
}

function scoreEndgame(games: PerGameMetrics[], baselineRating: number): number {
  if (games.length === 0) return ratingFloor(baselineRating);
  // Reward: games reaching past move 40, conversion in long games, promotions.
  let long = 0, convertedLong = 0, promotions = 0;
  for (const g of games) {
    if (g.totalLen >= 40) {
      long++;
      if (g.outcome === 1) convertedLong++;
    }
    if (g.ourPromotions > 0) promotions++;
  }
  const longRate = long / games.length;
  const conversion = long > 0 ? convertedLong / long : 0;
  const promoRate = promotions / games.length;
  const raw = longRate * 35 + conversion * 50 + promoRate * 15;
  return blend(raw, baselineRating);
}

function scoreTactics(games: PerGameMetrics[], baselineRating: number): number {
  if (games.length === 0) return ratingFloor(baselineRating);
  // Reward: high check + capture density, decisive results (not draws).
  let checkSum = 0, captureSum = 0, decisive = 0;
  for (const g of games) {
    if (g.ourMoves === 0) continue;
    checkSum += g.ourChecks / g.ourMoves;
    captureSum += g.ourCaptures / g.ourMoves;
    if (g.outcome !== 0.5) decisive++;
  }
  const checkRate = checkSum / games.length;     // typical 0.02-0.10
  const captureRate = captureSum / games.length; // typical 0.10-0.25
  const decisiveRate = decisive / games.length;
  const raw = (checkRate / 0.10) * 40 + (captureRate / 0.22) * 35 + decisiveRate * 25;
  return blend(raw, baselineRating);
}

function scorePositional(games: PerGameMetrics[], baselineRating: number): number {
  if (games.length === 0) return ratingFloor(baselineRating);
  // Reward: long games, low blunder-collapse rate, balanced piece vs pawn moves.
  let long = 0, collapsed = 0, balanced = 0;
  for (const g of games) {
    if (g.totalLen >= 35) long++;
    if (g.outcome === 0 && g.totalLen > 0 && g.totalLen < 25) collapsed++;
    const piecesShare = g.ourMoves > 0 ? g.ourPieceMoves / g.ourMoves : 0;
    if (piecesShare >= 0.45 && piecesShare <= 0.75) balanced++;
  }
  const longRate = long / games.length;
  const stability = 1 - collapsed / games.length;
  const balanceRate = balanced / games.length;
  const raw = longRate * 35 + stability * 35 + balanceRate * 30;
  return blend(raw, baselineRating);
}

function scoreTimeManagement(games: PerGameMetrics[], baselineRating: number): number {
  const timed = games.filter(g => g.startingTimeSec && g.finalTime !== undefined);
  if (timed.length === 0) return blend(60, baselineRating); // neutral baseline
  let goodMgmt = 0, flagged = 0;
  for (const g of timed) {
    const remaining = g.finalTime ?? 0;
    const start = g.startingTimeSec ?? 1;
    const ratio = remaining / start;
    if (ratio < 0.05) flagged++;
    else if (ratio > 0.25) goodMgmt++;
  }
  const goodRate = goodMgmt / timed.length;
  const flagRate = flagged / timed.length;
  const raw = goodRate * 70 + (1 - flagRate) * 30;
  return blend(raw, baselineRating);
}

function scoreConsistency(games: PerGameMetrics[], baselineRating: number): number {
  if (games.length < 3) return blend(50, baselineRating);
  // Reward: stable result distribution (not all losses), low result variance.
  const results = games.map(g => g.outcome);
  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const variance = results.reduce((acc, r) => acc + (r - mean) ** 2, 0) / results.length;
  // Variance ranges 0..0.25 — invert for stability score
  const stability = 1 - Math.min(1, variance / 0.25);
  const winShare = results.filter(r => r === 1).length / results.length;
  const lossShare = results.filter(r => r === 0).length / results.length;
  const balance = 1 - Math.abs(winShare - (1 - lossShare));
  const raw = stability * 50 + winShare * 30 + balance * 20;
  return blend(raw, baselineRating);
}

// ============================================================
// Helpers
// ============================================================

function ratingFloor(rating: number): number {
  // Map rating roughly to a score floor when no game data exists.
  // 800 → 20, 1200 → 40, 1600 → 60, 2000 → 80, 2400+ → 95
  return clamp(((rating - 600) / 1800) * 80 + 15);
}

function blend(rawScore: number, baselineRating: number): number {
  // Blend behavior-derived score with rating-derived baseline so a 2000-rated
  // player never gets "Beginner" labels just because their PGN sample is small.
  const baseline = ratingFloor(baselineRating);
  const blended = rawScore * 0.7 + baseline * 0.3;
  return clamp(blended);
}

const SKILL_META: Record<SkillKey, { label: string; description: string; icon: string }> = {
  opening:        { label: "Opening Play",     description: "Solid setups, central control, timely castling", icon: "♟" },
  middlegame:     { label: "Middlegame",       description: "Plans, piece activity, pressure",                icon: "♞" },
  endgame:        { label: "Endgame",          description: "Conversion, technique, precision",               icon: "♔" },
  tactics:        { label: "Tactics",          description: "Combinations, threats, calculation",             icon: "⚡" },
  positional:     { label: "Positional Play",  description: "Structure, space, long-term plans",              icon: "🏛" },
  timeManagement: { label: "Time Management",  description: "Clock discipline under pressure",                icon: "⏱" },
  consistency:    { label: "Consistency",      description: "Stable performance across games",                icon: "📈" },
};

// ============================================================
// Main entry
// ============================================================

export function computeChessCard(
  userId: string,
  rating: number,
  games: ChessCardGame[],
): ChessCardProfile {
  const metrics = games.map(g => analyzeGame(userId, g));

  const scores: Record<SkillKey, number> = {
    opening: scoreOpening(metrics, rating),
    middlegame: scoreMiddlegame(metrics, rating),
    endgame: scoreEndgame(metrics, rating),
    tactics: scoreTactics(metrics, rating),
    positional: scorePositional(metrics, rating),
    timeManagement: scoreTimeManagement(metrics, rating),
    consistency: scoreConsistency(metrics, rating),
  };

  const skills: SkillScore[] = (Object.keys(scores) as SkillKey[]).map(key => ({
    key,
    label: SKILL_META[key].label,
    description: SKILL_META[key].description,
    icon: SKILL_META[key].icon,
    score: scores[key],
    level: levelFor(scores[key]),
  }));

  const overallScore = clamp(skills.reduce((acc, s) => acc + s.score, 0) / skills.length);
  const overallLevel = levelFor(overallScore);

  // Strongest / weakest
  const sorted = [...skills].sort((a, b) => b.score - a.score);
  const topStrength = sorted[0].key;
  const topWeakness = sorted[sorted.length - 1].key;

  const summary = buildSummary(skills, overallScore, games.length);

  return {
    totalGames: games.length,
    rating,
    overallScore,
    overallLevel,
    skills,
    summary,
    topStrength,
    topWeakness,
  };
}

function buildSummary(skills: SkillScore[], overall: number, totalGames: number): string {
  if (totalGames === 0) {
    return "Play a few rated games to unlock your personalized Chess Card analysis.";
  }
  const map = new Map(skills.map(s => [s.key, s] as const));
  const sorted = [...skills].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // Style detection
  const tactics = map.get("tactics")!.score;
  const positional = map.get("positional")!.score;
  const endgame = map.get("endgame")!.score;
  const time = map.get("timeManagement")!.score;
  const consistency = map.get("consistency")!.score;

  let style = "balanced";
  if (tactics - positional > 12) style = "aggressive, tactically sharp";
  else if (positional - tactics > 12) style = "patient, positional";
  else if (endgame >= 70 && tactics < 65) style = "endgame-oriented";

  const strength = `strong ${best.label.toLowerCase()}`;
  const weakness = worst.score < 55 ? ` but weaker ${worst.label.toLowerCase()}` : "";
  const clock = time < 50 ? " Clock management is a recurring leak — slow down in critical moments." : "";
  const stab = consistency < 50 ? " Results swing too much from game to game." : "";

  const tier = overall >= 75 ? "An advanced player" : overall >= 55 ? "A solid club-level player" : "A developing player";
  return `${tier} with a ${style} profile — ${strength}${weakness}.${clock}${stab}`.trim();
}

export function compareCards(a: ChessCardProfile, b: ChessCardProfile) {
  return a.skills.map((skillA, i) => {
    const skillB = b.skills[i];
    return {
      key: skillA.key,
      label: skillA.label,
      icon: skillA.icon,
      a: skillA.score,
      b: skillB.score,
      delta: skillA.score - skillB.score,
    };
  });
}
