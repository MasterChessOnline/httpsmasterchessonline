import { motion } from "framer-motion";

/**
 * Eruptive ambient background for auth pages.
 * Animated gradient orbs + grid + soft particle haze.
 */
export default function AuthAura() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.10),transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        }}
      />

      {/* Eruptive orbs */}
      <div
        className="erupt-orb absolute -top-20 -left-20 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.35), transparent 65%)" }}
      />
      <div
        className="erupt-orb absolute -bottom-32 -right-24 h-[32rem] w-[32rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(20 90% 50% / 0.25), transparent 65%)", animationDelay: "-5s" }}
      />
      <div
        className="erupt-orb absolute top-1/3 right-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(280 80% 55% / 0.18), transparent 65%)", animationDelay: "-9s" }}
      />

      {/* Floating sparks */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary/60"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 31) % 100}%` }}
          animate={{ y: [0, -50, 0], opacity: [0, 0.9, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}

      {/* Top scan-line accent */}
      <motion.div
        className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}
