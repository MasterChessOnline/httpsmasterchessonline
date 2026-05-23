// Tiny handwritten margin notes & hand-drawn arrows you can sprinkle between
// polished sections. Each one is rotated, low-key, and decorative.
import { motion } from "framer-motion";

export function ScribbleArrow({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      width="64" height="40" viewBox="0 0 64 40" fill="none" aria-hidden
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M4 30 Q 18 4, 38 18 T 58 24 M 50 18 L 58 24 L 52 32"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        fill="none" opacity="0.7"
      />
    </svg>
  );
}

export function MarginNote({
  children,
  rotate = -3,
  className = "",
}: {
  children: React.ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`font-hand text-primary/75 text-lg sm:text-xl select-none pointer-events-none ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </motion.div>
  );
}

/** Small handwritten signature line — useful in footer or end-of-page. */
export function HandSignature({ name = "Nikola", className = "" }: { name?: string; className?: string }) {
  return (
    <span className={`font-hand text-primary text-2xl leading-none ${className}`}>
      ~ {name}
    </span>
  );
}
