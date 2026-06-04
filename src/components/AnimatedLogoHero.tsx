import { motion } from "framer-motion";
import { Crown } from "lucide-react";

const PIECES = ["♔", "♕", "♖", "♗", "♘", "♙"];

/**
 * Massive cinematic MASTERCHESS.LIVE wordmark.
 * - Gold gradient sweep across the type
 * - Floating chess-piece particles
 * - GPU-only transforms (translate/scale/opacity) for 60fps on mobile
 */
export default function AnimatedLogoHero({ tagline }: { tagline?: string }) {
  return (
    <div className="relative w-full">
      {/* floating chess pieces — absolute, pointer-events-none */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {PIECES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute select-none text-primary/15 font-display"
            style={{
              left: `${(i * 17 + 6) % 100}%`,
              top: `${(i * 23) % 90}%`,
              fontSize: 28 + (i % 3) * 10,
              willChange: "transform, opacity",
            }}
            animate={{
              y: [0, -14 - (i % 4) * 4, 0],
              opacity: [0.1, 0.35, 0.1],
              rotate: [0, i % 2 ? 8 : -8, 0],
            }}
            transition={{
              duration: 6 + (i % 5),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          >
            {p}
          </motion.span>
        ))}
      </div>

      {/* crown badge */}
      <motion.div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 mx-auto"
        style={{
          background:
            "linear-gradient(135deg, hsl(43 90% 55% / 0.22), hsl(30 60% 40% / 0.12))",
          border: "1px solid hsl(43 90% 55% / 0.35)",
          boxShadow: "0 0 40px -6px hsl(43 90% 55% / 0.55)",
        }}
        initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
      >
        <Crown className="h-7 w-7 text-primary drop-shadow-[0_0_10px_hsl(43_90%_55%/0.7)]" />
      </motion.div>

      {/* The massive wordmark */}
      <motion.h1
        className="relative font-display font-black tracking-tight uppercase mx-auto text-center
                   text-[clamp(2.75rem,11vw,7.5rem)] leading-[0.92]
                   [text-shadow:0_0_50px_hsl(var(--primary)/0.25),0_0_120px_hsl(var(--primary)/0.15)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform, opacity" }}
      >
        <span className="relative inline-block">
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(100deg, #fde68a 0%, #f0b429 35%, #fff3b0 55%, #b87333 85%, #fde68a 100%)",
              backgroundSize: "300% 100%",
              animation: "logoSweep 7s linear infinite",
              WebkitTextStroke: "0.5px hsl(43 90% 55% / 0.18)",
            }}
          >
            Master
          </span>
          <span className="text-foreground">Chess</span>
        </span>

        {/* sweep highlight bar */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 block"
          style={{
            background:
              "linear-gradient(110deg, transparent 35%, hsl(43 95% 70% / 0.35) 50%, transparent 65%)",
            mixBlendMode: "screen",
            willChange: "transform",
          }}
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      </motion.h1>

      {tagline && (
        <motion.p
          className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto mt-3 font-light tracking-[0.22em] uppercase text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          {tagline}
        </motion.p>
      )}

      <style>{`
        @keyframes logoSweep {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
      `}</style>
    </div>
  );
}
