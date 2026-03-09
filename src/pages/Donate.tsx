import { useState } from "react";
import { Coffee, Heart, CreditCard, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Donate = () => {
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStripeDonation = async (amountInCents: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: amountInCents,
          currency: "eur",
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
        description: "Please enter an amount of 1€ or more.",
        variant: "destructive",
      });
      return;
    }
    handleStripeDonation(Math.round(amount * 100));
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

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
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
                      {amount}€
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
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
