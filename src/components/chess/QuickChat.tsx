import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickChatProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const QUICK_MESSAGES = [
  { text: "Good luck! 🤝", emoji: "🤝" },
  { text: "Nice move! 🔥", emoji: "🔥" },
  { text: "Blunder! 😂", emoji: "😂" },
  { text: "GG! 🎉", emoji: "🎉" },
  { text: "Wow! 😮", emoji: "😮" },
  { text: "Oops! 😅", emoji: "😅" },
  { text: "Rematch? ⚔️", emoji: "⚔️" },
  { text: "Thanks! 👍", emoji: "👍" },
];

export default function QuickChat({ onSend, disabled = false }: QuickChatProps) {
  const [open, setOpen] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const handleSend = (msg: string) => {
    onSend(msg);
    setLastSent(msg);
    setTimeout(() => setLastSent(null), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="h-8 w-8 text-muted-foreground hover:text-primary"
        disabled={disabled}
      >
        <MessageCircle className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-48 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-xl p-2 z-50"
          >
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Chat</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {QUICK_MESSAGES.map((msg) => (
                <motion.button
                  key={msg.text}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(msg.text)}
                  disabled={disabled || lastSent === msg.text}
                  className={`text-[11px] px-2 py-1.5 rounded-lg transition-all duration-200 text-left ${
                    lastSent === msg.text
                      ? "bg-primary/20 text-primary"
                      : "bg-muted/20 hover:bg-muted/40 text-foreground/80"
                  }`}
                >
                  <span className="mr-1">{msg.emoji}</span>
                  {msg.text.replace(msg.emoji, "").trim()}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
