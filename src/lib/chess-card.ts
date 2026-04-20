/**
 * Chess Card analytics engine.
 *
 * Computes 7 skill scores (0-100) from a player's recent games:
 *  - opening, middlegame, endgame, tactics, positional, time, consistency
 *
 * Scores are derived from PGN move counts, time-control patterns, captures,
 * castling, and result distribution. Pure deterministic (no engine eval) so
 * it works for the human-only-play policy on MasterChess.
 */
import { Chess } from "chess.js";

export type SkillKey =
  | "opening"
  | "middlegame"
  | "endgame"
  | "tactics"
  | "positional"
  | "time"
  | "consistency";

export interface SkillScore {
  key: SkillKey;
  label: string;
  icon: string;
  description: string;
  score: number;          // 0..100
  level: string;          // human label e.g. "Intermediate"
}

export interface ChessCardGame {
  white_player_id: string;
  black_player_id: string;
  result: string | null;          // "1-0" | "0-1" | "1/2-1/2" | null
  pgn: string | null;
  time_control_label: string | null;
  white_time?: number | null;
  black_time?: number | null;
  created_at: string;
  source: "online" | "bot";
}

export interface ChessCardProfile {
  userId: string;
  rating: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  overallScore: number;     // 0..100
  overallLevel: string;
  skills: SkillScore[];
  topStrength: SkillKey | null;
  topWeakness: SkillKey | null;
  summary: string;
}

const SKILL_META: Record<SkillKey, { label: string; icon: string; description: string }> = {
  opening:    { label: "Opening Play",    icon: "♘", description: "Knowledge & variety in the opening phase" },
  middlegame: { label: "Middlegame",      icon: "⚔️", description: "Strategy, planning, and active play" },
  endgame:    { label: "Endgame",         icon: "♚", description: "Technique and conversion in the endgame" },
  tactics:    { label: "Tactics",         icon: "⚡", description: "Combinations, captures, and forcing play" },
  positional: { label: "Positional Play", icon: "🏰", description: "Pawn structures, king safety, long-term play" },
  time:       { label: "Time Management", icon: "⏱️", description: "How well you manage the clock" },
  consistency:{ label: "Consistency",     icon: "📈", description: "Performance stability across games" },
};

function levelFor(score: number): string {
  if (score >= 90) return "Grandmaster";
  if (score >= 80) return "Master";
  if (score >= 70) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 50) return "Intermediate";
  if (score >= 35) return "Club Player";
  if (score >= 20) return "Beginner+";
  return "Beginner";
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}

interface PgnMetrics {
  plyCount: number;
  reachedMiddlegame: boolean;
  reachedEndgame: boolean;
  endgameReached: boolean;
  castled: boolean;
  captures: number;
  checks: number;
  promotions: number;
  uniqueOpeningSan: string;     // first 6 SAN moves joined
}

function analyzePgn(pgn: string | null): PgnMetrics {
  const m: PgnMetrics = {
    plyCount: 0,
    reachedMiddlegame: false,
    reachedEndgame: false,
    endgameReached: false,
    castled: false,
    captures: 0,
    checks: 0,
    promotions: 0,
    uniqueOpeningSan: "",
  };
  if (!pgn) return m;
  try {
    const game = new Chess();
    game.loadPgn(pgn);
    const history = game.history({ verbose: true });
    m.plyCount = history.length;

    const openingSan: string[] = [];
    let pieceCount = 32;

    history.forEach((mv: any, idx: number) => {
      if (idx < 6) openingSan.push(mv.san);
      if (mv.flags.includes("c") || mv.flags.includes("e")) {
        m.captures += 1;
        pieceCount -= 1;
      }
      if (mv.san.includes("+") || mv.san.includes("#")) m.checks += 1;
      if (mv.flags.includes("p")) m.promotions += 1;
      if (mv.flags.includes("k") || mv.flags.includes("q")) m.castled = true;
    });

    m.uniqueOpeningSan = openingSan.join(" ");
    m.reachedMiddlegame = m.plyCount >= 20;
    m.reachedEndgame = m.plyCount >= 40 && pieceCount <= 14;
    m.endgameReached = m.reachedEndgame;
  } catch {
    /* invalid pgn — leave zeros */
  }
  return m;
}

interface AggregateMetrics {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  totalPly: number;
  reachedMiddlegame: number;
  reachedEndgame: number;
  endgameWins: number;
  castledGames: number;
  totalCaptures: number;
  totalChecks: number;
  totalPromotions: number;
  uniqueOpenings: Set<string>;
  bulletGames: number;
  blitzGames: number;
  rapidGames: number;
  classicalGames: number;
  timeoutLosses: number;     // games lost on time
  resultStream: number[];    // 1 / 0 / 0.5
}

function aggregate(userId: string, games: ChessCardGame[]): AggregateMetrics {
  const agg: AggregateMetrics = {
    games: 0, wins: 0, losses: 0, draws: 0,
    totalPly: 0, reachedMiddlegame: 0, reachedEndgame: 0, endgameWins: 0,
    castledGames: 0, totalCaptures: 0, totalChecks: 0, totalPromotions: 0,
    uniqueOpenings: new Set(),
    bulletGames: 0, blitzGames: 0, rapidGames: 0, classicalGames: 0,
    timeoutLosses: 0, resultStream: [],
  };

  games.forEach(g => {
    const isWhite = g.white_player_id === userId;
    const result = g.result ?? "";
    const won = (isWhite && result === "1-0") || (!isWhite && result === "0-1");
    const lost = (isWhite && result === "0-1") || (!isWhite && result === "1-0");
    const draw = result === "1/2-1/2";
    if (!won && !lost && !draw) return;

    agg.games += 1;
    if (won) { agg.wins += 1; agg.resultStream.push(1); }
    else if (lost) { agg.losses += 1; agg.resultStream.push(0); }
    else { agg.draws += 1; agg.resultStream.push(0.5); }

    const myTime = isWhite ? g.white_time : g.black_time;
    if (lost && typeof myTime === "number" && myTime <= 0) agg.timeoutLosses += 1;

    const tc = (g.time_control_label || "").toLowerCase();
    const base = parseInt(tc.split("+")[0] || "0", 10) || 0;
    if (base <= 2) agg.bulletGames += 1;
    else if (base <= 5) agg.blitzGames += 1;
    else if (base <= 15) agg.rapidGames += 1;
    else agg.classicalGames += 1;

    const m = analyzePgn(g.pgn);
    agg.totalPly += m.plyCount;
    if (m.reachedMiddlegame) agg.reachedMiddlegame += 1;
    if (m.reachedEndgame) {
      agg.reachedEndgame += 1;
      if (won) agg.endgameWins += 1;
    }
    if (m.castled) agg.castledGames += 1;
    agg.totalCaptures += m.captures;
    agg.totalChecks += m.checks;
    agg.totalPromotions += m.promotions;
    if (m.uniqueOpeningSan) agg.uniqueOpenings.add(m.uniqueOpeningSan);
  });

  return agg;
}

function ratingBoost(rating: number): number {
  // Map rating 400..2400 → +0..+25 baseline boost so new players still see a reasonable card
  const r = clamp(rating, 400, 2400);
  return ((r - 400) / 2000) * 25;
}

function computeSkills(rating: number, agg: AggregateMetrics): SkillScore[] {
  const base = 30 + ratingBoost(rating);    // 30..55 baseline
  const games = Math.max(1, agg.games);
  const winRate = agg.wins / games;
  const drawRate = agg.draws / games;
  const avgPly = agg.totalPly / games;

  // OPENING: based on castling rate, opening variety, and not losing too quickly
  const castleRate = agg.castledGames / games;
  const openingVariety = clamp(agg.uniqueOpenings.size / Math.max(3, games / 4), 0, 1);
  const fastLosses = agg.resultStream.filter((r, i) => r === 0).length;
  const opening = clamp(
    base + castleRate * 25 + openingVariety * 15 + (avgPly > 25 ? 8 : 0) - (fastLosses / games) * 10,
  );

  // MIDDLEGAME: based on games that reached middlegame and win rate there
  const middleReachRate = agg.reachedMiddlegame / games;
  const middlegame = clamp(base + middleReachRate * 25 + winRate * 20 + (agg.totalChecks / games) * 1.5);

  // ENDGAME: based on endgame conversions
  const endgameReachRate = agg.reachedEndgame / games;
  const endgameConv = agg.reachedEndgame > 0 ? agg.endgameWins / agg.reachedEndgame : winRate;
  const endgame = clamp(base + endgameReachRate * 20 + endgameConv * 30 + (agg.totalPromotions / games) * 5);

  // TACTICS: captures + checks + decisive results (less drawish)
  const capturesPerGame = agg.totalCaptures / games;
  const checksPerGame = agg.totalChecks / games;
  const decisiveRate = (agg.wins + agg.losses) / games;
  const tactics = clamp(base + capturesPerGame * 1.4 + checksPerGame * 3 + decisiveRate * 12);

  // POSITIONAL: longer games, lower captures-per-ply, draws (often positional)
  const capturesPerPly = avgPly > 0 ? agg.totalCaptures / agg.totalPly : 0;
  const positional = clamp(
    base + (avgPly / 60) * 25 + drawRate * 15 + (1 - clamp(capturesPerPly * 100, 0, 100) / 100) * 10,
  );

  // TIME: penalty for timeout losses; bonus for surviving rapid/classical
  const timeoutRate = agg.timeoutLosses / games;
  const slowGameShare = (agg.rapidGames + agg.classicalGames) / games;
  const time = clamp(base + 25 - timeoutRate * 50 + slowGameShare * 15);

  // CONSISTENCY: variance of last results — lower variance = higher consistency
  const last = agg.resultStream.slice(-15);
  const meanR = last.length ? last.reduce((a, b) => a + b, 0) / last.length : winRate;
  const variance = last.length
    ? last.reduce((s, v) => s + (v - meanR) ** 2, 0) / last.length
    : 0.25;
  const consistency = clamp(base + (1 - variance * 4) * 30 + Math.min(games, 20));

  const raw: Record<SkillKey, number> = {
    opening: Math.round(opening),
    middlegame: Math.round(middlegame),
    endgame: Math.round(endgame),
    tactics: Math.round(tactics),
    positional: Math.round(positional),
    time: Math.round(time),
    consistency: Math.round(consistency),
  };

  return (Object.keys(raw) as SkillKey[]).map(k => ({
    key: k,
    label: SKILL_META[k].label,
    icon: SKILL_META[k].icon,
    description: SKILL_META[k].description,
    score: raw[k],
    level: levelFor(raw[k]),
  }));
}

function buildSummary(name: string, skills: SkillScore[], agg: AggregateMetrics, overall: number): string {
  if (agg.games === 0) {
    return "No rated games yet — play a few games to unlock your personalised Chess Card analytics.";
  }
  const sorted = [...skills].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const styleParts: string[] = [];
  if (top.key === "tactics" || top.key === "middlegame") styleParts.push("aggressive, tactical player");
  else if (top.key === "positional" || top.key === "endgame") styleParts.push("calm, positional player");
  else if (top.key === "opening") styleParts.push("well-prepared opening specialist");
  else if (top.key === "time") styleParts.push("composed under the clock");
  else styleParts.push("steady, well-rounded player");

  const winRate = agg.games ? Math.round((agg.wins / agg.games) * 100) : 0;
  const overallLabel = levelFor(overall).toLowerCase();

  return `${name} is an ${overallLabel}-level ${styleParts[0]} with strong ${top.label.toLowerCase()} (${top.score}/100) but room to grow in ${weakest.label.toLowerCase()} (${weakest.score}/100). Across ${agg.games} games, win rate is ${winRate}%.`;
}

export function computeChessCard(userId: string, rating: number, games: ChessCardGame[]): ChessCardProfile {
  const agg = aggregate(userId, games);
  const skills = computeSkills(rating, agg);
  const overallScore = Math.round(skills.reduce((s, k) => s + k.score, 0) / skills.length);
  const sorted = [...skills].sort((a, b) => b.score - a.score);
  const topStrength = agg.games > 0 ? sorted[0].key : null;
  const topWeakness = agg.games >= 5 ? sorted[sorted.length - 1].key : null;
  return {
    userId,
    rating,
    totalGames: agg.games,
    wins: agg.wins,
    losses: agg.losses,
    draws: agg.draws,
    overallScore,
    overallLevel: levelFor(overallScore),
    skills,
    topStrength,
    topWeakness,
    summary: buildSummary("This player", skills, agg, overallScore),
  };
}

export interface CompareRow {
  key: SkillKey;
  label: string;
  icon: string;
  a: number;
  b: number;
  delta: number;       // a - b
}

export function compareCards(a: ChessCardProfile, b: ChessCardProfile): CompareRow[] {
  return a.skills.map((sa, i) => {
    const sb = b.skills[i];
    return {
      key: sa.key,
      label: sa.label,
      icon: sa.icon,
      a: sa.score,
      b: sb.score,
      delta: sa.score - sb.score,
    };
  });
}
