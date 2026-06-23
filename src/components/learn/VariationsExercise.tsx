import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chess } from "chess.js";
import { ChevronRight, GitBranch, Sparkles, Loader2 } from "lucide-react";
import InteractiveBoard from "./InteractiveBoard";
import NikolaCoachAvatar from "./NikolaCoachAvatar";
import { useNikolaVoice } from "@/hooks/use-nikola-voice";
import { supabase } from "@/integrations/supabase/client";
import type { LessonVariation } from "@/lib/lesson-moves";

interface Props {
  variations: LessonVariation[];
  fallbackFen?: string;
  orientation?: "white" | "black";
  courseId?: string;
  courseTitle?: string;
}

interface AIExplanations {
  summary: string;
  moves: { san: string; explanation: string }[];
}

/**
 * Strip leading move-number prefixes (e.g. "13.", "13...") and an echoed SAN
 * from the start of an explanation, plus any leading separators. Prevents
 * the coach from saying "b5. 13.b5 — break!" instead of just "break!".
 */
function stripMovePrefix(san: string, text: string): string {
  if (!text) return "";
  const sanEsc = san.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let out = text.trim();
  // Drop a leading "13." / "13..." / "13. " optionally followed by the SAN.
  out = out.replace(new RegExp(`^\\s*\\d+\\s*\\.{1,3}\\s*(?:${sanEsc})?\\s*`, "i"), "");
  // Drop a bare leading SAN echo: "b5", "Nf3", "O-O".
  out = out.replace(new RegExp(`^\\s*${sanEsc}\\b\\s*`, "i"), "");
  // Drop common leading separators left behind.
  out = out.replace(/^[\s\-—–:,.]+/, "");
  return out.trim();
}

export default function VariationsExercise({ variations, fallbackFen, orientation = "white", courseId, courseTitle }: Props) {
  const [active, setActive] = useState(0);
  const [ai, setAi] = useState<AIExplanations | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const lastSpokenRef = useRef<string>("");
  const voice = useNikolaVoice();

  // Reset active variation when variations array (lesson) changes
  useEffect(() => {
    setActive(0);
  }, [variations]);

  if (variations.length === 0) return null;

  const current = variations[active] ?? variations[0];
  const variationId = `${active}-${current.name || "var"}`.slice(0, 100);

  // Pre-compute FEN per move so the AI gets full context (not strictly needed; we send SAN).
  const movesPayload = useMemo(() => {
    try {
      const chess = new Chess(current.startFen || fallbackFen || undefined);
      return current.moves.map((m) => {
        try { chess.move(m.san); } catch { /* ignore */ }
        return { san: m.san, fen: chess.fen() };
      });
    } catch {
      return current.moves.map((m) => ({ san: m.san }));
    }
  }, [current, fallbackFen]);

  // Fetch AI commentary whenever the active variation changes.
  useEffect(() => {
    let cancelled = false;
    setAi(null);
    setTranscript("");
    lastSpokenRef.current = "";

    if (!courseId || current.moves.length === 0) return;

    (async () => {
      setAiLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("explain-variation", {
          body: {
            courseId,
            variationId,
            courseTitle,
            variationName: current.name,
            startFen: current.startFen || fallbackFen,
            moves: movesPayload,
          },
        });
        if (cancelled) return;
        if (error || !data) return;
        const result = data as AIExplanations;
        setAi(result);

        // Speak the summary intro for the variation
        if (result.summary && !voice.muted) {
          const cleanSummary = stripMovePrefix("", result.summary);
          const intro = `${current.name ? current.name + ". " : ""}${cleanSummary}`.trim();
          setTranscript(intro);
          lastSpokenRef.current = intro;
          voice.speakClipOrText(intro, { courseId: courseId!, variationId }).catch(() => { /* ignore */ });
        }
      } catch { /* ignore */ }
      finally {
        if (!cancelled) setAiLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, courseId, variationId]);

  // AI explanations array aligned to current.moves (cleaned of duplicate SAN/turn-number prefixes).
  const moveExplanations = useMemo(() => {
    if (!ai?.moves) return undefined;
    return current.moves.map((m, i) => {
      const raw = ai.moves[i]?.san === m.san ? ai.moves[i].explanation : (ai.moves[i]?.explanation || m.explanation);
      return stripMovePrefix(m.san, raw || "");
    });
  }, [ai, current.moves]);

  const handleMoveIndexChange = useCallback((
    moveIndex: number,
    info: { san: string | null; explanation: string | null; totalMoves: number }
  ) => {
    if (!info.san || moveIndex === 0) return;
    const cleaned = stripMovePrefix(info.san, info.explanation || "");
    const line = cleaned ? `${info.san} — ${cleaned}` : info.san;
    if (line === lastSpokenRef.current) return;
    lastSpokenRef.current = line;
    setTranscript(line);
    voice.speakClipOrText(line, {
      courseId: courseId || "unknown",
      variationId,
      moveIndex: moveIndex - 1,
      san: info.san,
    }).catch(() => { /* ignore */ });
  }, [voice, courseId, variationId]);

  const replayLast = () => {
    if (!lastSpokenRef.current) return;
    voice.speak(lastSpokenRef.current).catch(() => { /* ignore */ });
  };

  const replayLast = () => {
    if (!lastSpokenRef.current) return;
    voice.speak(lastSpokenRef.current).catch(() => { /* ignore */ });
  };

  const single = variations.length === 1;

  // ── Render ────────────────────────────────────────────────────────────────
  const boardBlock = (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
      >
        {!single && (
          <div className="mb-3 text-center">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Variation {active + 1} of {variations.length}
            </p>
            {current.name && (
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {current.name}
              </p>
            )}
          </div>
        )}
        {single && current.name && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
            {current.name}
          </p>
        )}
        <InteractiveBoard
          startFen={current.startFen || fallbackFen}
          moves={current.moves}
          orientation={orientation}
          moveExplanations={moveExplanations}
          onMoveIndexChange={handleMoveIndexChange}
        />
      </motion.div>
    </AnimatePresence>
  );

  const coachBlock = (
    <div className="rounded-xl border border-border/50 bg-card/40 p-4 flex flex-col items-center gap-3">
      <NikolaCoachAvatar voice={voice} transcript={transcript || undefined} onReplay={lastSpokenRef.current ? replayLast : undefined} />
      {aiLoading && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Nikola is preparing the analysis…
        </div>
      )}
      {!aiLoading && ai?.summary && (
        <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-relaxed">
          <Sparkles className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
          <span>Click "Next move" — Nikola will explain every move out loud.</span>
        </div>
      )}
    </div>
  );

  // Single variation — board + Nikola side-by-side
  if (single) {
    return (
      <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-5">
        <div className="min-w-0">{boardBlock}</div>
        <div className="mt-5 lg:mt-0">{coachBlock}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-3 sm:p-4">
      {/* Mobile / tablet: horizontal pill row of variations */}
      <div className="lg:hidden mb-4">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <GitBranch className="w-3.5 h-3.5 text-primary" />
          Variations ({variations.length})
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          {variations.map((v, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                active === i
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-foreground border-border/50 hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <span className="opacity-70 mr-1.5">{i + 1}.</span>
              {v.name || `Variation ${i + 1}`}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: list | board | coach */}
      <div className="lg:grid lg:grid-cols-[200px_1fr_240px] lg:gap-5">
        {/* Sidebar list (lg+) */}
        <aside className="hidden lg:flex lg:flex-col">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            Variations
          </div>
          <ul className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {variations.map((v, i) => {
              const isActive = active === i;
              return (
                <li key={i}>
                  <button
                    onClick={() => setActive(i)}
                    className={`group w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-start gap-2 ${
                      isActive
                        ? "bg-primary/10 border-primary/40 text-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
                        : "bg-card/60 border-border/40 text-foreground/85 hover:border-primary/30 hover:bg-muted/40"
                    }`}
                  >
                    <span
                      className={`shrink-0 mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium leading-tight">
                        {v.name || `Variation ${i + 1}`}
                      </span>
                      <span className="block text-[11px] text-muted-foreground mt-0.5">
                        {v.moves.length} {v.moves.length === 1 ? "move" : "moves"}
                      </span>
                    </span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-[11px] text-muted-foreground/70 mt-4 leading-relaxed">
            Pick a variation — Nikola explains it move by move.
          </p>
        </aside>

        {/* Active board */}
        <div className="min-w-0">{boardBlock}</div>

        {/* Coach panel (desktop) */}
        <div className="hidden lg:block">{coachBlock}</div>
      </div>

      {/* Coach panel on mobile (below board) */}
      <div className="mt-5 lg:hidden">{coachBlock}</div>
    </div>
  );
}
