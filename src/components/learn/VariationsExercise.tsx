import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, GitBranch } from "lucide-react";
import InteractiveBoard from "./InteractiveBoard";
import type { LessonVariation } from "@/lib/lesson-moves";

interface Props {
  variations: LessonVariation[];
  fallbackFen?: string;
}

export default function VariationsExercise({ variations, fallbackFen }: Props) {
  const [active, setActive] = useState(0);

  // Reset selection when the lesson (and therefore the variations array) changes
  useEffect(() => {
    setActive(0);
  }, [variations]);

  if (variations.length === 0) return null;

  const single = variations.length === 1;
  const current = variations[active] ?? variations[0];

  // Single variation — render board directly without picker chrome
  if (single) {
    return (
      <div>
        {current.name && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
            {current.name}
          </p>
        )}
        <InteractiveBoard
          startFen={current.startFen || fallbackFen}
          moves={current.moves}
        />
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

      {/* Desktop: side-by-side */}
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-5">
        {/* Sidebar list (lg+) */}
        <aside className="hidden lg:flex lg:flex-col">
          <div className="flex items-center gap-1.5 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            Variations
          </div>
          <ul className="space-y-1.5">
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
            Pick a variation to load it on the board.
          </p>
        </aside>

        {/* Active board */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {/* Active variation title (visible on all sizes) */}
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
              <InteractiveBoard
                startFen={current.startFen || fallbackFen}
                moves={current.moves}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
