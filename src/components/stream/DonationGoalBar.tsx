import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DonationGoal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  currency: string;
}

export default function DonationGoalBar() {
  const [goal, setGoal] = useState<DonationGoal | null>(null);
  const [raised, setRaised] = useState(0);

  useEffect(() => {
    const fetchGoal = async () => {
      const { data } = await supabase
        .from("donation_goals")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (data) {
        setGoal(data);
        // Sum donations since goal created
        const { data: donations } = await supabase
          .from("stream_donations")
          .select("amount")
          .gte("created_at", data.created_at);
        if (donations) {
          setRaised(donations.reduce((s, d) => s + d.amount, 0));
        }
      }
    };
    fetchGoal();

    // Listen for new donations
    const channel = supabase
      .channel("goal-donations")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "stream_donations" }, (payload) => {
        setRaised(prev => prev + (payload.new as any).amount);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!goal) return null;

  const pct = Math.min(100, (raised / goal.target_amount) * 100);

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">{goal.title}</span>
        </div>
        <span className="text-xs font-mono text-primary">
          ${(raised / 100).toFixed(0)} / ${(goal.target_amount / 100).toFixed(0)}
        </span>
      </div>
      {goal.description && (
        <p className="text-[10px] text-muted-foreground mb-2">{goal.description}</p>
      )}
      <div className="relative h-3 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      </div>
      <p className="text-[9px] text-muted-foreground mt-1 text-right">{pct.toFixed(0)}% reached</p>
    </div>
  );
}
