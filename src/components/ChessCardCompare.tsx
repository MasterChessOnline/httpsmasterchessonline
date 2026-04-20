import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { compareCards, type ChessCardProfile } from "@/lib/chess-card";
import { Minus } from "lucide-react";

interface CompareProps {
  cardA: ChessCardProfile;
  cardB: ChessCardProfile;
  nameA: string;
  nameB: string;
}

export default function ChessCardCompare({ cardA, cardB, nameA, nameB }: CompareProps) {
  const rows = compareCards(cardA, cardB);

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/80 backdrop-blur-xl">
      <div className="p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-3 items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Player A</p>
            <p className="font-display text-base font-bold text-foreground truncate">{nameA}</p>
            <p className="font-mono text-2xl font-black text-primary">{cardA.overallScore}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Head to Head</p>
            <p className="font-display text-2xl font-black text-gradient-gold">VS</p>
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Player B</p>
            <p className="font-display text-base font-bold text-foreground truncate">{nameB}</p>
            <p className="font-mono text-2xl font-black text-accent">{cardB.overallScore}</p>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => {
            const aWins = r.delta > 2;
            const bWins = r.delta < -2;
            const totalA = Math.max(1, r.a + r.b);
            const aPct = (r.a / totalA) * 100;
            return (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-lg border border-border/40 bg-muted/10 p-2.5"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-mono font-bold ${aWins ? "text-primary" : "text-muted-foreground"}`}>{r.a}</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                    <span aria-hidden>{r.icon}</span>
                    {r.label}
                  </span>
                  <span className={`font-mono font-bold ${bWins ? "text-accent" : "text-muted-foreground"}`}>{r.b}</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-muted/30 overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aPct}%` }}
                    transition={{ delay: i * 0.04 + 0.1, duration: 0.6 }}
                    className="h-full bg-gradient-to-r from-primary to-primary/70"
                  />
                  <div className="h-full flex-1 bg-gradient-to-l from-accent to-accent/70" />
                </div>
                {Math.abs(r.delta) > 0 && (
                  <p className="text-[9px] text-muted-foreground mt-1 text-center">
                    {aWins && `${nameA} +${r.delta}`}
                    {bWins && `${nameB} +${Math.abs(r.delta)}`}
                    {!aWins && !bWins && (
                      <span className="inline-flex items-center gap-1">
                        <Minus className="w-2.5 h-2.5" /> Even
                      </span>
                    )}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
