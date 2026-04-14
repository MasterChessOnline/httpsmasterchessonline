import { useState } from "react";
import { Heart, Coffee, DollarSign, Star, Crown, Loader2, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DONOR_RANKS, DONATION_REWARDS, getDonorRank, getDonorProgress, getNextDonorRank } from "@/lib/donor-ranks";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const presetAmounts = [
  { value: 50,   label: "$0.50", icon: "♟️", description: "Quick tip" },
  { value: 100,  label: "$1",    icon: "♞",  description: "Buy us a coffee" },
  { value: 200,  label: "$2",    icon: "♝",  description: "Show some love" },
  { value: 500,  label: "$5",    icon: "♜",  description: "Generous supporter" },
  { value: 1000, label: "$10",   icon: "♛",  description: "Champion patron" },
  { value: 2500, label: "$25",   icon: "♚",  description: "Royal patron" },
];

const Donate = () => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationMessage, setDonationMessage] = useState("");

  const getAmountInCents = () => {
    if (isCustom) {
      const parsed = parseFloat(customAmount);
      if (isNaN(parsed) || parsed < 0.5) return 0;
      return Math.round(parsed * 100);
    }
    return selectedAmount || 0;
  };

  const handleDonate = async () => {
    const amountCents = getAmountInCents();
    if (amountCents < 50) {
      toast.error("Minimum donation is $0.50");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: amountCents,
          currency: "usd",
          itemType: "donation",
          itemId: "general",
          message: donationMessage,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grain-texture">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Support <span className="text-gradient-gold">MasterChess</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Every donation keeps MasterChess free. Earn donor ranks and unlock rewards!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-elevated rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* Quick donate - preset amounts */}
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">⚡ Quick Donate</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presetAmounts.map((preset) => {
                const isSelected = !isCustom && selectedAmount === preset.value;
                return (
                  <motion.button
                    key={preset.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSelectedAmount(preset.value); setIsCustom(false); }}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        : "border-border/30 bg-card/30 hover:border-primary/40 hover:shadow-[0_0_10px_rgba(var(--primary),0.15)]"
                    }`}
                  >
                    <span className="text-xl">{preset.icon}</span>
                    <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {preset.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground hidden sm:block">{preset.description}</span>
                    {isSelected && <CheckCircle className="absolute top-1 right-1 w-3 h-3 text-primary" />}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <button
              onClick={() => setIsCustom(true)}
              className={`w-full text-sm font-medium text-center py-2 rounded-lg transition-colors ${
                isCustom ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Or enter a custom amount
            </button>
            {isCustom && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">$</span>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="0.50"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-8 text-lg h-12 bg-card/50 border-border/50"
                  autoFocus
                />
              </motion.div>
            )}
          </div>

          {/* Message */}
          <Input
            value={donationMessage}
            onChange={e => setDonationMessage(e.target.value)}
            placeholder="Add a message (shows on stream!) — max 120 chars"
            maxLength={120}
            className="h-10 bg-card/50 border-border/50"
          />

          {/* Donate button */}
          <Button
            onClick={handleDonate}
            disabled={loading || getAmountInCents() < 50}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow gold-reflection group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            )}
            {loading
              ? "Processing..."
              : `Donate ${getAmountInCents() >= 50 ? `$${(getAmountInCents() / 100).toFixed(2)}` : ""}`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment via Stripe · 1-click checkout · Mobile-friendly
          </p>
        </motion.div>

        {/* Donor Ranks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-elevated rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" /> Donor Ranks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DONOR_RANKS.map((r, i) => (
              <motion.div
                key={r.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${r.borderColor} ${r.bgColor} ${r.glow ? `shadow-lg ${r.glow}` : ""}`}
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className={`text-sm font-bold ${r.color}`}>{r.label}</p>
                  <p className="text-[10px] text-muted-foreground">${(r.minCents / 100).toFixed(0)}+ total</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Unlock Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass-elevated rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            🎁 Unlock Rewards
          </h2>
          <div className="space-y-2">
            {DONATION_REWARDS.map((reward, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/10 border border-border/20">
                <span className="text-lg">{reward.icon}</span>
                <span className="text-xs font-medium text-foreground flex-1">{reward.label}</span>
                <Badge variant="outline" className="text-[10px]">${(reward.minCents / 100).toFixed(0)}+</Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <div className="flex justify-center gap-3 mt-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/donation-stats">📊 Leaderboard</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/live">🎥 Watch Live</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
