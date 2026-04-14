import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDonorRank, DONOR_RANKS } from "@/lib/donor-ranks";
import DonorRankBadge from "@/components/stream/DonorRankBadge";

interface DonorEntry {
  username: string;
  total: number;
}

export default function DonationStats() {
  const [leaderboard, setLeaderboard] = useState<DonorEntry[]>([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("stream_donations")
        .select("username, amount");

      if (data) {
        const byUser: Record<string, number> = {};
        let total = 0;
        data.forEach(d => {
          byUser[d.username] = (byUser[d.username] || 0) + d.amount;
          total += d.amount;
        });
        setTotalRaised(total);
        setTotalDonors(Object.keys(byUser).length);
        const sorted = Object.entries(byUser)
          .map(([username, total]) => ({ username, total }))
          .sort((a, b) => b.total - a.total);
        setLeaderboard(sorted);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const topDonor = leaderboard[0];

  return (
    <div className="min-h-screen bg-background relative">
      <DynamicBackground />
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Donation <span className="text-gradient-gold">Leaderboard</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Our amazing supporters keeping MasterChess alive
          </p>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Heart, label: "Total Raised", value: `$${(totalRaised / 100).toFixed(0)}`, color: "text-red-400" },
            { icon: Users, label: "Donors", value: String(totalDonors), color: "text-blue-400" },
            { icon: TrendingUp, label: "Top Donation", value: topDonor ? `$${(topDonor.total / 100).toFixed(0)}` : "$0", color: "text-yellow-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Rank legend */}
        <Card className="border-border/30 bg-card/60 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <h3 className="text-xs font-bold text-foreground mb-3">♟️ Donor Ranks</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DONOR_RANKS.map(r => (
                <div key={r.key} className={`flex items-center gap-2 p-2 rounded-lg ${r.bgColor} border ${r.borderColor}`}>
                  <span className="text-lg">{r.icon}</span>
                  <div>
                    <p className={`text-xs font-bold ${r.color}`}>{r.label}</p>
                    <p className="text-[9px] text-muted-foreground">${(r.minCents / 100).toFixed(0)}+</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border/30 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-bold text-foreground">Top Supporters</h3>
            </div>
            {loading ? (
              <p className="text-xs text-muted-foreground text-center py-8">Loading...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No donations yet — be the first!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => {
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  return (
                    <motion.div
                      key={entry.username}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        i < 3
                          ? "border-yellow-500/20 bg-yellow-500/5"
                          : "border-border/20 bg-muted/5"
                      }`}
                    >
                      <span className="text-sm font-mono text-muted-foreground w-6 text-right">
                        {medal || `#${i + 1}`}
                      </span>
                      <span className="text-sm font-bold text-foreground flex-1 truncate">
                        {entry.username}
                      </span>
                      <DonorRankBadge totalCents={entry.total} size="sm" />
                      <span className="text-sm font-mono font-bold text-primary">
                        ${(entry.total / 100).toFixed(2)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
