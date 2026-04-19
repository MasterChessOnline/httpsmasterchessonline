import { useState, useEffect } from "react";
import { useAntiTilt, dismissTiltWarning } from "@/hooks/use-anti-tilt";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Coffee, Brain, X } from "lucide-react";

/**
 * Floating anti-tilt warning. Listens for losing streaks or rating drops
 * and surfaces a non-blocking modal with break / training / continue actions.
 */
const AntiTiltWatcher = () => {
  const tilt = useAntiTilt();
  const [shown, setShown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on auth pages or settings
  const isAuthPage = ["/login", "/signup", "/forgot-password", "/reset-password"].includes(location.pathname);

  useEffect(() => {
    if (isAuthPage) return;
    if (!tilt.isTilting) { setShown(null); return; }
    // Use reason as key so it only re-shows when condition changes
    const key = `${tilt.reason}-${tilt.consecutiveLosses}-${tilt.ratingDrop}`;
    if (shown !== key) setShown(key);
  }, [tilt, isAuthPage, shown]);

  if (!tilt.isTilting || !shown || isAuthPage) return null;

  const close = () => { setShown(null); dismissTiltWarning(30); };
  const goTraining = () => { close(); navigate("/training"); };
  const goBreak = () => { close(); navigate("/dashboard"); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center pointer-events-none p-4"
      >
        <motion.div
          initial={{ y: 40, scale: 0.96, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 40, scale: 0.96, opacity: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-orange-500/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-orange-500/20 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base font-bold text-foreground">You might be tilting</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tilt.reason === "losses"
                  ? `You've lost ${tilt.consecutiveLosses} games in a row. Your performance is dropping.`
                  : `You're down ${tilt.ratingDrop} rating points this session. Time for a reset.`}
              </p>
            </div>
            <button onClick={close} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button onClick={goBreak} variant="outline" size="sm" className="gap-2">
              <Coffee className="w-4 h-4" /> Take a break
            </Button>
            <Button onClick={goTraining} variant="default" size="sm" className="gap-2">
              <Brain className="w-4 h-4" /> Quick training
            </Button>
            <Button onClick={close} variant="ghost" size="sm">
              Continue anyway
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            You can disable tilt warnings in Settings → Notifications.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AntiTiltWatcher;
