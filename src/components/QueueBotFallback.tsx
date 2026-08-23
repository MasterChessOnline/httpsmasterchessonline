// QUEUE BOT FALLBACK — plan P1 (retention).
//
// The queue is often empty. Instead of letting the player stare at a spinner
// until they leave, we offer an honest warm-up game against a clearly labelled
// bot. Nothing is faked: the card says it is a bot, and it says the queue is
// left when they start it. Behind the `bot_fallback` feature flag.
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, ChevronRight } from "lucide-react";
import { useFeatureFlag } from "@/lib/flags";
import { trackRetention } from "@/lib/funnel";
import { ONLINE_BOTS } from "@/lib/online-bots-data";

/** Three honest warm-up levels: easy / medium / hard. */
function pickBots() {
  const sorted = [...ONLINE_BOTS].sort((a, b) => a.rating - b.rating);
  if (sorted.length === 0) return [];
  const at = (frac: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * frac))];
  const picks = [sorted[0], at(0.4), at(0.75)];
  const seen = new Set<string>();
  return picks.filter((b) => b && !seen.has(b.id) && seen.add(b.id));
}

export default function QueueBotFallback({
  waitedSeconds,
  className = "",
}: {
  waitedSeconds: number;
  className?: string;
}) {
  const enabled = useFeatureFlag("bot_fallback", true);
  const bots = useMemo(pickBots, []);

  if (!enabled || bots.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-primary/25 bg-card/70 p-4 text-left ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold">Warm up against a bot</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            No opponent yet after {Math.max(1, Math.round(waitedSeconds / 5) * 5)}s. These are
            computer opponents — starting one leaves the queue, and you can search again right after.
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {bots.map((b, i) => (
          <Link
            key={b.id}
            to={`/bot/${b.id}`}
            onClick={() =>
              trackRetention("bot_fallback_start", {
                bot_id: b.id,
                bot_rating: b.rating,
                level: i === 0 ? "easy" : i === 1 ? "medium" : "hard",
                waited_seconds: Math.round(waitedSeconds),
              })
            }
            className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="text-base leading-none">{b.flag}</span>
              <span className="truncate text-sm font-medium">{b.name}</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                bot
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              {b.rating}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
