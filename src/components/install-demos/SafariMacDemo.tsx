import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

/**
 * Animated demo (acts like a GIF) showing the Safari macOS flow:
 *   1. Cursor moves up to the menu bar
 *   2. Clicks "File"
 *   3. Dropdown opens and "Add to Dock…" highlights
 * Loops every ~5s using Framer Motion keyframes.
 */
export default function SafariMacDemo() {
  return (
    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-900 to-black shadow-inner">
      {/* macOS menu bar */}
      <div className="absolute inset-x-0 top-0 h-6 bg-black/70 backdrop-blur border-b border-white/10 flex items-center gap-3 px-2 text-[10px] text-white/80 font-medium">
        <span className="text-white"></span>
        <span className="font-semibold">Safari</span>
        <motion.span
          className="relative px-1.5 py-0.5 rounded"
          animate={{
            backgroundColor: [
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0)",
              "rgba(251,191,36,0.25)",
              "rgba(251,191,36,0.25)",
              "rgba(255,255,255,0)",
            ],
            color: ["#ffffffcc", "#ffffffcc", "#fde68a", "#fde68a", "#ffffffcc"],
          }}
          transition={{ duration: 5, times: [0, 0.35, 0.45, 0.85, 1], repeat: Infinity }}
        >
          File
        </motion.span>
        <span>Edit</span>
        <span>View</span>
        <span>History</span>
        <span>Bookmarks</span>
        <span>Window</span>
      </div>

      {/* Dropdown menu under "File" */}
      <motion.div
        className="absolute left-[44px] top-6 w-[170px] rounded-md border border-white/15 bg-zinc-800/95 backdrop-blur-md shadow-2xl overflow-hidden text-[10px] text-white/85"
        initial={{ opacity: 0, y: -4, scale: 0.96 }}
        animate={{
          opacity: [0, 0, 1, 1, 0],
          y: [-4, -4, 0, 0, -4],
          scale: [0.96, 0.96, 1, 1, 0.96],
        }}
        transition={{ duration: 5, times: [0, 0.4, 0.5, 0.85, 0.95], repeat: Infinity }}
        style={{ transformOrigin: "top left" }}
      >
        <div className="px-2 py-1 text-white/50">New Tab&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⌘T</div>
        <div className="px-2 py-1 text-white/50">New Window&nbsp;&nbsp;⌘N</div>
        <div className="h-px bg-white/10" />
        <motion.div
          className="px-2 py-1 flex items-center justify-between rounded-sm"
          animate={{
            backgroundColor: [
              "rgba(0,0,0,0)",
              "rgba(0,0,0,0)",
              "rgba(0,0,0,0)",
              "rgba(59,130,246,0.85)",
              "rgba(59,130,246,0.85)",
              "rgba(0,0,0,0)",
            ],
            color: ["#ffffffd9", "#ffffffd9", "#ffffffd9", "#ffffff", "#ffffff", "#ffffffd9"],
          }}
          transition={{ duration: 5, times: [0, 0.5, 0.6, 0.7, 0.85, 0.95], repeat: Infinity }}
        >
          <span className="font-semibold">Add to Dock…</span>
          <span className="text-white/50">⌘D</span>
        </motion.div>
        <div className="px-2 py-1 text-white/50">Share</div>
        <div className="px-2 py-1 text-white/50">Print&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⌘P</div>
      </motion.div>

      {/* Faux Safari window content */}
      <div className="absolute inset-x-3 top-9 bottom-3 rounded-md bg-gradient-to-br from-amber-500/10 via-amber-300/5 to-black border border-white/5 flex items-center justify-center">
        <div className="text-amber-300/80 font-display tracking-[0.3em] text-[11px]">MASTERCHESS.LIVE</div>
      </div>

      {/* Animated cursor */}
      <motion.div
        className="absolute pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        animate={{
          left: ["55%", "55%", "12.5%", "12.5%", "13%", "30%", "30%"],
          top: ["70%", "70%", "8px", "8px", "62px", "62px", "62px"],
        }}
        transition={{ duration: 5, times: [0, 0.1, 0.4, 0.5, 0.6, 0.85, 1], repeat: Infinity, ease: "easeInOut" }}
      >
        <MousePointer2 className="h-4 w-4 fill-white text-zinc-900" />
      </motion.div>

      {/* Click ripple at "File" */}
      <motion.div
        className="absolute h-4 w-4 rounded-full bg-amber-300/60 pointer-events-none"
        style={{ left: "11%", top: "2px" }}
        animate={{ scale: [0, 0, 2.4, 0], opacity: [0, 0, 0.7, 0] }}
        transition={{ duration: 5, times: [0, 0.42, 0.5, 0.55], repeat: Infinity }}
      />
      {/* Click ripple at "Add to Dock" */}
      <motion.div
        className="absolute h-4 w-4 rounded-full bg-emerald-300/60 pointer-events-none"
        style={{ left: "28%", top: "60px" }}
        animate={{ scale: [0, 0, 2.4, 0], opacity: [0, 0, 0.7, 0] }}
        transition={{ duration: 5, times: [0, 0.82, 0.88, 0.94], repeat: Infinity }}
      />
    </div>
  );
}
