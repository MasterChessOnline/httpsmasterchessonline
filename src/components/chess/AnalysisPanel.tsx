import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, TrendingUp, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

interface AnalysisPanelProps {
  pgn: string;
  playerColor: "w" | "b";
  result: string;
}

interface AnalysisResult {
  summary: string;
  rating: string;
  mistakes: { move: string; explanation: string; suggestion: string }[];
  strengths: string[];
  tips: string[];
}

export default function AnalysisPanel({ pgn, playerColor, result }: AnalysisPanelProps) {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

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

  if (!analysis && !loading) {
    return (
      <div className="rounded-xl border border-border/40 bg-card p-4 text-center space-y-3">
        <Brain className="w-8 h-8 text-primary mx-auto" />
        <div>
          <p className="text-sm font-semibold text-foreground">AI Game Analysis</p>
          <p className="text-xs text-muted-foreground">Get personalized feedback on your game</p>
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
        <p className="text-xs text-muted-foreground">Analyzing your game…</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Analysis</span>
          <span className="text-xs font-mono text-primary">{analysis.rating}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          <p className="text-xs text-foreground leading-relaxed">{analysis.summary}</p>

          {analysis.mistakes.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Key Mistakes
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
