import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StickyJoinBar() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem("mc-sticky-join-dismissed") === "1"
  );

  useEffect(() => {
    if (user || dismissed) return;
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const trigger = document.body.scrollHeight * 0.55;
      setVisible(scrolled > trigger);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [user, dismissed]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    try { sessionStorage.setItem("mc-sticky-join-dismissed", "1"); } catch {}
  };

  if (user) return null;

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-5 z-50 max-w-md mx-auto"
        >
          <div className="relative rounded-2xl border border-primary/40 bg-background/95 backdrop-blur-xl shadow-glow-lg px-3 py-2.5 flex items-center gap-2.5">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[13px] font-bold text-foreground leading-tight">
                Join <span className="text-gradient-gold">MasterChess</span>
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                Free · 10s setup · no ads
              </div>
            </div>
            <Link
              to="/signup"
              className="shrink-0 ripple-btn rounded-lg bg-primary text-primary-foreground px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Create
            </Link>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
