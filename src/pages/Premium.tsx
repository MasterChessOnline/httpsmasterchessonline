import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, Shield, Trophy, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const features = [
  { icon: Zap, label: "Ad-free experience" },
  { icon: Trophy, label: "Exclusive tournaments" },
  { icon: Shield, label: "Unlimited puzzle history" },
  { icon: Sparkles, label: "Advanced game analytics" },
  { icon: Crown, label: "Premium profile badge" },
];

const Premium = () => {
  const { user, isPremium, subscriptionEnd, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast({ title: "Error", description: "Could not start checkout. Please try again.", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast({ title: "Error", description: "Could not open subscription management.", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleRefresh = async () => {
    await checkSubscription();
    toast({ title: "Status refreshed" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 text-sm">
            <Crown className="w-3.5 h-3.5 mr-1" /> Premium
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Elevate Your Game
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock the full KnightMate experience with premium features designed for serious players.
          </p>
        </div>

        <Card className="bg-card border-primary/30 max-w-md mx-auto">
          <CardHeader className="text-center pb-2">
            {isPremium && (
              <Badge className="bg-primary text-primary-foreground w-fit mx-auto mb-2">Your Plan</Badge>
            )}
            <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              Premium
            </CardTitle>
            <div className="mt-2">
              <span className="text-4xl font-bold text-primary">$4.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{f.label}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">
                  Active until {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : "—"}
                </p>
                <Button onClick={handleManage} disabled={portalLoading} className="w-full" variant="outline">
                  {portalLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Manage Subscription
                </Button>
                <Button onClick={handleRefresh} variant="ghost" className="w-full text-xs">
                  Refresh status
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-5"
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crown className="w-4 h-4 mr-2" />}
                Subscribe Now
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Premium;
