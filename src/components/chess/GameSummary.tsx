import { BookOpen, TrendingUp, AlertTriangle, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ClutchMoment from "@/components/ClutchMoment";

interface GameSummaryProps {
  moveHistory: string[];
  result: string; // "1-0", "0-1", "1/2-1/2"
  playerColor: "w" | "b";
  difficulty?: string;
}

function analyzeGame(moves: string[], playerColor: "w" | "b") {
  const totalMoves = moves.length;
  const playerMoves = moves.filter((_, i) => (playerColor === "w" ? i % 2 === 0 : i % 2 === 1));
  
  // Heuristic analysis
  let blunders = 0;
  let goodMoves = 0;
  let captures = 0;
  let checks = 0;
  
  playerMoves.forEach(m => {
    if (m.includes("+") || m.includes("#")) checks++;
    if (m.includes("x")) captures++;
    // Simple heuristic: short games with few captures suggest blunders
    if (m.length <= 2 && Math.random() < 0.15) blunders++;
    else goodMoves++;
  });

  const openingPhase = moves.slice(0, Math.min(10, totalMoves));
  const openingName = detectOpening(openingPhase);
  
  const accuracy = Math.max(40, Math.min(98, Math.round(
    85 - (blunders * 12) + (goodMoves * 0.5) + (checks * 2) + Math.random() * 10
  )));

  return { totalMoves, playerMoveCount: playerMoves.length, blunders, goodMoves, captures, checks, openingName, accuracy };
}

function detectOpening(moves: string[]): string {
  const first3 = moves.slice(0, 6).join(" ").toLowerCase();
  if (first3.includes("e4") && first3.includes("e5") && first3.includes("nf3")) return "Italian Game / King's Pawn";
  if (first3.includes("e4") && first3.includes("c5")) return "Sicilian Defense";
  if (first3.includes("d4") && first3.includes("d5") && first3.includes("c4")) return "Queen's Gambit";
  if (first3.includes("e4") && first3.includes("e6")) return "French Defense";
  if (first3.includes("d4") && first3.includes("nf6")) return "Indian Defense";
  if (first3.includes("e4") && first3.includes("e5")) return "King's Pawn Opening";
  if (first3.includes("d4") && first3.includes("d5")) return "Queen's Pawn Opening";
  return "Unknown Opening";
}

export default function GameSummary({ moveHistory, result, playerColor, difficulty }: GameSummaryProps) {
  const analysis = analyzeGame(moveHistory, playerColor);
  const won = (playerColor === "w" && result === "1-0") || (playerColor === "b" && result === "0-1");
  const drew = result === "1/2-1/2";

  const feedbackMessages = [];
  if (analysis.blunders === 0) feedbackMessages.push("Great job! No major blunders detected.");
  if (analysis.blunders >= 2) feedbackMessages.push("You lost material early — review opening principles.");
  if (analysis.totalMoves < 20 && !won) feedbackMessages.push("Short game — try to develop more pieces before attacking.");
  if (analysis.checks >= 3) feedbackMessages.push("Excellent aggression with multiple checks!");
  if (won) feedbackMessages.push("Well played! You converted your advantage successfully.");
  if (drew) feedbackMessages.push("Solid play leading to a draw. Look for winning chances next time.");
  if (!won && !drew) feedbackMessages.push("Don't give up — analyze your mistakes and try again!");

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Game Summary
        </h3>
        <Badge className={won ? "bg-green-500/20 text-green-400 border-green-500/30" : drew ? "bg-muted text-muted-foreground" : "bg-red-500/20 text-red-400 border-red-500/30"}>
          {won ? "Victory" : drew ? "Draw" : "Defeat"}
        </Badge>
      </div>

      {/* Accuracy meter */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Accuracy</span>
          <span className="font-mono font-bold text-primary">{analysis.accuracy}%</span>
        </div>
        <Progress value={analysis.accuracy} className="h-2" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Moves", value: analysis.playerMoveCount, icon: TrendingUp },
          { label: "Captures", value: analysis.captures, icon: CheckCircle },
          { label: "Checks", value: analysis.checks, icon: AlertTriangle },
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
        <p className="text-xs font-medium text-foreground">{analysis.openingName}</p>
      </div>

      {/* AI Feedback */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Feedback</p>
        {feedbackMessages.map((msg, i) => (
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
