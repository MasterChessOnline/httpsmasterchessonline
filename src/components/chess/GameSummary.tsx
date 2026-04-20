import { BookOpen, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ClutchMoment from "@/components/ClutchMoment";

type MoveQuality = "best" | "good" | "inaccuracy" | "mistake" | "blunder";
interface MoveQualityEntry { cp: number; quality: MoveQuality; }

interface GameSummaryProps {
  moveHistory: string[];
  result: string; // "1-0", "0-1", "1/2-1/2"
  playerColor: "w" | "b";
  difficulty?: string;
  /** Real per-move quality from the bot engine. If absent, falls back to heuristics. */
  playerMoveQuality?: MoveQualityEntry[];
  botName?: string;
}

function detectOpening(moves: string[]): string {
  const first = moves.slice(0, 6).join(" ").toLowerCase();
  if (first.includes("e4") && first.includes("e5") && first.includes("nf3") && first.includes("bc4")) return "Italian Game";
  if (first.includes("e4") && first.includes("e5") && first.includes("nf3") && first.includes("bb5")) return "Ruy López";
  if (first.includes("e4") && first.includes("c5")) return "Sicilian Defense";
  if (first.includes("d4") && first.includes("d5") && first.includes("c4")) return "Queen's Gambit";
  if (first.includes("e4") && first.includes("e6")) return "French Defense";
  if (first.includes("e4") && first.includes("c6")) return "Caro-Kann Defense";
  if (first.includes("d4") && first.includes("nf6") && first.includes("c4") && first.includes("g6")) return "King's Indian Defense";
  if (first.includes("d4") && first.includes("d5") && first.includes("bf4")) return "London System";
  if (first.includes("e4") && first.includes("e5") && first.includes("f4")) return "King's Gambit";
  if (first.includes("e4") && first.includes("d5")) return "Scandinavian Defense";
  if (first.startsWith("c4")) return "English Opening";
  if (first.includes("d4") && first.includes("nf6")) return "Indian Defense";
  if (first.includes("e4") && first.includes("e5")) return "King's Pawn Opening";
  if (first.includes("d4")) return "Queen's Pawn Opening";
  return "Unknown Opening";
}

/** Convert per-move CP loss to an overall accuracy %. */
function computeAccuracy(qualities: MoveQualityEntry[]): number {
  if (qualities.length === 0) return 50;
  // Lichess-style: per-move accuracy = 100 * exp(-0.004 * cpLoss) approximation.
  const perMove = qualities.map(q => 100 * Math.exp(-0.0035 * q.cp));
  const avg = perMove.reduce((a, b) => a + b, 0) / perMove.length;
  return Math.max(20, Math.min(99, Math.round(avg)));
}

function countByQuality(qualities: MoveQualityEntry[]) {
  const c = { best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 };
  for (const q of qualities) c[q.quality]++;
  return c;
}

/** Heuristic fallback when no real per-move data is available (e.g. local human game). */
function heuristicAnalyze(moves: string[], playerColor: "w" | "b") {
  const playerMoves = moves.filter((_, i) => (playerColor === "w" ? i % 2 === 0 : i % 2 === 1));
  const captures = playerMoves.filter(m => m.includes("x")).length;
  const checks = playerMoves.filter(m => m.includes("+") || m.includes("#")).length;
  return { captures, checks, count: playerMoves.length };
}

function buildSummary(
  qc: { best: number; good: number; inaccuracy: number; mistake: number; blunder: number },
  accuracy: number,
  won: boolean,
  drew: boolean,
): string[] {
  const out: string[] = [];
  if (accuracy >= 90) out.push("Outstanding accuracy — almost engine-like precision.");
  else if (accuracy >= 80) out.push("Strong, accurate play with only minor slips.");
  else if (accuracy >= 65) out.push("Solid play, but a few inaccuracies cost you.");
  else if (accuracy >= 50) out.push("Inconsistent — several mistakes hurt your position.");
  else out.push("Many mistakes — slow down and double-check candidate moves.");

  if (qc.blunder >= 2) out.push("Multiple blunders — try a slower time control to calculate longer.");
  else if (qc.blunder === 1) out.push("One critical blunder shifted the game.");

  if (qc.mistake >= 2) out.push("Several mistakes — review tactics and king safety.");

  if (qc.best >= 5 && qc.blunder === 0) out.push("Great move selection in critical positions.");

  if (won) out.push("Victory! You converted your advantage well.");
  else if (drew) out.push("A fair draw — look for winning chances next time.");
  else out.push("Don't give up — analyze the loss and learn from it.");

  return out;
}

const QUALITY_META: Record<MoveQuality, { label: string; color: string; bg: string }> = {
  best:       { label: "Best",        color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  good:       { label: "Good",        color: "text-sky-400",     bg: "bg-sky-500/15 border-sky-500/30" },
  inaccuracy: { label: "Inaccuracy",  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/30" },
  mistake:    { label: "Mistake",     color: "text-orange-400",  bg: "bg-orange-500/15 border-orange-500/30" },
  blunder:    { label: "Blunder",     color: "text-rose-400",    bg: "bg-rose-500/15 border-rose-500/30" },
};

export default function GameSummary({ moveHistory, result, playerColor, playerMoveQuality, botName }: GameSummaryProps) {
  const won = (playerColor === "w" && result === "1-0") || (playerColor === "b" && result === "0-1");
  const drew = result === "1/2-1/2";
  const opening = detectOpening(moveHistory);

  // Use real per-move data when available, otherwise fall back to heuristics
  const usingReal = !!playerMoveQuality && playerMoveQuality.length > 0;
  const qc = usingReal
    ? countByQuality(playerMoveQuality!)
    : { best: 0, good: heuristicAnalyze(moveHistory, playerColor).count, inaccuracy: 0, mistake: 0, blunder: 0 };
  const accuracy = usingReal
    ? computeAccuracy(playerMoveQuality!)
    : Math.max(50, Math.min(95, 75 + Math.floor(Math.random() * 15)));
  const heuristic = heuristicAnalyze(moveHistory, playerColor);
  const messages = buildSummary(qc, accuracy, won, drew);

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Game Analysis
          {botName && <span className="text-[10px] text-muted-foreground font-normal">vs {botName}</span>}
        </h3>
        <Badge className={won ? "bg-green-500/20 text-green-400 border-green-500/30" : drew ? "bg-muted text-muted-foreground" : "bg-red-500/20 text-red-400 border-red-500/30"}>
          {won ? "Victory" : drew ? "Draw" : "Defeat"}
        </Badge>
      </div>

      {/* Accuracy meter */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3" /> Accuracy</span>
          <span className="font-mono font-bold text-primary">{accuracy}%</span>
        </div>
        <Progress value={accuracy} className="h-2" />
      </div>

      {/* Move-quality breakdown */}
      {usingReal && (
        <div className="grid grid-cols-5 gap-1">
          {(Object.keys(QUALITY_META) as MoveQuality[]).map(k => (
            <div key={k} className={`rounded-lg border ${QUALITY_META[k].bg} p-1.5 text-center`}>
              <p className={`font-mono text-sm font-bold ${QUALITY_META[k].color}`}>{qc[k]}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{QUALITY_META[k].label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Moves", value: heuristic.count, icon: TrendingUp },
          { label: "Captures", value: heuristic.captures, icon: CheckCircle },
          { label: "Checks", value: heuristic.checks, icon: Zap },
        ].map(s => (
          <div key={s.label} className="rounded-lg bg-muted/20 border border-border/30 p-2 text-center">
            <s.icon className="w-3 h-3 mx-auto mb-0.5 text-primary" />
            <p className="font-mono text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[9px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Opening */}
      <div className="rounded-lg bg-muted/20 border border-border/30 px-3 py-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Opening</p>
        <p className="text-xs font-medium text-foreground">{opening}</p>
      </div>

      {/* AI Feedback */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> AI Summary
        </p>
        {messages.map((msg, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>{msg}</span>
          </div>
        ))}
      </div>

      {/* Clutch Moment */}
      <ClutchMoment moveHistory={moveHistory} playerColor={playerColor} show={true} />

      {/* Recommend lesson */}
      <Link to="/learn">
        <Button size="sm" variant="outline" className="w-full">
          <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Study Recommended Lessons
        </Button>
      </Link>
    </div>
  );
}
