import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import type { ChestDef, ChestReward } from "@/lib/chests";

interface Props {
  chest: ChestDef | null;
  /** Set once reveal phase should fire (after parent's resolution delay). */
  revealed: { reward: ChestReward; isNew: boolean } | null;
  onClose: () => void;
}

type Phase = "intro" | "shake" | "burst" | "reveal";

const TIER_FX: Record<string, { glow: string; particles: number; beamHue: number; sound: string; rarity: string; rarityColor: string }> = {
  wood:    { glow: "rgba(180,120,60,0.65)",  particles: 26, beamHue: 30,  sound: "common",    rarity: "Common",    rarityColor: "text-amber-300" },
  silver:  { glow: "rgba(200,210,230,0.7)",  particles: 42, beamHue: 220, sound: "rare",      rarity: "Rare",      rarityColor: "text-sky-300" },
  gold:    { glow: "rgba(251,191,36,0.85)",  particles: 60, beamHue: 45,  sound: "epic",      rarity: "Epic",      rarityColor: "text-violet-300" },
  diamond: { glow: "rgba(180,220,255,0.95)", particles: 90, beamHue: 200, sound: "legendary", rarity: "Legendary", rarityColor: "text-fuchsia-300" },
};

export default function ChestOpenCinematic({ chest, revealed, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    if (!chest) { setPhase("intro"); return; }
    setPhase("intro");
    const t1 = setTimeout(() => setPhase("shake"), 350);
    const t2 = setTimeout(() => setPhase("burst"), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [chest?.tier]);

  useEffect(() => {
    if (revealed) setPhase("reveal");
  }, [revealed]);

  if (!chest) return null;
  const fx = TIER_FX[chest.tier] ?? TIER_FX.wood;

  return (
    <AnimatePresence>
      {chest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
          onClick={phase === "reveal" ? onClose : undefined}
        >
          {/* Tier-colored ambient aurora */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${fx.glow} 0%, transparent 65%)` }}
            animate={{ opacity: [0.4, 0.85, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Cinematic light beams during burst */}
          {(phase === "burst" || phase === "reveal") && (
            <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 origin-left h-[2px] w-[60vw]"
                  style={{
                    background: `linear-gradient(90deg, hsla(${fx.beamHue},90%,65%,0.9), transparent)`,
                    transform: `translate(-50%,-50%) rotate(${i * 30}deg)`,
                  }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 0.9, 0.4], scaleX: [0, 1, 1] }}
                  transition={{ duration: 1.4, delay: i * 0.03, repeat: Infinity, repeatDelay: 0.6 }}
                />
              ))}
            </div>
          )}

          {/* Particle burst */}
          {(phase === "burst" || phase === "reveal") && (
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              {Array.from({ length: fx.particles }).map((_, i) => {
                const angle = (Math.PI * 2 * i) / fx.particles;
                const dist = 180 + Math.random() * 220;
                return (
                  <motion.span
                    key={i}
                    className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                    style={{ background: `hsl(${fx.beamHue},90%,65%)`, boxShadow: `0 0 12px hsl(${fx.beamHue},95%,70%)` }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: 0,
                      scale: [0.5, 1.4, 0.2],
                    }}
                    transition={{ duration: 1.6 + Math.random() * 0.6, ease: "easeOut" }}
                  />
                );
              })}
            </div>
          )}

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-20 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative text-center">
            {/* Phase: intro + shake */}
            {phase !== "reveal" && (
              <>
                <motion.div
                  className={`inline-block text-[8rem] sm:text-[10rem]`}
                  style={{ filter: `drop-shadow(0 0 60px ${fx.glow})` }}
                  initial={{ scale: 0.5, rotate: -8, y: 40, opacity: 0 }}
                  animate={
                    phase === "shake"
                      ? { scale: [1, 1.05, 0.96, 1.04, 1], rotate: [0, -6, 6, -4, 4, 0], y: [0, -8, 0, -4, 0] }
                      : { scale: 1, rotate: 0, y: 0, opacity: 1 }
                  }
                  transition={{ duration: phase === "shake" ? 0.7 : 0.5, repeat: phase === "shake" ? Infinity : 0 }}
                >
                  {chest.emoji}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className={`mt-4 text-[10px] font-bold uppercase tracking-[0.4em] ${fx.rarityColor}`}
                >
                  {fx.rarity} · {chest.name}
                </motion.p>
              </>
            )}

            {/* Phase: reveal */}
            {phase === "reveal" && revealed && (
              <motion.div
                initial={{ scale: 0.3, opacity: 0, rotateY: -180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 16 }}
                className="space-y-5"
                style={{ perspective: 800 }}
              >
                <motion.div
                  className="text-8xl sm:text-9xl inline-block"
                  style={{ filter: `drop-shadow(0 0 50px ${fx.glow})` }}
                  animate={{ rotateY: [0, 360], y: [0, -8, 0] }}
                  transition={{ rotateY: { duration: 6, repeat: Infinity, ease: "linear" }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                >
                  {revealed.reward.preview}
                </motion.div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.35em] mb-2 ${fx.rarityColor}`}>
                    {revealed.isNew ? <><Sparkles className="inline w-3 h-3 mr-1" />New unlock!</> : revealed.reward.kind === "xp" ? "Bonus" : "Duplicate"}
                  </p>
                  <h3 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{revealed.reward.label}</h3>
                </div>
                <Button onClick={onClose} size="lg" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-bold hover:brightness-110">
                  Nice — keep going
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
