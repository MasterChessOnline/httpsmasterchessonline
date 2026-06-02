import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lock, Coins, Gift, Trophy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { calculateXP } from "@/lib/gamification";
import {
  CHESTS, ChestDef, ChestReward, openChest, getUnlocked, getSpendableXP, getOpenCount, isUnlocked,
} from "@/lib/chests";
import ChestOpenCinematic from "@/components/ChestOpenCinematic";

export default function Chests() {
  const { profile } = useAuth();
  const totalXP = useMemo(() => profile ? calculateXP(profile) : 0, [profile]);
  const [unlocked, setUnlocked] = useState<string[]>(() => getUnlocked());
  const [spendable, setSpendable] = useState(() => getSpendableXP(totalXP));
  const [opened, setOpened] = useState(getOpenCount());
  const [opening, setOpening] = useState<ChestDef | null>(null);
  const [revealed, setRevealed] = useState<{ reward: ChestReward; isNew: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = (chest: ChestDef) => {
    setErrorMsg(null);
    const res = openChest(chest, totalXP);
    if ("error" in res) {
      setErrorMsg(res.error);
      return;
    }
    setOpening(chest);
    setTimeout(() => {
      setRevealed(res);
      setUnlocked(getUnlocked());
      setSpendable(getSpendableXP(totalXP));
      setOpened(getOpenCount());
    }, 1200);
  };

  const closeReveal = () => {
    setOpening(null);
    setRevealed(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container max-w-6xl mx-auto px-4 pt-24 pb-24">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back home
          </Link>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold tracking-wider uppercase">
                <Gift className="w-3.5 h-3.5" /> Reward Chests
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-br from-amber-300 via-primary to-amber-500 bg-clip-text text-transparent">
                Open chests. Unlock boards & pieces.
              </h1>
              <p
                className="mt-3 text-base text-muted-foreground italic max-w-xl"
                style={{ fontFamily: "Caveat, cursive", fontSize: "1.25rem" }}
              >
                "Treasure should feel like treasure. Open it slow, watch the gold spill out." — Nikola, 13
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Stat icon={<Coins className="w-4 h-4 text-amber-400" />} label="Spendable XP" value={spendable.toLocaleString()} />
              <Stat icon={<Trophy className="w-4 h-4 text-primary" />} label="Total XP" value={totalXP.toLocaleString()} />
              <Stat icon={<Sparkles className="w-4 h-4 text-violet-400" />} label="Chests Opened" value={String(opened)} />
            </div>
          </div>
          {!profile && (
            <p className="mt-4 text-sm text-amber-400/90 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2">
              Sign in to earn XP from your games and unlock real loot.
            </p>
          )}
          {errorMsg && (
            <p className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{errorMsg}</p>
          )}
        </div>

        {/* Chests grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHESTS.map((chest) => {
            const locked = totalXP < chest.unlockXP;
            const canAfford = spendable >= chest.cost;
            return (
              <motion.div
                key={chest.tier}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border border-border/40 bg-card overflow-hidden ${chest.glow}`}
              >
                <div className={`relative h-44 bg-gradient-to-br ${chest.gradient} flex items-center justify-center overflow-hidden`}>
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [0, -2, 2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-7xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                  >
                    {chest.emoji}
                  </motion.div>
                  {locked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
                      <Lock className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Need {chest.unlockXP.toLocaleString()} XP</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground">{chest.name}</h3>
                    <p className="text-[11px] text-muted-foreground italic" style={{ fontFamily: "Caveat, cursive", fontSize: "0.95rem" }}>
                      {chest.blurb}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {chest.loot.map((r) => (
                      <span
                        key={r.key}
                        title={r.label + (r.kind !== "xp" && isUnlocked(r.key) ? " (owned)" : "")}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] border ${
                          r.kind !== "xp" && isUnlocked(r.key)
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-muted/30 border-border/40 text-muted-foreground"
                        }`}
                      >
                        <span>{r.preview}</span>
                        <span>{r.label}</span>
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleOpen(chest)}
                    disabled={locked || !canAfford}
                    className="w-full"
                    variant={locked || !canAfford ? "outline" : "default"}
                  >
                    {locked ? "Locked" : canAfford ? `Open · ${chest.cost} XP` : `Need ${chest.cost} XP`}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Collection */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold mb-1">Your collection</h2>
          <p className="text-sm text-muted-foreground mb-4">{unlocked.length} unlocked · pick boards & pieces in Settings.</p>
          <div className="flex flex-wrap gap-2">
            {unlocked.length === 0 && (
              <p className="text-sm text-muted-foreground italic">Nothing yet — pop your first chest.</p>
            )}
            {unlocked.map((u) => (
              <span key={u} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary">
                <Sparkles className="w-3 h-3" /> {u}
              </span>
            ))}
          </div>
        </section>
      </main>

      {/* Cinematic opening overlay with tier-based VFX */}
      <ChestOpenCinematic chest={opening} revealed={revealed} onClose={closeReveal} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/40">
      {icon}
      <div className="leading-tight">
        <div className="text-sm font-bold font-mono text-foreground">{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
