import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ChessBoard4DProps {
  enabled: boolean;
  children: ReactNode;
}

/**
 * Wraps the chess board in a 4D visual effect — stacked translucent layers
 * with neon glow and 3D perspective. Pure visual, no gameplay changes.
 */
export default function ChessBoard4D({ enabled, children }: ChessBoard4DProps) {
  if (!enabled) return <>{children}</>;

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      {/* Ghost layer 3 (furthest back) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, rotateX: 0, translateZ: 0 }}
        animate={{ opacity: 0.08, rotateX: 8, translateZ: -120, translateY: -36 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="w-full h-full rounded-lg border border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_30px_rgba(0,255,255,0.08)]">
          {children}
        </div>
      </motion.div>

      {/* Ghost layer 2 */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, rotateX: 0, translateZ: 0 }}
        animate={{ opacity: 0.15, rotateX: 5, translateZ: -70, translateY: -20 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="w-full h-full rounded-lg border border-purple-500/20 bg-purple-500/5 shadow-[0_0_25px_rgba(168,85,247,0.1)]">
          {children}
        </div>
      </motion.div>

      {/* Ghost layer 1 (closest ghost) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0, rotateX: 0, translateZ: 0 }}
        animate={{ opacity: 0.2, rotateX: 3, translateZ: -30, translateY: -8 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="w-full h-full rounded-lg border border-blue-500/25 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.12)]">
          {children}
        </div>
      </motion.div>

      {/* Main board (interactive) */}
      <motion.div
        initial={{ rotateX: 0 }}
        animate={{ rotateX: 2 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative z-10"
      >
        <div className="relative">
          {/* Neon glow ring */}
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-blue-500/20 blur-sm animate-pulse" />
          <div className="relative">
            {children}
          </div>
        </div>
      </motion.div>

      {/* Ambient particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/40"
          initial={{ opacity: 0, x: `${20 + i * 12}%`, y: `${10 + i * 15}%` }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [`${10 + i * 15}%`, `${-5 + i * 10}%`],
            x: [`${20 + i * 12}%`, `${25 + i * 11}%`],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
          style={{ transformStyle: "preserve-3d", translateZ: -10 - i * 20 }}
        />
      ))}
    </div>
  );
}
