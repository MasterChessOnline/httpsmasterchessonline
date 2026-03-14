import { useState, useEffect } from "react";
import { Heart, CreditCard, Trophy, Medal, Crown, Gift, Zap, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TopDonor {
  total: number;
  count: number;
}

interface DonationGoal {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  currency: string;
}

interface DonationProgress {
  goal: DonationGoal | null;
  currentAmount: number;
  progressPercentage: number;
}

const presetAmounts = [
  { value: 3, label: "$3", icon: Heart, description: "Buy us a coffee" },
  { value: 5, label: "$5", icon: Star, description: "Support a feature" },
  { value: 10, label: "$10", icon: Crown, description: "Champion supporter" },
];

const Donate = () => {
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [donationProgress, setDonationProgress] = useState<DonationProgress>({
    goal: null,
    currentAmount: 0,
    progressPercentage: 0,
  });
  const { toast } = useToast();

  const handleStripeDonation = async (amountInCents: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: amountInCents,
          currency: "usd",
          itemType: "donation",
          returnUrl: window.location.origin,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Donation error:", error);
      toast({
        title: "Error starting payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter an amount of $1 or more.",
        variant: "destructive",
      });
      return;
    }
    handleStripeDonation(Math.round(amount * 100));
  };

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    handleStripeDonation(amount * 100);
  };

  const fetchTopDonors = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("user_id, amount")
        .eq("item_type", "donation")
        .eq("status", "completed");

      if (error) throw error;

      const donorMap = new Map<string | null, { total: number; count: number }>();
      data?.forEach((purchase) => {
        const key = purchase.user_id || "anonymous";
        const existing = donorMap.get(key) || { total: 0, count: 0 };
        donorMap.set(key, {
          total: existing.total + purchase.amount,
          count: existing.count + 1,
        });
      });

      const sortedDonors = Array.from(donorMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setTopDonors(sortedDonors);
    } catch (error) {
      console.error("Error fetching top donors:", error);
    }
  };

  const fetchDonationProgress = async () => {
    try {
      const { data: goalData, error: goalError } = await supabase
        .from("donation_goals")
        .select("*")
        .eq("is_active", true)
        .single();

      if (goalError) return;

      const { data: donationData, error: donationError } = await supabase
        .from("purchases")
        .select("amount")
        .eq("item_type", "donation")
        .eq("status", "completed")
        .eq("currency", goalData.currency);

      if (donationError) return;

      const currentAmount = donationData?.reduce((sum, d) => sum + d.amount, 0) || 0;
      const progressPercentage = goalData.target_amount > 0
        ? Math.min((currentAmount / goalData.target_amount) * 100, 100)
        : 0;

      setDonationProgress({ goal: goalData, currentAmount, progressPercentage });
    } catch (error) {
      console.error("Error fetching donation progress:", error);
    }
  };

  useEffect(() => {
    fetchTopDonors();
    fetchDonationProgress();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-primary" />;
    if (index === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (index === 2) return <Medal className="h-5 w-5 text-secondary-foreground" />;
    return <Trophy className="h-4 w-4 text-primary/60" />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Heart className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Community Supported</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight">
              Support MasterChessOnline
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Help <span className="font-semibold text-foreground">DailyChess_12</span> keep the servers running, develop new lessons, host tournaments, and keep the core features ad-free.
            </p>
          </div>

          {/* Donation Goal Progress */}
          {donationProgress.goal && (
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
              <CardContent className="p-6 space-y-4 relative">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-primary">{donationProgress.goal.title}</h2>
                  {donationProgress.goal.description && (
                    <p className="text-sm text-muted-foreground mt-1">{donationProgress.goal.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      ${(donationProgress.currentAmount / 100).toFixed(2)} raised
                    </span>
                    <span className="text-muted-foreground">
                      ${(donationProgress.goal.target_amount / 100).toFixed(2)} goal
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${donationProgress.progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-center text-2xl font-bold text-primary">
                    {donationProgress.progressPercentage.toFixed(1)}%
                    <span className="text-sm font-normal text-muted-foreground ml-2">complete</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preset Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {presetAmounts.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                onClick={() => handlePresetClick(value)}
                disabled={loading}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Payment Card */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Custom Amount
                </CardTitle>
                <CardDescription>Card, Apple Pay, Google Pay via Stripe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="pl-7"
                    />
                  </div>
                  <Button
                    onClick={handleCustomDonation}
                    disabled={loading || !customAmount}
                    className="min-w-[100px]"
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Donate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  All payments are securely processed. You'll be redirected to a secure checkout page.
                </p>
              </CardContent>
            </Card>

            {/* Top Supporters */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-primary" />
                  Top Supporters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {topDonors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Be the first supporter!
                  </p>
                ) : (
                  topDonors.slice(0, 5).map((donor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <span className="text-sm font-medium">Anonymous</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ${(donor.total / 100).toFixed(0)}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Why Donate */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-4 gap-6 text-center">
                {[
                  { icon: Zap, text: "Keep servers running 24/7" },
                  { icon: Star, text: "Develop new lessons & puzzles" },
                  { icon: Trophy, text: "Host free tournaments" },
                  { icon: Heart, text: "Keep the experience ad-free" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="space-y-2">
                    <Icon className="h-6 w-6 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
