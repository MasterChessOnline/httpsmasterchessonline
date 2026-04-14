import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DonorRankBadge from "./DonorRankBadge";

interface Donation {
  id: string;
  username: string;
  amount: number;
  message: string | null;
  created_at: string;
}

export default function RecentDonationsFeed() {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("stream_donations")
        .select("id, username, amount, message, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setDonations(data);
    };
    fetch();

    const channel = supabase
      .channel("recent-donations-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "stream_donations" }, (payload) => {
        const d = payload.new as Donation;
        setDonations(prev => [d, ...prev].slice(0, 10));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (donations.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Heart className="w-3.5 h-3.5 text-red-400" />
        <span className="text-xs font-bold text-foreground">Recent Donations</span>
      </div>
      <AnimatePresence mode="popLayout">
        {donations.slice(0, 5).map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/10 border border-border/20"
          >
            <span className="text-[10px] font-bold text-foreground truncate max-w-[80px]">{d.username}</span>
            <DonorRankBadge totalCents={d.amount} size="sm" />
            <span className="text-[10px] font-mono text-primary ml-auto">${(d.amount / 100).toFixed(2)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
