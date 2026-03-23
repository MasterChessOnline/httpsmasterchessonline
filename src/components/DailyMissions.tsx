import { getDailyMissions, type DailyMission } from "@/lib/gamification";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

interface DailyMissionsProps {
  completedMissions?: string[];
}

export default function DailyMissions({ completedMissions = [] }: DailyMissionsProps) {
  const missions = getDailyMissions();

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card/80 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-xl">🎯</span> Daily Missions
        </h2>
        <span className="text-xs text-muted-foreground">
          {completedMissions.length}/{missions.length} done
        </span>
      </div>
      <div className="space-y-2.5">
        {missions.map((m, i) => {
          const done = completedMissions.includes(m.id);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                done
                  ? "border-primary/30 bg-primary/10"
                  : "border-border/40 bg-muted/20"
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{m.icon}</span>
                  <span className={`text-sm font-medium ${done ? "text-primary line-through" : "text-foreground"}`}>
                    {m.title}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{m.description}</p>
              </div>
              <span className="text-xs font-bold text-primary shrink-0">+{m.xpReward} XP</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
