import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, PhoneOff, Volume2, User } from "lucide-react";

interface KnockSession {
  id: string;
  peerName: string;
  status: "connecting" | "connected" | "ended";
}

export default function TheDoorButton() {
  const [session, setSession] = useState<KnockSession | null>(null);
  const [knocking, setKnocking] = useState(false);

  const knock = useCallback(() => {
    setKnocking(true);
    // Simulate finding a peer — in production this would use Supabase Realtime
    setTimeout(() => {
      setKnocking(false);
      setSession({
        id: Math.random().toString(36).slice(2),
        peerName: "ChessFriend_" + Math.floor(Math.random() * 999),
        status: "connected",
      });
    }, 2500);
  }, []);

  const endCall = useCallback(() => {
    setSession(null);
  }, []);

  if (session) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-24 right-4 z-50 w-72 rounded-2xl border border-emerald-500/30 bg-[hsl(220_15%_6%)]/95 backdrop-blur-xl p-4 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
            <Volume2 className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-300">Connected</p>
            <p className="text-xs text-emerald-300/60">Voice-only · 60s chat</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-3">
          <User className="h-4 w-4 text-emerald-400/70" />
          <span className="text-xs text-emerald-200">{session.peerName}</span>
        </div>
        <button
          onClick={endCall}
          className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <PhoneOff className="h-3.5 w-3.5" />
          End Chat
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={knock}
      disabled={knocking}
      className="fixed bottom-24 right-4 z-50 h-12 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center gap-2 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
      title="Knock to chat with a random chess player (voice only)"
    >
      <DoorOpen className="h-4 w-4" />
      <AnimatePresence mode="wait">
        {knocking ? (
          <motion.span
            key="knocking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Knocking…
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Knock
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
