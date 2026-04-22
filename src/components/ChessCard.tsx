import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Trophy, Target, Zap } from "lucide-react";
import type { ChessCardProfile } from "@/lib/chess-card";

interface ChessCardProps {
  card: ChessCardProfile;
  playerName: string;
  avatarUrl?: string | null;
  className?: string;
  compact?: boolean;
}

function scoreColor(score: number): { bar: string; text: string; ring: string; glow: string } {
  if (score >= 85) return { bar: "from-amber-400 via-yellow-400 to-amber-500", text: "text-amber-300", ring: "ring-amber-400/40", glow: "shadow-[0_0_30px_rgba(251,191,36,0.4)]" };
  if (score >= 70) return { bar: "from-emerald-400 via-teal-400 to-emerald-500", text: "text-emerald-300", ring: "ring-emerald-400/40", glow: "shadow-[0_0_30px_rgba(52,211,153,0.35)]" };
  if (score >= 55) return { bar: "from-sky-400 via-blue-400 to-sky-500", text: "text-sky-300", ring: "ring-sky-400/40", glow: "shadow-[0_0_30px_rgba(56,189,248,0.35)]" };
  if (score >= 40) return { bar: "from-violet-400 via-fuchsia-400 to-violet-500", text: "text-violet-300", ring: "ring-violet-400/40", glow: "shadow-[0_0_25px_rgba(167,139,250,0.3)]" };
  return { bar: "from-zinc-500 via-zinc-400 to-zinc-500", text: "text-zinc-300", ring: "ring-zinc-500/40", glow: "" };
}

function SkillRow({
  icon, label, score, level, description, isStrength, isWeakness, delay,
}: {
  icon: string;
  label: string;
  score: number;
  level: string;
  description: string;
  isStrength?: boolean;
  isWeakness?: boolean;
  delay: number;
}) {
  const c = scoreColor(score);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ scale: 1.015, y: -2 }}
      className="group relative rounded-xl border border-border/40 bg-gradient-to-br from-muted/15 to-muted/5 hover:border-primary/40 transition-all p-3.5 overflow-hidden"
    >
      {/* hover glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${c.bar} opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none`} />

      <div className="relative flex items-start justify-between mb-2 gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="text-xl leading-none shrink-0 mt-0.5" aria-hidden>{icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground leading-snug break-words">{label}</p>
            <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 break-words">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isStrength && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 border-emerald-400/40 text-emerald-300 bg-emerald-400/10">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Top
            </Badge>
          )}
          {isWeakness && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-5 border-amber-400/40 text-amber-300 bg-amber-400/10">
              <TrendingDown className="w-2.5 h-2.5 mr-0.5" /> Focus
            </Badge>
          )}
          <span className={`font-mono text-base font-black ${c.text}`}>{score}</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full bg-gradient-to-r ${c.bar} relative`}
        >
          <div className="absolute inset-0 bg-white/10 animate-pulse" />
        </motion.div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">{level}</p>
    </motion.div>
  );
}

export default function ChessCard({ card, playerName, avatarUrl, className = "", compact = false }: ChessCardProps) {
  const overall = scoreColor(card.overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-background backdrop-blur-xl shadow-2xl group">
        {/* Decorative glows */}
        <div className={`absolute -top-32 -right-32 w-72 h-72 rounded-full bg-gradient-to-br ${overall.bar} opacity-10 blur-3xl pointer-events-none transition-opacity group-hover:opacity-20`} />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_60%)] pointer-events-none" />

        <div className="relative p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${overall.bar} ring-2 ${overall.ring} ${overall.glow} flex items-center justify-center text-2xl font-black text-background shadow-lg shrink-0`}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                  : <span>{playerName.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary" /> Chess Card
                </p>
                <h3 className="font-display text-xl sm:text-2xl font-black text-foreground truncate leading-tight">{playerName}</h3>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> <span className="font-mono text-foreground font-semibold">{card.rating}</span></span>
                  <span className="opacity-50">·</span>
                  <span>{card.totalGames} games</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-mono text-4xl sm:text-5xl font-black ${overall.text} leading-none drop-shadow-[0_0_18px_currentColor]`}>
                {card.overallScore}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-bold">{card.overallLevel}</p>
            </div>
          </div>

          {/* Win/Loss/Draw mini-strip */}
          {card.totalGames > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">Wins</p>
                <p className="font-mono text-base font-black text-emerald-300">{card.wins}</p>
              </div>
              <div className="rounded-lg bg-zinc-500/10 border border-zinc-500/20 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-zinc-300 font-bold">Draws</p>
                <p className="font-mono text-base font-black text-zinc-300">{card.draws}</p>
              </div>
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-rose-300 font-bold">Losses</p>
                <p className="font-mono text-base font-black text-rose-300">{card.losses}</p>
              </div>
            </div>
          )}

          {/* Skills grid */}
          <div className={`grid gap-2.5 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
            {card.skills.map((s, i) => (
              <SkillRow
                key={s.key}
                icon={s.icon}
                label={s.label}
                description={s.description}
                score={s.score}
                level={s.level}
                isStrength={s.key === card.topStrength && card.totalGames > 0}
                isWeakness={s.key === card.topWeakness && card.totalGames >= 5}
                delay={0.1 + i * 0.05}
              />
            ))}
          </div>

          {/* AI summary */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="relative rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 flex gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.15),transparent_70%)] pointer-events-none" />
            <div className="relative shrink-0 w-9 h-9 rounded-xl bg-primary/20 ring-1 ring-primary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="relative">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.18em] mb-1 flex items-center gap-1.5">
                AI Analysis <Zap className="w-2.5 h-2.5" />
              </p>
              <p className="text-sm text-foreground leading-relaxed font-medium">{card.summary}</p>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
