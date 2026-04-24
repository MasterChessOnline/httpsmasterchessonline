import { useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Snowflake, Trophy, Calendar, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DailyMissions from "@/components/DailyMissions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useDailyStreak } from "@/hooks/use-daily-streak";

const Missions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: streak, touchStreak } = useDailyStreak();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  // Mark today as active when user lands here
  useEffect(() => {
    if (user) touchStreak();
  }, [user, touchStreak]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-primary/15 p-2.5 border border-primary/30">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Dnevne Misije
              </h1>
              <p className="text-sm text-muted-foreground">
                Ispuni misije, čuvaj streak, osvoji XP nagrade.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Streak header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 relative overflow-hidden">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -right-2 -top-2 opacity-15"
            >
              <Flame className="h-24 w-24 text-primary" />
            </motion.div>
            <div className="relative">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Trenutni streak
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-primary tabular-nums">
                  {streak?.current_streak ?? 0}
                </span>
                <span className="text-sm text-muted-foreground">dana</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-primary" />
                {streak?.current_streak && streak.current_streak >= 3
                  ? "Drži se! Ne prekidaj seriju."
                  : "Igraj svaki dan da rasteš streak."}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Najduži streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-foreground tabular-nums">
                {streak?.longest_streak ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">dana</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 text-primary/80" />
              Tvoj rekord
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Streak Freeze
            </p>
            <div className="flex items-center gap-2">
              {streak?.freeze_available ? (
                <>
                  <Snowflake className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Spreman</p>
                    <p className="text-[11px] text-muted-foreground">
                      Štiti streak ako preskočiš dan
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Snowflake className="h-8 w-8 text-muted-foreground/40" />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">
                      Iskorišćen
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Vraća se posle nove pobede streak
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Missions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DailyMissions />
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 rounded-xl border border-border/40 bg-card/60 p-5"
        >
          <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            Kako rade misije?
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Calendar className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
              <span>Misije se resetuju svake noći u ponoć — nove svaki dan.</span>
            </li>
            <li className="flex gap-2">
              <Trophy className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
              <span>Pobedi i partije protiv ljudi i botova računaju se za misije.</span>
            </li>
            <li className="flex gap-2">
              <Flame className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
              <span>Aktivnost svaki dan podiže tvoj streak. Streak Freeze te čuva ako jednom propustiš dan.</span>
            </li>
            <li className="flex gap-2">
              <Sparkles className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
              <span>Nakon ispunjenja misije, klikni <strong className="text-primary">Claim</strong> da pokupiš XP.</span>
            </li>
          </ul>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Missions;
