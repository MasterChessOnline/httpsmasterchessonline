// Visual fire badge that escalates with streak length.
// 3+ Bronze · 5+ Silver · 10+ Gold · 15+ Legendary
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface Props {
  streak: number;
  className?: string;
  showNumber?: boolean;
}

function tier(streak: number) {
  if (streak >= 15) return { name: "Legendary", color: "270 95% 70%", glow: 0.9 };
  if (streak >= 10) return { name: "Gold", color: "43 95% 60%", glow: 0.7 };
  if (streak >= 5) return { name: "Silver", color: "210 8% 78%", glow: 0.55 };
  if (streak >= 3) return { name: "Bronze", color: "25 75% 55%", glow: 0.45 };
  return null;
}

export default function WinStreakFlame({ streak, className = "", showNumber = true }: Props) {
  const t = tier(streak);
  if (!t) return null;
  const c = `hsl(${t.color})`;
  return (
    <motion.span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${className}`}
      style={{
        color: c,
        background: `hsla(${t.color} / 0.12)`,
        borderColor: `hsla(${t.color} / 0.45)`,
        boxShadow: `0 0 12px -2px hsla(${t.color} / ${t.glow})`,
      }}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      aria-label={`${t.name} win streak: ${streak}`}
      title={`${t.name} streak: ${streak} wins in a row`}
    >
      <motion.span
        animate={{
          y: [0, -1.5, 0],
          scale: [1, 1.12, 1],
          filter: [
            `drop-shadow(0 0 4px ${c})`,
            `drop-shadow(0 0 10px ${c})`,
            `drop-shadow(0 0 4px ${c})`,
          ],
        }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex"
      >
        <Flame className="h-3.5 w-3.5" />
      </motion.span>
      {showNumber && <span>{streak}</span>}
    </motion.span>
  );
}
