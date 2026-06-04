import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Coins, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { celebrate } from "@/lib/celebrate";
import { toast } from "sonner";

/**
 * Daily Mystery Box — uses the existing claim_daily_spin RPC server-side.
 * Visible on home for logged-in users. Builds daily-return habit.
 */
export default function DailyMysteryBox() {
  const { user } = useAuth();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [alreadyToday, setAlreadyToday] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `mc_mystery_box_${user.id}_${new Date().toISOString().slice(0, 10)}`;
    if (localStorage.getItem(key)) setAlreadyToday(true);
  }, [user]);

  if (!user) {
    return (
      <Link
        to="/signup?bonus=mystery"
        className="block rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/60 to-card/30 p-5 hover:border-primary/60 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0], y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="h-14 w-14 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center"
          >
            <Gift className="h-7 w-7 text-primary" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
              Daily Mystery Box
            </div>
            <div className="text-sm font-semibold text-foreground">
              Sign up to claim daily rewards
            </div>
            <div className="text-[11px] text-muted-foreground">25–2,500 coins every 24h</div>
          </div>
          <Sparkles className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  const open = async () => {
    if (opened || loading || alreadyToday) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("claim_daily_spin");
      if (error) throw error;
      const result = data as { ok?: boolean; coins?: number; error?: string };
      if (result?.ok && typeof result.coins === "number") {
        setReward(result.coins);
        setOpened(true);
        celebrate(result.coins >= 500 ? "big" : "medium");
        const key = `mc_mystery_box_${user.id}_${new Date().toISOString().slice(0, 10)}`;
        localStorage.setItem(key, String(result.coins));
      } else if (result?.error === "already_claimed") {
        setAlreadyToday(true);
        toast("Come back tomorrow for your next box.");
      } else {
        toast.error("Couldn't open the box. Try again.");
      }
    } catch {
      toast.error("Network hiccup. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={open}
      disabled={loading || alreadyToday || opened}
      className="w-full text-left rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/60 to-card/30 p-5 hover:border-primary/60 disabled:opacity-75 transition-colors group relative overflow-hidden"
    >
      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          animate={
            opened || alreadyToday
              ? { rotate: 0, y: 0 }
              : { rotate: [0, -8, 8, -8, 0], y: [0, -4, 0] }
          }
          transition={{ duration: 2.5, repeat: opened || alreadyToday ? 0 : Infinity }}
          className="h-14 w-14 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0"
        >
          {opened ? (
            <Coins className="h-7 w-7 text-primary" />
          ) : (
            <Gift className="h-7 w-7 text-primary" />
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
            Daily Mystery Box
          </div>
          <AnimatePresence mode="wait">
            {opened && reward !== null ? (
              <motion.div
                key="opened"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold text-foreground"
              >
                +{reward.toLocaleString()} coins!
              </motion.div>
            ) : alreadyToday ? (
              <motion.div
                key="claimed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-semibold text-muted-foreground"
              >
                Claimed today — back tomorrow
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-semibold text-foreground"
              >
                {loading ? "Opening…" : "Tap to open today's box"}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="text-[11px] text-muted-foreground">25–2,500 coins · resets at midnight UTC</div>
        </div>
      </div>
    </button>
  );
}
