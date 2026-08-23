import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * A live online game is the single most valuable thing a player can lose by
 * navigating away. If the profile still points at an active game, offer a
 * one-tap way back from anywhere on the site.
 */
export default function LiveGameResumeBar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const [live, setLive] = useState(false);
  const gameId = profile?.current_game_id ?? null;

  useEffect(() => {
    if (!user || !gameId) {
      setLive(false);
      return;
    }
    let cancelled = false;

    const check = async () => {
      const { data } = await supabase
        .from("online_games")
        .select("id, status")
        .eq("id", gameId)
        .maybeSingle();
      if (!cancelled) setLive(data?.status === "active");
    };

    void check();
    const t = setInterval(check, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user, gameId]);

  const onGamePage = location.pathname.startsWith("/play");
  const show = live && !onGamePage;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,26rem)]"
        >
          <Link
            to="/play/online"
            className="flex items-center gap-3 rounded-xl border border-primary/40 bg-card/95 backdrop-blur px-4 py-3 shadow-lg"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/30">
              <Swords className="h-4 w-4 text-primary" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-foreground">Your game is live</span>
              <span className="block text-xs text-muted-foreground truncate">
                Tap to return before your clock runs out
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-primary shrink-0" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
