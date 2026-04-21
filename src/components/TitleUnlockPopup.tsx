import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getTitleByKey, type ChessTitle } from "@/lib/titles";
import { Trophy } from "lucide-react";

interface TitleUnlockPopupProps {
  titleKey: string | null;
  onDismiss: () => void;
}

/** Cinematic full-screen popup shown when a player unlocks a new title. */
export default function TitleUnlockPopup({ titleKey, onDismiss }: TitleUnlockPopupProps) {
  const [title, setTitle] = useState<ChessTitle | null>(null);

  useEffect(() => {
    setTitle(getTitleByKey(titleKey));
  }, [titleKey]);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!title) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [title, onDismiss]);

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-md w-[92%] mx-auto rounded-2xl border-2 ${title.borderColor} ${title.bgColor} backdrop-blur-xl p-8 text-center overflow-hidden`}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 30px hsl(var(--primary) / 0.2)",
                  "0 0 80px hsl(var(--primary) / 0.5)",
                  "0 0 30px hsl(var(--primary) / 0.2)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative space-y-3">
              <motion.div
                className="flex items-center justify-center gap-2 text-primary"
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.3em] font-semibold">Title Unlocked</span>
                <Trophy className="h-5 w-5" />
              </motion.div>
              <motion.div
                className="text-7xl"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {title.icon}
              </motion.div>
              <motion.h2
                className={`font-display text-3xl font-bold ${title.color}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {title.label}
              </motion.h2>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You are now <span className={`font-semibold ${title.color}`}>{title.fullName}</span>
              </motion.p>
              <motion.p
                className="text-[11px] text-muted-foreground/70 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Tap anywhere to dismiss
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
