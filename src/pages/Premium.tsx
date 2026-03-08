import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Loader2, MessageCircle, Play, Target, Award, ArrowRight, Star, Gem, Shield, X, Brain, Trophy, Swords, TrendingUp, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TIERS, getTierLevel, type TierKey } from "@/lib/premium-tiers";

const premiumFeatures = [
  { icon: MessageCircle, label: "Strategy Lounge", description: "Real-time chat with premium members", href: "/premium/chat" },
  { icon: Play, label: "Video Lessons", description: "Advanced tutorials and masterclasses", href: "/premium/lessons" },
  { icon: Target, label: "Personalized Puzzles", description: "Puzzles matched to your skill level", href: "/premium/puzzles" },
  { icon: Award, label: "Achievements", description: "Earn badges and collectible rewards", href: "/achievements" },
];

const tierIcons: Record<TierKey, typeof Crown> = {
  premium: Crown,
  pro: Star,
  elite: Gem,
  grandmaster: Shield,
};

const tierAccents: Record<TierKey, string> = {
  premium: "border-primary/30",
  pro: "border-blue-500/40 ring-1 ring-blue-500/20",
  elite: "border-purple-500/40 ring-1 ring-purple-500/20",
  grandmaster: "border-amber-500/40 ring-2 ring-amber-500/30",
};

const tierBadgeColors: Record<TierKey, string> = {
  premium: "bg-primary/20 text-primary",
  pro: "bg-blue-500/20 text-blue-400",
  elite: "bg-purple-500/20 text-purple-400",
  grandmaster: "bg-amber-500/20 text-amber-400",
};

// Feature comparison table
const FEATURE_ROWS = [
  { label: "Daily Puzzles", free: "3/day", premium: "Unlimited", pro: "Unlimited", elite: "Unlimited", gm: "Unlimited" },
  { label: "Puzzle Difficulties", free: "Easy & Medium", premium: "All", pro: "All + Personalized", elite: "All + Personalized", gm: "All + Personalized" },
  { label: "Courses", free: "Beginner only", premium: "Beginner & Intermediate", pro: "All including Advanced", elite: "All including Advanced", gm: "All including Advanced" },
  { label: "Video Lessons", free: false, premium: "Basic", pro: "All + Advanced", elite: "All + Advanced", gm: "All + Advanced" },
  { label: "Strategy Lounge Chat", free: false, premium: true, pro: true, elite: true, gm: true },
  { label: "Ad-free Experience", free: false, premium: true, pro: true, elite: true, gm: true },
  { label: "Premium Profile Badge", free: false, premium: true, pro: true, elite: true, gm: true },
  { label: "Advanced Game Analytics", free: false, premium: "Basic", pro: "Full", elite: "Full", gm: "Full" },
  { label: "Personalized Puzzle Training", free: false, premium: false, pro: true, elite: true, gm: true },
  { label: "VIP Leaderboard", free: false, premium: false, pro: false, elite: true, gm: true },
  { label: "VIP Tournaments", free: false, premium: false, pro: false, elite: true, gm: true },
  { label: "Virtual Trophies & Collectibles", free: false, premium: false, pro: false, elite: true, gm: true },
  { label: "Private Tournaments with Friends", free: false, premium: false, pro: false, elite: false, gm: true },
  { label: "Priority Support", free: false, premium: false, pro: false, elite: false, gm: true },
  { label: "Exclusive Collectible Rewards", free: false, premium: false, pro: false, elite: false, gm: true },
];

function CellDisplay({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-primary mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
  return <span className="text-xs text-foreground">{value}</span>;
}

const Premium = () => {
  const { user, isPremium, subscriptionTier, subscriptionEnd, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async (priceId: string, tierKey: string) => {
    if (!user) { navigate("/login"); return; }
    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error", description: "Could not start checkout. Please try again.", variant: "destructive" });
    } finally { setLoadingTier(null); }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast({ title: "Error", description: "Could not open subscription management.", variant: "destructive" });
    } finally { setPortalLoading(false); }
  };

  const handleRefresh = async () => {
    await checkSubscription();
    toast({ title: "Status refreshed" });
  };

  const userTierLevel = getTierLevel(subscriptionTier);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 text-sm">
            <Crown className="w-3.5 h-3.5 mr-1" /> Premium Plans
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Elevate Your Game
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose the plan that matches your ambition. Every tier unlocks more power.
          </p>
        </div>

        {/* Premium features grid for subscribers */}
        {isPremium && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {premiumFeatures.map((f) => (
              <Link key={f.href} to={f.href} className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all group flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/25 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    {f.label}
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Free tier highlight */}
        {!isPremium && (
          <div className="mb-10 rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Free Plan</h2>
                <p className="text-sm text-muted-foreground">You're currently on the free plan</p>
              </div>
              <span className="text-2xl font-bold ml-auto">$0</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Brain, label: "3 puzzles/day", desc: "Easy & Medium only" },
                { icon: Trophy, label: "Open tournaments", desc: "Standard access" },
                { icon: TrendingUp, label: "ELO leaderboard", desc: "Public rankings" },
                { icon: Swords, label: "Play online", desc: "All time controls" },
              ].map(f => (
                <div key={f.label} className="rounded-lg border border-border/50 bg-muted/20 p-3 text-center">
                  <f.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {TIERS.map((tier) => {
            const Icon = tierIcons[tier.key];
            const isCurrentTier = subscriptionTier === tier.key;
            const tierLevel = getTierLevel(tier.key);
            const canUpgrade = isPremium && tierLevel > userTierLevel;
            const isLower = isPremium && tierLevel <= userTierLevel && !isCurrentTier;
            return (
              <Card key={tier.key} className={`bg-card relative flex flex-col ${tierAccents[tier.key]} ${isCurrentTier ? "shadow-lg" : ""} ${tier.popular ? "scale-[1.02]" : ""}`}>
                {tier.popular && !isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white border-0 text-xs">Most Popular</Badge>
                  </div>
                )}
                {isCurrentTier && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground border-0 text-xs">Your Plan</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2 pt-6">
                  <div className={`w-10 h-10 rounded-full ${tierBadgeColors[tier.key]} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>{tier.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrentTier ? (
                    <div className="space-y-2">
                      <p className="text-center text-xs text-muted-foreground">
                        Active until {subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : "—"}
                      </p>
                      <Button onClick={handleManage} disabled={portalLoading} className="w-full" variant="outline" size="sm">
                        {portalLoading ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null} Manage
                      </Button>
                      <Button onClick={handleRefresh} variant="ghost" className="w-full text-xs" size="sm">Refresh status</Button>
                    </div>
                  ) : isLower ? (
                    <Button disabled variant="outline" size="sm" className="w-full opacity-50">Included in your plan</Button>
                  ) : (
                    <Button onClick={() => handleCheckout(tier.priceId, tier.key)} disabled={loadingTier === tier.key} className="w-full text-sm" size="sm">
                      {loadingTier === tier.key ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Icon className="w-3.5 h-3.5 mr-1" />}
                      {canUpgrade ? "Upgrade" : "Subscribe"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature comparison table */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display text-xl font-bold text-foreground text-center">Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground min-w-[180px]">Feature</th>
                  <th className="p-3 font-medium text-muted-foreground text-center w-24">Free</th>
                  <th className="p-3 font-medium text-primary text-center w-24">Premium</th>
                  <th className="p-3 font-medium text-blue-400 text-center w-24">Pro</th>
                  <th className="p-3 font-medium text-purple-400 text-center w-24">Elite</th>
                  <th className="p-3 font-medium text-amber-400 text-center w-24">GM</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.map((row, i) => (
                  <tr key={row.label} className={`border-b border-border/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="p-3 text-foreground font-medium">{row.label}</td>
                    <td className="p-3 text-center"><CellDisplay value={row.free} /></td>
                    <td className="p-3 text-center"><CellDisplay value={row.premium} /></td>
                    <td className="p-3 text-center"><CellDisplay value={row.pro} /></td>
                    <td className="p-3 text-center"><CellDisplay value={row.elite} /></td>
                    <td className="p-3 text-center"><CellDisplay value={row.gm} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Premium;
