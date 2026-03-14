import { Bot, Swords, Users, Wifi, Crown, Timer, RotateCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AI_LEVELS, type Difficulty } from "@/lib/chess-ai";
import { TIME_CONTROLS } from "@/components/ChessClock";
import { Link } from "react-router-dom";

type GameMode = "local" | "ai";
type PlayerColor = "w" | "b";

interface GameControlsProps {
  mode: GameMode;
  difficulty: Difficulty;
  playerColor: PlayerColor;
  timeControlIdx: number;
  statusText: string;
  moveHistory: string[];
  isGameOver: boolean;
  hintsEnabled: boolean;
  onModeChange: (mode: GameMode) => void;
  onDifficultyChange: (d: Difficulty) => void;
  onColorChange: (c: PlayerColor) => void;
  onTimeControlChange: (idx: number) => void;
  onNewGame: () => void;
  onToggleHints: () => void;
}

const BOT_LEVELS: { value: Difficulty; label: string; rating: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", rating: "400", desc: "Learning the basics" },
  { value: "casual", label: "Easy", rating: "800", desc: "Casual opponent" },
  { value: "intermediate", label: "Intermediate", rating: "1200", desc: "Club-level play" },
  { value: "advanced", label: "Advanced", rating: "1600", desc: "Tough competition" },
  { value: "master", label: "Master", rating: "2000", desc: "Elite challenge" },
];

export default function GameControls({
  mode, difficulty, playerColor, timeControlIdx,
  statusText, moveHistory, isGameOver, hintsEnabled,
  onModeChange, onDifficultyChange, onColorChange,
  onTimeControlChange, onNewGame, onToggleHints,
}: GameControlsProps) {
  return (
    <div className="w-full lg:max-w-xs space-y-3">
      {/* Mode select */}
      <div className="flex gap-1.5">
        <Button variant={mode === "ai" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => onModeChange("ai")}>
          <Bot className="mr-1.5 h-3.5 w-3.5" /> vs Bot
        </Button>
        <Button variant={mode === "local" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => onModeChange("local")}>
          <Users className="mr-1.5 h-3.5 w-3.5" /> Local
        </Button>
        <Link to="/play/online" className="flex-1">
          <Button variant="outline" size="sm" className="w-full border-primary/30 text-primary hover:bg-primary/10">
            <Wifi className="mr-1.5 h-3.5 w-3.5" /> Online
          </Button>
        </Link>
      </div>

      {/* Bot selector */}
      {mode === "ai" && (
        <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">DailyChess_12 Bot</p>
              <p className="text-[10px] text-muted-foreground">Choose difficulty</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {BOT_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => onDifficultyChange(lvl.value)}
                className={`rounded-lg px-1 py-2 text-center transition-all border ${
                  difficulty === lvl.value
                    ? "border-primary bg-primary/10 text-primary shadow-glow"
                    : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <span className="text-[10px] font-bold block">{lvl.rating}</span>
                <span className="text-[9px] font-medium block leading-tight">{lvl.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {BOT_LEVELS.find((l) => l.value === difficulty)?.desc}
          </p>
        </div>
      )}

      {/* Time Control */}
      <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Timer className="h-3 w-3" /> Time Control
        </p>
        <div className="grid grid-cols-4 gap-1">
          {TIME_CONTROLS.map((tc, i) => (
            <button
              key={tc.label}
              onClick={() => onTimeControlChange(i)}
              className={`rounded-lg px-1 py-1.5 text-center transition-all border text-[11px] font-medium ${
                timeControlIdx === i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
              }`}
            >
              {tc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      {mode === "ai" && (
        <div className="rounded-xl border border-border/40 bg-card p-3 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Play as</p>
          <div className="flex gap-2">
            {(["w", "b"] as const).map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`flex-1 rounded-lg px-2 py-2 text-center transition-all border ${
                  playerColor === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 bg-muted/20 text-muted-foreground hover:border-primary/30"
                }`}
              >
                <Crown className="h-3.5 w-3.5 mx-auto mb-0.5" />
                <span className="text-[10px] font-medium block">{c === "w" ? "White" : "Black"}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hints toggle */}
      {mode === "ai" && (
        <Button
          variant={hintsEnabled ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={onToggleHints}
        >
          <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
          {hintsEnabled ? "Hints On" : "Enable Hints"}
        </Button>
      )}

      {/* Status */}
      <div className="rounded-xl border border-border/40 bg-card p-3" role="status" aria-live="polite">
        <p className="font-display text-sm font-semibold text-foreground">{statusText}</p>
      </div>

      <Button onClick={onNewGame} variant="outline" size="sm" className="w-full">
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New Game
      </Button>

      {/* Move history */}
      <div className="rounded-xl border border-border/40 bg-card p-3 max-h-48 overflow-y-auto">
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Moves</h3>
        {moveHistory.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">No moves yet — White plays first</p>
        ) : (
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-0.5 text-xs">
            {moveHistory.map((move, i) =>
              i % 2 === 0 ? (
                <div key={i} className="contents">
                  <span className="text-muted-foreground/60 font-mono">{Math.floor(i / 2) + 1}.</span>
                  <span className="text-foreground font-medium font-mono">{move}</span>
                  <span className="text-muted-foreground font-mono">{moveHistory[i + 1] || ""}</span>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
