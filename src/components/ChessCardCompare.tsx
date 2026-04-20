import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { compareCards, type ChessCardProfile } from "@/lib/chess-card";
import { Minus, Crown } from "lucide-react";

interface CompareProps {
  cardA: ChessCardProfile;
  cardB: ChessCardProfile;
  nameA: string;
  nameB: string;
}

export default function ChessCardCompare({ cardA, cardB, nameA, nameB }: CompareProps) {
  const rows = compareCards(cardA, cardB);
  const aWinsCount = rows.filter(r => r.delta > 2).length;
  const bWinsCount = rows.filter(r => r.delta < -2).length;
  const overallLeader = cardA.overallScore > cardB.overallScore ? "a" : cardA.overallScore < cardB.overallScore ? "b" : "tie";

  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-background backdrop-blur-xl">
      <div className="p-5 sm:p-6 space-y-5">
        {/* Header VS */}
        <div className="grid grid-cols-3 items-center gap-3">
          <div className="text-right space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Player A</p>
            <p className="font-display text-base sm:text-lg font-black text-foreground truncate">{nameA}</p>
            <div className="flex items-center justify-end gap-1.5">
              {overallLeader === "a" && <Crown className="w-3.5 h-3.5 text-amber-400" />}
              <p className="font-mono text-2xl sm:text-3xl font-black text-primary drop-shadow-[0_0_15px_hsl(var(--primary))]">{cardA.overallScore}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Head to Head</p>
            <p className="font-display text-3xl font-black text-gradient-gold leading-none my-1">VS</p>
            <p className="text-[10px] text-muted-foreground font-mono">{aWinsCount} - {bWinsCount}</p>
          </div>
          <div className="text-left space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Player B</p>
            <p className="font-display text-base sm:text-lg font-black text-foreground truncate">{nameB}</p>
            <div className="flex items-center gap-1.5">
              <p className="font-mono text-2xl sm:text-3xl font-black text-accent drop-shadow-[0_0_15px_hsl(var(--accent))]">{cardB.overallScore}</p>
              {overallLeader === "b" && <Crown className="w-3.5 h-3.5 text-amber-400" />}
            </div>
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {rows.map((r, i) => {
            const aWins = r.delta > 2;
            const bWins = r.delta < -2;
            const total = Math.max(1, r.a + r.b);
            const aPct = (r.a / total) * 100;
            return (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border/40 bg-muted/10 p-3 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className={`font-mono text-base font-black ${aWins ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" : "text-muted-foreground"}`}>{r.a}</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <span className="text-base" aria-hidden>{r.icon}</span>
                    {r.label}
                  </span>
                  <span className={`font-mono text-base font-black ${bWins ? "text-accent drop-shadow-[0_0_8px_hsl(var(--accent))]" : "text-muted-foreground"}`}>{r.b}</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted/30 overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aPct}%` }}
                    transition={{ delay: i * 0.05 + 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary/70"
                  />
                  <div className="h-full flex-1 bg-gradient-to-l from-accent via-accent/90 to-accent/70" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center font-medium">
                  {aWins && <span className="text-primary">{nameA} +{r.delta}</span>}
                  {bWins && <span className="text-accent">{nameB} +{Math.abs(r.delta)}</span>}
                  {!aWins && !bWins && (
                    <span className="inline-flex items-center gap-1">
                      <Minus className="w-2.5 h-2.5" /> Even
                    </span>
                  )}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
