import { motion } from "framer-motion";
import { Share, Plus } from "lucide-react";

/**
 * Animated demo (acts like a GIF) showing the iOS Safari install flow:
 *   1. Tap the Share icon in Safari
 *   2. Native share sheet rises
 *   3. "Add to Home Screen" row highlights and gets tapped
 * Loops every ~5s.
 */
export default function IOSDemo() {
  return (
    <div className="relative w-full aspect-[9/16] max-h-[260px] mx-auto rounded-[28px] overflow-hidden border-[3px] border-zinc-800 bg-gradient-to-b from-zinc-900 to-black shadow-2xl">
      {/* iPhone notch */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 h-3 w-14 bg-black rounded-full z-20" />

      {/* Status bar */}
      <div className="absolute top-0 inset-x-0 h-5 flex items-center justify-between px-3 text-[8px] text-white/80 z-10">
        <span>9:41</span>
        <span>5G</span>
      </div>

      {/* Faux site content */}
      <div className="absolute inset-x-0 top-5 bottom-9 bg-gradient-to-br from-amber-500/10 to-black flex items-center justify-center">
        <div className="text-amber-300/80 font-display tracking-[0.2em] text-[9px]">MASTERCHESS</div>
      </div>

      {/* Safari bottom toolbar */}
      <div className="absolute inset-x-0 bottom-0 h-9 bg-zinc-900/90 backdrop-blur border-t border-white/10 flex items-center justify-around text-white/70 z-10">
        <span className="text-[10px]">‹</span>
        <span className="text-[10px]">›</span>
        <motion.div
          className="relative h-6 w-6 rounded-md flex items-center justify-center"
          animate={{
            backgroundColor: [
              "rgba(255,255,255,0)",
              "rgba(251,191,36,0.35)",
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0)",
            ],
          }}
          transition={{ duration: 5, times: [0, 0.15, 0.3, 1], repeat: Infinity }}
        >
          <Share className="h-3 w-3" />
        </motion.div>
        <span className="text-[10px]">⎘</span>
        <span className="text-[10px]">⊟</span>
      </div>

      {/* Share sheet sliding up */}
      <motion.div
        className="absolute inset-x-1.5 bottom-1.5 rounded-2xl bg-zinc-800/95 backdrop-blur border border-white/10 p-1.5 z-30 shadow-2xl"
        initial={{ y: "110%", opacity: 0 }}
        animate={{
          y: ["110%", "110%", "0%", "0%", "110%"],
          opacity: [0, 0, 1, 1, 0],
        }}
        transition={{ duration: 5, times: [0, 0.2, 0.32, 0.85, 0.95], repeat: Infinity, ease: "easeOut" }}
      >
        <div className="h-0.5 w-6 mx-auto rounded-full bg-white/30 mb-1.5" />
        <div className="space-y-0.5 text-[9px] text-white/85">
          <div className="px-1.5 py-1 rounded">Copy</div>
          <motion.div
            className="px-1.5 py-1 rounded flex items-center justify-between"
            animate={{
              backgroundColor: [
                "rgba(0,0,0,0)",
                "rgba(0,0,0,0)",
                "rgba(0,0,0,0)",
                "rgba(251,191,36,0.4)",
                "rgba(251,191,36,0.4)",
                "rgba(0,0,0,0)",
              ],
              color: ["#ffffffd9", "#ffffffd9", "#ffffffd9", "#fde68a", "#fde68a", "#ffffffd9"],
            }}
            transition={{ duration: 5, times: [0, 0.5, 0.6, 0.7, 0.85, 0.95], repeat: Infinity }}
          >
            <span className="font-semibold flex items-center gap-1">
              <Plus className="h-2.5 w-2.5" /> Add to Home Screen
            </span>
            <span className="text-white/40">＋</span>
          </motion.div>
          <div className="px-1.5 py-1 rounded">Markup</div>
        </div>
      </motion.div>

      {/* Tap dot on Share icon */}
      <motion.div
        className="absolute h-5 w-5 rounded-full bg-amber-300/60 pointer-events-none z-40"
        style={{ left: "calc(50% - 10px)", bottom: "12px" }}
        animate={{ scale: [0, 0, 1.6, 0], opacity: [0, 0, 0.8, 0] }}
        transition={{ duration: 5, times: [0, 0.15, 0.22, 0.3], repeat: Infinity }}
      />
      {/* Tap dot on Add to Home Screen */}
      <motion.div
        className="absolute h-5 w-5 rounded-full bg-emerald-300/60 pointer-events-none z-40"
        style={{ left: "calc(50% - 10px)", bottom: "60px" }}
        animate={{ scale: [0, 0, 1.6, 0], opacity: [0, 0, 0.8, 0] }}
        transition={{ duration: 5, times: [0, 0.72, 0.8, 0.86], repeat: Infinity }}
      />
    </div>
  );
}
