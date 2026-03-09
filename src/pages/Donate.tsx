import { useState, useEffect } from "react";
import { Heart, CreditCard, Trophy, Medal, Crown } from "lucide-react";
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

const Donate = () => {
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
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

  const fetchTopDonors = async () => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("user_id, amount")
        .eq("item_type", "donation")
        .eq("status", "completed");

      if (error) throw error;

      // Group by user_id and sum amounts, then sort by total
      const donorMap = new Map<string | null, { total: number; count: number }>();
      
      data?.forEach((purchase) => {
        const key = purchase.user_id || "anonymous";
        const existing = donorMap.get(key) || { total: 0, count: 0 };
        donorMap.set(key, {
          total: existing.total + purchase.amount,
          count: existing.count + 1,
        });
      });

      // Convert to array and sort by total amount
      const sortedDonors = Array.from(donorMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); // Top 10

      setTopDonors(sortedDonors);
    } catch (error) {
      console.error("Error fetching top donors:", error);
    }
  };

  const fetchDonationProgress = async () => {
    try {
      // Get active donation goal
      const { data: goalData, error: goalError } = await supabase
        .from("donation_goals")
        .select("*")
        .eq("is_active", true)
        .single();

      if (goalError) {
        console.error("Error fetching donation goal:", goalError);
        return;
      }

      // Get total donations for the goal currency
      const { data: donationData, error: donationError } = await supabase
        .from("purchases")
        .select("amount")
        .eq("item_type", "donation")
        .eq("status", "completed")
        .eq("currency", goalData.currency);

      if (donationError) {
        console.error("Error fetching donations:", donationError);
        return;
      }

      const currentAmount = donationData?.reduce((sum, donation) => sum + donation.amount, 0) || 0;
      const progressPercentage = goalData.target_amount > 0 
        ? Math.min((currentAmount / goalData.target_amount) * 100, 100) 
        : 0;

      setDonationProgress({
        goal: goalData,
        currentAmount,
        progressPercentage,
      });
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
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <Heart className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <h1 className="text-4xl font-bold font-display tracking-tight">Support MasterChess</h1>
            <p className="text-muted-foreground text-lg">
              Your donations help us keep the servers running, develop new lessons, host tournaments, and keep the core features ad-free.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-12">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Card / Apple Pay
                </CardTitle>
                <CardDescription>Secure payment via Stripe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleStripeDonation(amount * 100)}
                      disabled={loading}
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  </div>
                  <Button 
                    onClick={handleCustomDonation}
                    disabled={loading || !customAmount}
                  >
                    Donate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Top Supporters
                </CardTitle>
                <CardDescription>Our amazing community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {topDonors.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Be the first supporter!
                  </p>
                ) : (
                  topDonors.map((donor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <span className="text-sm font-medium">
                          Anonymous Supporter
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          ${(donor.total / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {donor.count} donation{donor.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Why Donate?
                </CardTitle>
                <CardDescription>Your support makes a difference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Every donation helps us:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Keep servers running 24/7</li>
                  <li>Develop new lessons & puzzles</li>
                  <li>Host free tournaments</li>
                  <li>Keep the core experience ad-free</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
