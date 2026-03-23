import { getLevelFromXP } from "@/lib/gamification";
import { motion } from "framer-motion";

interface XPLevelBadgeProps {
  xp: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export default function XPLevelBadge({ xp, size = "md", showProgress = true }: XPLevelBadgeProps) {
  const info = getLevelFromXP(xp);
  const progress = info.xpRequired > 0 ? (info.xpForNext / info.xpRequired) * 100 : 100;

  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center shadow-glow relative`}
        whileHover={{ scale: 1.05 }}
      >
        <span>{info.icon}</span>
        <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {info.level}
        </div>
      </motion.div>
      {showProgress && (
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-sm font-bold text-foreground">Level {info.level}</span>
            <span className="text-[10px] text-primary font-semibold">{info.title}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {info.xpForNext.toLocaleString()} / {info.xpRequired.toLocaleString()} XP
          </p>
        </div>
      )}
    </div>
  );
}
