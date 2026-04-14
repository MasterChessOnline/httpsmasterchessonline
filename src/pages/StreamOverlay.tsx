import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getDonorRank } from "@/lib/donor-ranks";
import { getRandomReaction } from "@/lib/donor-ranks";

/**
 * OBS Browser Source overlay.
 * Add as browser source: /overlay?width=800&height=200
 * Background: transparent
 */

interface LatestDonation {
  id: string;
  username: string;
  amount: number;
  message: string | null;
}

interface GoalData {
  title: string;
  target: number;
  raised: number;
}

export default function StreamOverlay() {
  const [latestDonation, setLatestDonation] = useState<LatestDonation | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [topDonor, setTopDonor] = useState<{ username: string; total: number } | null>(null);
  const [goal, setGoal] = useState<GoalData | null>(null);
  const [aiReaction, setAiReaction] = useState<string>("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      // Latest donation
      const { data: latest } = await supabase
        .from("stream_donations")
        .select("id, username, amount, message")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) setLatestDonation(latest);

      // Top donor
      const { data: donations } = await supabase
        .from("stream_donations")
        .select("username, amount");
      if (donations) {
        const byUser: Record<string, number> = {};
        donations.forEach(d => { byUser[d.username] = (byUser[d.username] || 0) + d.amount; });
        const sorted = Object.entries(byUser).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) setTopDonor({ username: sorted[0][0], total: sorted[0][1] });
      }

      // Goal
      const { data: goalData } = await supabase
        .from("donation_goals")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (goalData) {
        const { data: goalDonations } = await supabase
          .from("stream_donations")
          .select("amount")
          .gte("created_at", goalData.created_at);
        const raised = goalDonations?.reduce((s, d) => s + d.amount, 0) || 0;
        setGoal({ title: goalData.title, target: goalData.target_amount, raised });
      }
    };
    fetchData();
  }, []);

  // Real-time donation alerts
  useEffect(() => {
    const channel = supabase
      .channel("overlay-donations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "stream_donations" }, (payload) => {
        const d = payload.new as any;
        setLatestDonation({ id: d.id, username: d.username, amount: d.amount, message: d.message });
        setAiReaction(getRandomReaction(d.username));
        setShowAlert(true);
        setGoal(prev => prev ? { ...prev, raised: prev.raised + d.amount } : null);

        // Update top donor
        setTopDonor(prev => {
          if (!prev || d.amount > prev.total) return { username: d.username, total: d.amount };
          return prev;
        });

        setTimeout(() => setShowAlert(false), 6000);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const donorRank = latestDonation ? getDonorRank(latestDonation.amount) : null;
  const goalPct = goal ? Math.min(100, (goal.raised / goal.target) * 100) : 0;

  return (
    <div className="w-full h-screen bg-transparent relative overflow-hidden font-sans">
      {/* Donation Alert Popup */}
      <AnimatePresence>
        {showAlert && latestDonation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="relative px-8 py-6 rounded-2xl bg-gradient-to-br from-yellow-900/95 to-amber-950/95 border-2 border-yellow-400/60 text-center min-w-[350px]">
              {/* Glow */}
              <div className="absolute inset-0 rounded-2xl blur-2xl bg-yellow-500/30" />
              <div className="relative z-10">
                {/* Chess piece animation */}
                <motion.div
                  animate={{ rotateY: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="text-5xl mb-2"
                >
                  {donorRank?.icon || "♟️"}
                </motion.div>
                <p className="text-yellow-300 font-bold text-lg">{latestDonation.username}</p>
                <p className="text-3xl font-black text-white mt-1">
                  ${(latestDonation.amount / 100).toFixed(2)}
                </p>
                {latestDonation.message && (
                  <p className="text-sm text-yellow-200/80 mt-2 italic max-w-xs mx-auto">
                    "{latestDonation.message}"
                  </p>
                )}
                {/* AI Reaction */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-yellow-400/70 mt-2"
                >
                  🧠 {aiReaction}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar: Latest + Top Donor + Goal */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
        {/* Latest donation */}
        {latestDonation && !showAlert && (
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-yellow-500/30">
            <p className="text-[10px] text-yellow-400/60 uppercase tracking-wider">Latest</p>
            <p className="text-sm text-white font-bold">
              {latestDonation.username} — ${(latestDonation.amount / 100).toFixed(2)}
            </p>
          </div>
        )}

        {/* Top donor */}
        {topDonor && (
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-500/30">
            <p className="text-[10px] text-purple-400/60 uppercase tracking-wider">👑 Top Donor</p>
            <p className="text-sm text-white font-bold">
              {topDonor.username} — ${(topDonor.total / 100).toFixed(2)}
            </p>
          </div>
        )}

        {/* Goal bar */}
        {goal && (
          <div className="flex-1 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 border border-primary/30">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-primary/60 uppercase tracking-wider">{goal.title}</p>
              <p className="text-xs text-white font-mono">
                ${(goal.raised / 100).toFixed(0)} / ${(goal.target / 100).toFixed(0)}
              </p>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-yellow-400"
                animate={{ width: `${goalPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
