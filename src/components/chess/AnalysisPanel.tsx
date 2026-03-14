import { useState } from "react";
import { Chess } from "chess.js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Play, Pause, SkipForward, SkipBack } from "lucide-react";

interface AnalysisPanelProps {
  pgn: string;
  playerColor: "w" | "b";
  result: string;
}

interface AnalysisResult {
  summary: string;
  rating: string;
  score: number; // 0-100 performance score
  mistakes: { move: string; moveNumber: number; explanation: string; suggestion: string }[];
  strengths: string[];
  tips: string[];
}

export default function AnalysisPanel({ pgn, playerColor, result }: AnalysisPanelProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Replay state
  const [replayIdx, setReplayIdx] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);

  // Parse moves from PGN for replay
  const replayGame = new Chess();
  try { replayGame.loadPgn(pgn); } catch {}
  const allMoves = replayGame.history();
  const totalMoves = allMoves.length;

  // Get commentary for current move
  const getMoveCommentary = (idx: number): string | null => {
    if (!analysis) return null;
    const moveNum = Math.floor(idx / 2) + 1;
    const mistake = analysis.mistakes.find(m => m.moveNumber === moveNum);
    if (mistake) return `⚠️ ${mistake.explanation} — Better: ${mistake.suggestion}`;
    return null;
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-game", {
        body: { pgn, playerColor, result },
      });
      if (error) throw error;
      setAnalysis(data);
    } catch (e) {
      console.error("Analysis failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Replay controls
  const stepForward = () => setReplayIdx(prev => Math.min(prev + 1, totalMoves));
  const stepBack = () => setReplayIdx(prev => Math.max(prev - 1, 0));

  // Auto-replay
  const toggleAutoReplay = () => {
    if (isReplaying) {
      setIsReplaying(false);
      return;
    }
    setIsReplaying(true);
    if (replayIdx >= totalMoves) setReplayIdx(0);
  };

  // Auto-replay effect via interval
  useState(() => {
    if (!isReplaying) return;
    const interval = setInterval(() => {
      setReplayIdx(prev => {
        if (prev >= totalMoves) {
          setIsReplaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-yellow-400";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Great";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    if (score >= 20) return "Needs Work";
    return "Poor";
  };

  if (!analysis && !loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-4 text-center space-y-3">
        <Brain className="w-8 h-8 text-primary mx-auto" />
        <div>
          <p className="text-sm font-semibold text-foreground">DailyChess_12 Analysis</p>
          <p className="text-xs text-muted-foreground">Get AI-powered feedback on your game</p>
        </div>
        <Button onClick={analyze} size="sm" disabled={!user}>
          <Brain className="mr-1.5 h-3.5 w-3.5" /> Analyze Game
        </Button>
        {!user && <p className="text-[10px] text-muted-foreground">Sign in to use AI analysis</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-6 flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">DailyChess_12 is analyzing your game…</p>
      </div>
    );
  }

  if (!analysis) return null;

  const commentary = getMoveCommentary(replayIdx - 1);

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">DailyChess_12 Analysis</span>
          <span className={`text-xs font-mono font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}/100
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {/* Performance score */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                  strokeDasharray={`${analysis.score * 0.942} 100`} strokeLinecap="round" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.rating}
              </span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${getScoreColor(analysis.score)}`}>{getScoreLabel(analysis.score)}</p>
              <p className="text-[11px] text-muted-foreground">{analysis.summary}</p>
            </div>
          </div>

          {/* Move replay */}
          {totalMoves > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Replay Moves</p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setReplayIdx(0)}>
                  <SkipBack className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={stepBack} disabled={replayIdx === 0}>
                  <ChevronDown className="w-3 h-3 rotate-90" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={toggleAutoReplay}>
                  {isReplaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={stepForward} disabled={replayIdx >= totalMoves}>
                  <ChevronDown className="w-3 h-3 -rotate-90" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setReplayIdx(totalMoves)}>
                  <SkipForward className="w-3 h-3" />
                </Button>
                <span className="text-[10px] text-muted-foreground ml-1 font-mono">{replayIdx}/{totalMoves}</span>
              </div>
              {replayIdx > 0 && (
                <p className="text-[11px] font-mono text-foreground">
                  {Math.floor((replayIdx - 1) / 2) + 1}.{(replayIdx - 1) % 2 === 1 ? ".." : ""} {allMoves[replayIdx - 1]}
                </p>
              )}
              {commentary && (
                <p className="text-[11px] text-primary bg-primary/5 rounded-lg px-2 py-1.5 border border-primary/10">{commentary}</p>
              )}
            </div>
          )}

          {analysis.mistakes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Key Mistakes ({analysis.mistakes.length})
              </p>
              {analysis.mistakes.map((m, i) => (
                <div key={i} className="rounded-lg bg-destructive/5 border border-destructive/10 p-2">
                  <p className="text-xs font-mono font-bold text-foreground">{m.move}</p>
                  <p className="text-[11px] text-muted-foreground">{m.explanation}</p>
                  <p className="text-[11px] text-primary mt-0.5">Better: {m.suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {analysis.strengths.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Strengths
              </p>
              {analysis.strengths.map((s, i) => (
                <p key={i} className="text-[11px] text-muted-foreground">• {s}</p>
              ))}
            </div>
          )}

          {analysis.tips.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Improvement Tips
              </p>
              {analysis.tips.map((t, i) => (
                <p key={i} className="text-[11px] text-muted-foreground">• {t}</p>
              ))}
            </div>
          )}

          <Button onClick={analyze} variant="ghost" size="sm" className="w-full text-xs">
            Re-analyze
          </Button>
        </div>
      )}
    </div>
  );
}