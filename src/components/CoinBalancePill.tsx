import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCoinBalance } from "@/hooks/use-coin-balance";
import { useEffect, useRef, useState } from "react";

interface Props {
  compact?: boolean;
  className?: string;
}

/** Shop-linked live coin balance chip. Pulses when balance increases. */
export default function CoinBalancePill({ compact, className = "" }: Props) {
  const { balance } = useCoinBalance();
  const prev = useRef<number | null>(null);
  const [display, setDisplay] = useState<number>(0);
  const [delta, setDelta] = useState<number | null>(null);

  // Animated count-up between previous and new balance
  useEffect(() => {
    if (balance == null) return;
    const from = prev.current ?? balance;
    const to = balance;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const diff = to - from;
    setDelta(diff);
    const duration = Math.min(1200, 380 + Math.abs(diff) * 4);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + diff * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    const t = setTimeout(() => setDelta(null), 1400);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [balance]);


  if (balance == null) return null;
  const formatted = display.toLocaleString();


  return (
    <Link
      to="/shop"
      aria-label={`${formatted} coins — open shop`}
      className={`relative inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-200 hover:text-amber-100 hover:border-amber-300/60 transition-colors shadow-[0_0_18px_-6px_rgba(251,191,36,0.55)] ${className}`}
    >
      <motion.span
        animate={delta ? { rotate: [0, -18, 18, 0], scale: [1, 1.25, 1] } : {}}
        transition={{ duration: 0.6 }}
        className="inline-flex"
      >
        <Coins className="h-3.5 w-3.5" />
      </motion.span>
      {!compact && <span className="tabular-nums">{formatted}</span>}
      {compact && <span className="tabular-nums">{formatted}</span>}
      <AnimatePresence>
        {delta != null && delta !== 0 && (
          <motion.span
            key={Math.random()}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -22 }}
            exit={{ opacity: 0, y: -34 }}
            transition={{ duration: 1.2 }}
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -top-1 text-[11px] font-extrabold ${
              delta > 0 ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {delta > 0 ? `+${delta}` : `${delta}`}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
