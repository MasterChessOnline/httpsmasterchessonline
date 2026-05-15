import { motion } from "framer-motion";
import { getRank } from "@/lib/ranks";

const RING_COLOR: Record<string, string> = {
  bronze:      "hsl(28 65% 45%)",
  silver:      "hsl(220 10% 75%)",
  gold:        "hsl(43 90% 55%)",
  platinum:    "hsl(190 70% 65%)",
  diamond:     "hsl(210 90% 65%)",
  master:      "hsl(280 70% 65%)",
  grandmaster: "hsl(48 95% 60%)",
};

interface Props {
  rating: number;
  size?: number;
  children: React.ReactNode;
}

/**
 * Animated conic-gradient frame around an avatar. Color comes from the
 * player's rank tier; ring slowly rotates for a subtle premium feel.
 * Respects .a11y-reduce-motion (CSS will pause animation).
 */
export default function RankFrame({ rating, size = 96, children }: Props) {
  const rank = getRank(rating);
  const color = RING_COLOR[rank.key] ?? "hsl(43 90% 55%)";
  const padding = Math.max(3, Math.round(size * 0.04));

  return (
    <div
      className="relative inline-flex items-center justify-center rounded-full"
      style={{ width: size + padding * 2, height: size + padding * 2 }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full motion-reduce:animate-none"
        style={{
          background: `conic-gradient(from 0deg, ${color}, transparent 35%, ${color} 60%, transparent 90%, ${color})`,
          filter: "blur(0.5px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-[3px] rounded-full bg-background"
        aria-hidden
      />
      <div
        className="relative overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        {children}
      </div>
      <span
        className="absolute -bottom-1 right-0 inline-flex items-center justify-center rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold border border-border/40"
        title={`${rank.label} tier`}
      >
        <span>{rank.icon}</span>
      </span>
    </div>
  );
}
