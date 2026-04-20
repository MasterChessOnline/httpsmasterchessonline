import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import type { ChessCardProfile, SkillKey } from "@/lib/chess-card";

interface ChessCardProps {
  card: ChessCardProfile;
  playerName: string;
  avatarUrl?: string | null;
  className?: string;
  compact?: boolean;
}

function scoreColor(score: number): { from: string; to: string; text: string; ring: string } {
  if (score >= 85) return { from: "from-amber-400", to: "to-yellow-500", text: "text-amber-300", ring: "ring-amber-400/40" };
  if (score >= 70) return { from: "from-emerald-400", to: "to-teal-500", text: "text-emerald-300", ring: "ring-emerald-400/40" };
  if (score >= 55) return { from: "from-sky-400", to: "to-blue-500", text: "text-sky-300", ring: "ring-sky-400/40" };
  if (score >= 40) return { from: "from-violet-400", to: "to-fuchsia-500", text: "text-violet-300", ring: "ring-violet-400/40" };
  return { from: "from-zinc-500", to: "to-zinc-600", text: "text-zinc-300", ring: "ring-zinc-500/40" };
}

function SkillRow({ icon, label, score, level, description, isStrength, isWeakness, delay }: {
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
      className="group rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/20 hover:border-primary/30 transition-all p-3"
    >
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none" aria-hidden>{icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{label}</p>
            <p className="text-[10px] text-muted-foreground truncate">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isStrength && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-400/40 text-emerald-300 bg-emerald-400/10">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> Top
            </Badge>
          )}
          {isWeakness && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-400/40 text-amber-300 bg-amber-400/10">
              <TrendingDown className="w-2.5 h-2.5 mr-0.5" /> Focus
            </Badge>
          )}
          <span className={`font-mono text-sm font-bold ${c.text}`}>{score}</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: delay + 0.1, duration: 0.8, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${c.from} ${c.to}`}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">{level}</p>
    </motion.div>
  );
}

export default function ChessCard({ card, playerName, avatarUrl, className = "", compact = false }: ChessCardProps) {
  const overall = scoreColor(card.overallScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-background backdrop-blur-xl shadow-2xl">
        {/* Decorative glow */}
        <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br ${overall.from} ${overall.to} opacity-10 blur-3xl pointer-events-none`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.06),transparent_60%)] pointer-events-none" />

        <div className="relative p-5 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${overall.from} ${overall.to} ring-2 ${overall.ring} flex items-center justify-center text-2xl font-bold text-background shadow-lg`}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                  : <span>{playerName.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Chess Card</p>
                <h3 className="font-display text-lg sm:text-xl font-bold text-foreground truncate">{playerName}</h3>
                <p className="text-xs text-muted-foreground">
                  Rating <span className="font-mono text-foreground">{card.rating}</span>
                  {" · "}
                  <span>{card.totalGames} games</span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-mono text-3xl sm:text-4xl font-black ${overall.text} drop-shadow-glow leading-none`}>
                {card.overallScore}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{card.overallLevel}</p>
            </div>
          </div>

          {/* Skills grid */}
          <div className={`grid gap-2 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
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
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex gap-2.5"
          >
            <div className="shrink-0 w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">AI Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{card.summary}</p>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
