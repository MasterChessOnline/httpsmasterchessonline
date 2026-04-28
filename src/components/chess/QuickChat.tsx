import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_MESSAGES = [
  "Good luck! 🍀",
  "Have fun! 😊",
  "Good game! 👏",
  "Well played! 💪",
  "Nice move! 🔥",
  "Thanks! 🙏",
  "Sorry! 😅",
  "Bye! 👋",
];

const EMOJIS = ["👍", "👎", "😂", "😮", "😢", "🔥", "💀", "🤝", "🏆", "♟️", "👑", "💯"];

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  cooldownMs?: number;
}

export default function QuickChat({ onSend, disabled, cooldownMs = 1500 }: Props) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [cooling, setCooling] = useState(false);
  const lastSentRef = useRef(0);

  const handle = (msg: string) => {
    if (disabled || cooling) return;
    const now = Date.now();
    if (now - lastSentRef.current < cooldownMs) {
      setCooling(true);
      setTimeout(() => setCooling(false), cooldownMs - (now - lastSentRef.current));
      return;
    }
    lastSentRef.current = now;
    setCooling(true);
    setTimeout(() => setCooling(false), cooldownMs);
    onSend(msg);
    setShowEmojis(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {QUICK_MESSAGES.slice(0, 4).map((m) => (
          <button
            key={m}
            onClick={() => handle(m)}
            disabled={disabled || cooling}
            className="text-[10px] px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 border border-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {m}
          </button>
        ))}
        <button
          onClick={() => setShowEmojis((v) => !v)}
          disabled={disabled}
          className="text-[10px] px-2 py-1 rounded-md bg-muted hover:bg-muted/70 border border-border/50 disabled:opacity-40 inline-flex items-center gap-1"
          title="More"
        >
          <Smile className="h-3 w-3" />
        </button>
      </div>
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="grid grid-cols-6 gap-1 p-1.5 rounded-md bg-muted/40 border border-border/40"
          >
            {QUICK_MESSAGES.slice(4).map((m) => (
              <button
                key={m}
                onClick={() => handle(m)}
                disabled={disabled || cooling}
                className="text-[10px] px-1.5 py-1 rounded bg-background/60 hover:bg-primary/10 border border-border/30 disabled:opacity-40 col-span-3 truncate"
              >
                {m}
              </button>
            ))}
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => handle(e)}
                disabled={disabled || cooling}
                className="text-base p-1 rounded hover:bg-primary/10 disabled:opacity-40 transition"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
