// Coach Review panel — shown on the GameReview page after a finished online game.
// Pulls a structured AI review (opening assessment + key moments + repertoire
// suggestions), and exposes two CTAs: open the matching opening in the trainer,
// and generate a personalised lesson that gets saved to "My Lessons" in /learn.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, BookOpen, GraduationCap, Lightbulb, Target, Trophy, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { OpeningEntry } from "@/lib/openings-detector";

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

const VERDICT_STYLES: Record<string, string> = {
  brilliant:   "text-amber-300 bg-amber-500/10 border-amber-500/30",
  good:        "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  inaccuracy:  "text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
  mistake:     "text-orange-300 bg-orange-500/10 border-orange-500/30",
  blunder:     "text-red-300 bg-red-500/10 border-red-500/30",
};

export default function CoachReviewPanel({
  pgn, myColor, result, endReason, opening, myRating, opponentRating, sourceGameId,
}: Props) {
  const [review, setReview] = useState<CoachReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savedLessonId, setSavedLessonId] = useState<string | null>(null);

  const runReview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("coach-game-review", {
        body: {
          pgn, myColor, result, endReason,
          openingName: opening?.name,
          openingEco: opening?.eco,
          myRating, opponentRating,
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
              Get a personalised breakdown of this game and repertoire tips.
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
    return (
      <div className="rounded-2xl border border-border/40 bg-card/80 p-8 text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Coach is reviewing your game…</p>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="space-y-4">
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

      {/* Key moments */}
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
                  {m.verdict}
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
