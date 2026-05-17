import { motion } from "framer-motion";
import { Crown, Handshake, Skull } from "lucide-react";
import { useMemo } from "react";

interface GameOverOverlayProps {
  /** "checkmate" | "draw" | "resign" | "timeout" */
  type: "checkmate" | "draw" | "resign" | "timeout";
  /** "white" | "black" | null (null = draw) */
  winner: "white" | "black" | null;
  /** optional reason line, e.g. "by stalemate", "by agreement" */
  reason?: string;
  /** if provided, perspective for "did I win?" — used to swap victory/defeat mood */
  myColor?: "white" | "black";
}

/**
 * Cinematic end-of-game overlay shown over the board.
 *
 * - Victory: gold-particle eruption, radial spotlight rays, large display crown.
 * - Defeat: muted slate spotlight, dignified small typography, no fireworks.
 * - Draw:   neutral blue-grey, calm two-line statement.
 *
 * Pure presentation — no audio, no state, no DOM listeners. Parent decides
 * when to mount it and triggers the matching sound from chess-sounds.ts.
 */
export default function GameOverOverlay({ type, winner, reason, myColor }: GameOverOverlayProps) {
  const isDraw = type === "draw" || winner === null;
  const iWon = !isDraw && !!myColor && winner === myColor;
  const iLost = !isDraw && !!myColor && winner !== myColor;
  // If perspective isn't given, treat any decisive result as a "neutral win" view.
  const mood: "win" | "loss" | "draw" =
    isDraw ? "draw" : iLost ? "loss" : iWon ? "win" : "win";

  const headline =
    type === "checkmate"
      ? "Checkmate"
      : type === "draw"
      ? "Draw"
      : type === "timeout"
      ? "Time out"
      : "Resignation";

  const subline =
    type === "draw"
      ? reason || "Game drawn"
      : winner
      ? `${winner === "white" ? "White" : "Black"} wins`
      : reason || "";

  // Pre-compute 24 deterministic particle slots so they don't reshuffle each render.
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 140 + Math.random() * 180;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 4 + Math.random() * 6,
          delay: Math.random() * 0.25,
          duration: 1.4 + Math.random() * 0.8,
        };
      }),
    [type, winner],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden"
      role="status"
      aria-live="polite"
    >
      {/* Mood-dependent backdrop */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            mood === "win"
              ? "radial-gradient(circle at center, hsl(43 90% 8% / 0.55), hsl(0 0% 0% / 0.78))"
              : mood === "loss"
              ? "radial-gradient(circle at center, hsl(220 15% 8% / 0.6), hsl(0 0% 0% / 0.82))"
              : "radial-gradient(circle at center, hsl(210 25% 10% / 0.55), hsl(0 0% 0% / 0.78))",
          backdropFilter: "blur(3px)",
        }}
      />

      {/* VICTORY ONLY — radial gold spotlight rays */}
      {mood === "win" && (
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square pointer-events-none"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: [0, 0.55, 0.35], rotate: 8 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, hsl(43 90% 60% / 0.15) 8deg, transparent 16deg, transparent 30deg, hsl(43 90% 60% / 0.12) 38deg, transparent 46deg, transparent 60deg, hsl(43 90% 60% / 0.18) 68deg, transparent 76deg, transparent 90deg, hsl(43 90% 60% / 0.12) 98deg, transparent 106deg, transparent 120deg, hsl(43 90% 60% / 0.15) 128deg, transparent 136deg, transparent 150deg, hsl(43 90% 60% / 0.12) 158deg, transparent 166deg, transparent 180deg, hsl(43 90% 60% / 0.18) 188deg, transparent 196deg, transparent 210deg, hsl(43 90% 60% / 0.12) 218deg, transparent 226deg, transparent 240deg, hsl(43 90% 60% / 0.15) 248deg, transparent 256deg, transparent 270deg, hsl(43 90% 60% / 0.12) 278deg, transparent 286deg, transparent 300deg, hsl(43 90% 60% / 0.18) 308deg, transparent 316deg, transparent 330deg, hsl(43 90% 60% / 0.12) 338deg, transparent 346deg, transparent 360deg)",
            maskImage: "radial-gradient(circle at center, black 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 70%)",
          }}
        />
      )}

      {/* VICTORY ONLY — gold particle eruption */}
      {mood === "win" && (
        <div aria-hidden className="absolute left-1/2 top-1/2 w-0 h-0 pointer-events-none">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background:
                  "radial-gradient(circle, hsl(43 95% 70%) 0%, hsl(43 90% 50%) 60%, transparent 100%)",
                boxShadow: "0 0 12px hsl(43 90% 55% / 0.7)",
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [0, 1, 1, 0],
                scale: [0.4, 1, 0.9, 0.3],
              }}
              transition={{
                duration: p.duration,
                delay: 0.25 + p.delay,
                ease: [0.16, 0.84, 0.44, 1],
              }}
            />
          ))}
        </div>
      )}

      {/* Centered card */}
      <motion.div
        initial={{ scale: 0.85, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.15 }}
        className={`relative px-7 py-6 sm:px-10 sm:py-8 rounded-2xl text-center min-w-[240px] max-w-[88%] backdrop-blur-md ${
          mood === "win"
            ? "border-2 border-primary/50 bg-card/90 shadow-[0_20px_70px_-10px_hsl(43_90%_55%/0.5)]"
            : mood === "loss"
            ? "border border-border/60 bg-card/85 shadow-2xl"
            : "border border-border/50 bg-card/90 shadow-xl"
        }`}
        style={
          mood === "win"
            ? { boxShadow: "0 24px 80px -12px hsl(43 90% 55% / 0.55), inset 0 1px 0 0 hsl(43 90% 70% / 0.35)" }
            : undefined
        }
      >
        {/* Crown / Handshake / Skull icon */}
        <motion.div
          className="flex justify-center mb-3"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.35 }}
        >
          {mood === "draw" ? (
            <div className="w-12 h-12 rounded-full bg-muted/60 border border-border flex items-center justify-center">
              <Handshake className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : mood === "loss" ? (
            <div className="w-12 h-12 rounded-full bg-muted/40 border border-border/70 flex items-center justify-center">
              <Skull className="w-5 h-5 text-muted-foreground" />
            </div>
          ) : (
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-2 border-amber-200/60 flex items-center justify-center"
              style={{ boxShadow: "0 0 30px hsl(43 95% 60% / 0.7), inset 0 1px 0 hsl(43 100% 80% / 0.7)" }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crown className="w-7 h-7 text-zinc-950" strokeWidth={2.5} />
            </motion.div>
          )}
        </motion.div>

        {/* Headline */}
        <motion.h3
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className={`font-display font-black tracking-tight ${
            mood === "win"
              ? "text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 uppercase"
              : mood === "loss"
              ? "text-xl sm:text-2xl text-muted-foreground/90 uppercase tracking-widest"
              : "text-2xl sm:text-3xl text-foreground"
          }`}
          style={
            mood === "win"
              ? { textShadow: "0 0 30px hsl(43 90% 55% / 0.4), 0 2px 0 hsl(30 20% 10%)" }
              : undefined
          }
        >
          {mood === "win" ? "Victory" : mood === "loss" ? "Defeat" : headline}
        </motion.h3>

        {/* Subline */}
        {subline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className={`mt-2 ${
              mood === "win"
                ? "text-sm sm:text-base text-amber-100/80 font-medium"
                : "text-sm text-muted-foreground"
            }`}
          >
            {mood === "win" || mood === "loss" ? headline : subline}
          </motion.p>
        )}

        {/* Reason (always) */}
        {reason && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mt-1 text-[11px] text-muted-foreground/70"
          >
            {reason}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
