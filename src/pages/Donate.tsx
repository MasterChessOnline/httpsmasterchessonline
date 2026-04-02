import { useState } from "react";
import { Heart, Coffee, Crown, Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const presetAmounts = [
  { value: 500, label: "$5", icon: Coffee, description: "Buy us a coffee" },
  { value: 1000, label: "$10", icon: Heart, description: "Show some love" },
  { value: 2500, label: "$25", icon: Star, description: "Generous supporter" },
  { value: 5000, label: "$50", icon: Crown, description: "Champion patron" },
];

const Donate = () => {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  const getAmountInCents = () => {
    if (isCustom) {
      const parsed = parseFloat(customAmount);
      if (isNaN(parsed) || parsed < 1) return 0;
      return Math.round(parsed * 100);
    }
    return selectedAmount || 0;
  };

  const handleDonate = async () => {
    const amountCents = getAmountInCents();
    if (amountCents < 100) {
      toast.error("Minimum donation is $1");
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
            Support MasterChess
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Help us keep MasterChess free for everyone. Every contribution fuels new features and better experiences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-elevated rounded-2xl p-6 md:p-8 space-y-6"
        >
          {/* Preset amounts */}
          <div className="grid grid-cols-2 gap-3">
            {presetAmounts.map((preset) => {
              const Icon = preset.icon;
              const isSelected = !isCustom && selectedAmount === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => {
                    setSelectedAmount(preset.value);
                    setIsCustom(false);
                  }}
                  className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-2xl font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {preset.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                  {isSelected && (
                    <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-primary" />
                  )}
                </button>
              );
            })}
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="relative"
              >
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg font-bold">$</span>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-8 text-lg h-12 bg-card/50 border-border/50"
                  autoFocus
                />
              </motion.div>
            )}
          </div>

          {/* Donate button */}
          <Button
            onClick={handleDonate}
            disabled={loading || getAmountInCents() < 100}
            size="lg"
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow gold-reflection"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Heart className="w-5 h-5 mr-2" />
            )}
            {loading
              ? "Processing..."
              : `Donate ${getAmountInCents() >= 100 ? `$${(getAmountInCents() / 100).toFixed(2)}` : ""}`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment powered by Stripe. You'll be redirected to complete your donation.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
