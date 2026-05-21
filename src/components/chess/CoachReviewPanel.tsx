// Coach Review panel — runs honest per-move analysis with Stockfish locally
// (book/best/good/inaccuracy/mistake/blunder/brilliant) and then asks the
// AI for narrative comments on the moves WE classified — never the other
// way around. This avoids "Brilliant!" on move 1.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, BookOpen, GraduationCap, Lightbulb, Target, Trophy, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { OpeningEntry } from "@/lib/openings-detector";
import { classifyGame, ClassifiedMove, Verdict } from "@/lib/move-classifier";

export interface CoachReview {
  summary: string;
  opening_review: string;
  key_moments: { move_number: number; san?: string; verdict: string; comment: string }[];
  repertoire_suggestions: { san: string; why: string }[];
  next_focus: string;
}

interface Props {
  pgn: string;
  myColor: "w" | "b";
  result: string;
  endReason?: string;
  opening: OpeningEntry | null;
  myRating?: number;
  opponentRating?: number;
  sourceGameId?: string;
}

const VERDICT_STYLES: Record<Verdict, string> = {
  book:        "text-sky-300 bg-sky-500/10 border-sky-500/30",
  brilliant:   "text-cyan-300 bg-cyan-500/15 border-cyan-400/40",
  great:       "text-indigo-300 bg-indigo-500/10 border-indigo-400/40",
  best:        "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  excellent:   "text-teal-300 bg-teal-500/10 border-teal-500/30",
  good:        "text-emerald-200 bg-emerald-500/5 border-emerald-500/20",
  inaccuracy:  "text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
  mistake:     "text-orange-300 bg-orange-500/10 border-orange-500/30",
  miss:        "text-rose-300 bg-rose-500/10 border-rose-400/30",
  blunder:     "text-red-300 bg-red-500/10 border-red-500/30",
};

const VERDICT_LABEL: Record<Verdict, string> = {
  book: "Book", brilliant: "Brilliant", great: "Great", best: "Best",
  excellent: "Excellent", good: "Good", inaccuracy: "Inaccuracy",
  mistake: "Mistake", miss: "Miss", blunder: "Blunder",
};

const VERDICT_SYMBOL: Record<Verdict, string> = {
  book: "📖", brilliant: "!!", great: "!", best: "★", excellent: "◆",
  good: "·", inaccuracy: "?!", mistake: "?", miss: "✗", blunder: "??",
};

const VERDICT_TOOLTIP: Record<Verdict, string> = {
  book: "Opening theory — a known book move.",
  brilliant: "A creative sacrifice that engine still rates near-best.",
  great: "The only good move — every other choice was clearly worse.",
  best: "Matches the engine's top choice exactly.",
  excellent: "Very precise — within ~20cp of best.",
  good: "Solid move with only a small concession.",
  inaccuracy: "Small drop in evaluation.",
  mistake: "A serious error that worsens the position.",
  miss: "Missed a winning chance.",
  blunder: "A big loss of material or position.",
};

export default function CoachReviewPanel({
  pgn, myColor, result, endReason, opening, myRating, opponentRating, sourceGameId,
}: Props) {
  const [review, setReview] = useState<CoachReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, phase: "" as "engine" | "ai" | "" });
  const [classified, setClassified] = useState<ClassifiedMove[] | null>(null);
  const [accuracy, setAccuracy] = useState<{ w: number; b: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savedLessonId, setSavedLessonId] = useState<string | null>(null);

  const runReview = async () => {
    setLoading(true);
    setProgress({ done: 0, total: 0, phase: "engine" });
    try {
      // Step 1 — local engine analysis (honest verdicts, MultiPV=3).
      const result = await classifyGame(pgn, {
        depth: 16,
        multiPv: 3,
        onProgress: (done, total) => setProgress({ done, total, phase: "engine" }),
      });
      setClassified(result.moves);
      setAccuracy({ w: result.accuracyWhite, b: result.accuracyBlack });

      // Step 2 — pick the most interesting moments OUR side played
      // (top blunders/mistakes/brilliants), and feed them to the AI for
      // narrative coaching.
      const myMoves = result.moves.filter(m => m.color === myColor);
      const significant = myMoves
        .filter(m => m.verdict !== "book" && m.verdict !== "best" && m.verdict !== "excellent")
        .sort((a, b) => {
          const rank: Record<Verdict, number> = {
            blunder: 0, miss: 1, brilliant: 2, great: 3, mistake: 4, inaccuracy: 5,
            good: 6, excellent: 7, best: 8, book: 9,
          };
          return rank[a.verdict] - rank[b.verdict];
        })
        .slice(0, 5)
        .map(m => ({
          move_number: m.moveNumber,
          color: m.color,
          san: m.san,
          verdict: m.verdict,
          cp_loss: m.cpLoss,
          best_move_san: m.bestMoveSan ?? null,
        }));

      setProgress({ done: 0, total: 0, phase: "ai" });
      const { data, error } = await supabase.functions.invoke("coach-game-review", {
        body: {
          pgn, myColor, result: result, endReason,
          openingName: opening?.name,
          openingEco: opening?.eco,
          myRating, opponentRating,
          // NEW: pre-classified moments — AI must NOT invent verdicts.
          accuracy: { white: result.accuracyWhite, black: result.accuracyBlack },
          counts: result.counts,
          key_moments_input: significant,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReview(data.review);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to load review";
      toast({
        title: msg === "rate_limited" ? "Slow down" : msg === "credits_exhausted" ? "Out of AI credits" : "Coach unavailable",
        description: msg === "rate_limited"
          ? "Too many reviews at once — try again in a minute."
          : msg === "credits_exhausted"
          ? "Add credits in Settings → Workspace → Usage."
          : "Could not generate the review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress({ done: 0, total: 0, phase: "" });
    }
  };

  const generateLesson = async () => {
    if (!opening) {
      toast({ title: "No opening detected", description: "Can't build a lesson without a known opening." });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-opening-lesson", {
        body: {
          pgn, myColor,
          openingName: opening.name,
          openingEco: opening.eco,
          sourceGameId,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSavedLessonId(data.lessonId);
      toast({ title: "Lesson created", description: "Find it in Learn → My Lessons." });
    } catch (e: any) {
      const msg = e?.message ?? "Failed to generate lesson";
      toast({ title: "Couldn't generate lesson", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Empty state — show the CTA card.
  if (!review && !loading) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card/80 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/15 border border-primary/30 p-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-foreground">Coach Review</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Honest engine-backed analysis: book → best → inaccuracy → mistake → blunder.
            </p>
          </div>
        </div>
        {opening && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span>Opening detected: <span className="text-foreground font-medium">{opening.eco} · {opening.name}</span></span>
          </div>
        )}
        <Button onClick={runReview} className="w-full">
          <Sparkles className="h-4 w-4 mr-2" /> Run Coach Review
        </Button>
      </div>
    );
  }

  if (loading) {
    const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
    return (
      <div className="rounded-2xl border border-border/40 bg-card/80 p-8 text-center space-y-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        <div className="space-y-2">
          <p className="text-sm text-foreground font-medium">
            {progress.phase === "engine" ? "Analysing every move with Stockfish…" : "Coach is summarising the key moments…"}
          </p>
          {progress.phase === "engine" && progress.total > 0 && (
            <>
              <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{progress.done} / {progress.total} moves</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="space-y-4">
      {/* Accuracy + counts */}
      {accuracy && classified && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Accuracy White</p>
            <p className="text-2xl font-display font-bold text-foreground">{accuracy.w}%</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Accuracy Black</p>
            <p className="text-2xl font-display font-bold text-foreground">{accuracy.b}%</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card/80 p-5">
        <div className="flex items-start gap-3">
          <Trophy className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="font-display text-base font-bold text-foreground mb-1">Game Summary</h3>
            <p className="text-sm text-foreground/90 leading-relaxed">{review.summary}</p>
          </div>
        </div>
      </div>

      {/* Opening review */}
      <div className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Opening Review</h4>
          {opening && <span className="text-[10px] font-mono text-muted-foreground ml-auto">{opening.eco}</span>}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{review.opening_review}</p>
      </div>

      {/* Key moments — these are SOURCED FROM ENGINE, AI only adds comment */}
      {review.key_moments.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card/80 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Key Moments</h4>
          </div>
          <ul className="space-y-2">
            {review.key_moments.map((m, i) => (
              <li key={i} className="text-xs sm:text-sm flex gap-2">
                <span className={`shrink-0 px-2 py-0.5 rounded-md border text-[10px] font-medium uppercase tracking-wide ${VERDICT_STYLES[m.verdict] ?? "text-muted-foreground bg-muted/40 border-border/40"}`}>
                  {VERDICT_LABEL[m.verdict as Verdict] ?? m.verdict}
                </span>
                <span className="text-foreground/90">
                  <span className="font-mono text-muted-foreground mr-1">#{m.move_number}{m.san ? ` ${m.san}` : ""}</span>
                  {m.comment}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-move breakdown with MultiPV top variants */}
      {classified && classified.length > 0 && (
        <details className="rounded-xl border border-border/40 bg-card/80 p-4 group">
          <summary className="flex items-center gap-2 cursor-pointer select-none list-none">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground flex-1">All moves & top engine lines</h4>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground group-open:hidden">Expand</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden group-open:inline">Hide</span>
          </summary>
          <ul className="mt-3 space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {classified.map((m) => {
              const formatEval = (cp: number, mate: number | null) => {
                if (mate != null) return `M${Math.abs(mate)}${mate < 0 ? "-" : ""}`;
                const pawns = cp / 100;
                return (pawns >= 0 ? "+" : "") + pawns.toFixed(2);
              };
              return (
                <li key={m.ply} className="text-xs border border-border/30 rounded-lg p-2 bg-background/40">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-muted-foreground w-10 shrink-0">
                      {m.moveNumber}{m.color === "w" ? "." : "…"}
                    </span>
                    <span className="font-mono font-bold text-foreground">{m.san}</span>
                    <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-medium uppercase tracking-wide ${VERDICT_STYLES[m.verdict] ?? "text-muted-foreground bg-muted/40 border-border/40"}`}>
                      {VERDICT_LABEL[m.verdict]}
                    </span>
                    {m.cpLoss > 5 && m.verdict !== "book" && m.verdict !== "brilliant" && (
                      <span className="text-[10px] text-muted-foreground font-mono">−{(m.cpLoss / 100).toFixed(2)}</span>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      eval {formatEval(m.evalAfter, null)}
                    </span>
                  </div>
                  {m.topLines && m.topLines.length > 0 && m.verdict !== "best" && m.verdict !== "book" && (
                    <ol className="mt-1.5 space-y-0.5 pl-12">
                      {m.topLines.map((line, idx) => (
                        <li key={idx} className="flex items-baseline gap-2 font-mono text-[11px]">
                          <span className="text-muted-foreground w-4">{idx + 1}.</span>
                          <span className={`shrink-0 w-12 ${idx === 0 ? "text-emerald-300" : "text-muted-foreground"}`}>
                            {formatEval(line.eval, line.mate)}
                          </span>
                          <span className="text-foreground/90 truncate">{line.pvSan.join(" ")}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {/* Repertoire suggestions */}
      {review.repertoire_suggestions.length > 0 && (
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Repertoire Suggestions</h4>
          </div>
          <ul className="space-y-2">
            {review.repertoire_suggestions.map((r, i) => (
              <li key={i} className="text-xs sm:text-sm flex gap-2">
                <span className="font-mono font-bold text-primary shrink-0 min-w-[3ch]">{r.san}</span>
                <span className="text-foreground/90">{r.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next focus */}
      <div className="rounded-xl border border-border/40 bg-card/80 p-4">
        <div className="flex items-start gap-2">
          <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Focus next game</h4>
            <p className="text-sm text-foreground/90">{review.next_focus}</p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {opening?.trainerId && (
          <Button asChild variant="outline" className="border-primary/40 hover:bg-primary/5">
            <Link to={`/openings?id=${opening.trainerId}`}>
              <BookOpen className="h-4 w-4 mr-2" /> Practice in Trainer
            </Link>
          </Button>
        )}
        {savedLessonId ? (
          <Button asChild variant="default">
            <Link to="/learn?tab=my-lessons">
              <GraduationCap className="h-4 w-4 mr-2" /> Open My Lesson
            </Link>
          </Button>
        ) : (
          <Button onClick={generateLesson} disabled={generating || !opening}>
            {generating
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building lesson…</>
              : <><Sparkles className="h-4 w-4 mr-2" /> Generate Personalised Lesson</>}
          </Button>
        )}
      </div>
    </div>
  );
}
