import { motion } from "framer-motion";
import { Star, Flame, Crown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIERS = [
  {
    id: "supporter",
    name: "Supporter",
    price: "$2.99/mo",
    icon: Star,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "from-blue-900/20 to-transparent",
    badge: "⭐",
    perks: ["Supporter badge in chat", "Queue priority", "Ad-free experience"],
  },
  {
    id: "vip",
    name: "VIP",
    price: "$5.99/mo",
    icon: Flame,
    color: "text-orange-400",
    borderColor: "border-orange-500/30",
    bgColor: "from-orange-900/20 to-transparent",
    badge: "🔥",
    popular: true,
    perks: ["VIP badge in chat", "Higher queue priority", "Exclusive emotes", "Monthly giveaway entry"],
  },
  {
    id: "legend",
    name: "Legend",
    price: "$9.99/mo",
    icon: Crown,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    bgColor: "from-yellow-900/20 to-transparent",
    badge: "👑",
    perks: ["Legend badge in chat", "Highest queue priority", "Guaranteed daily match vs streamer", "Custom profile flair", "Direct messages to streamer"],
  },
];

export default function SubscriptionTiers() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (tierId: string) => {
    if (!user) {
      toast({ title: "Sign in to subscribe", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-subscription", {
        body: { 
          priceId: `tier_${tierId}`,
          returnUrl: window.location.origin,
        },
      });
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        toast({ title: "Subscription coming soon!", description: "Stripe subscription tiers are being configured." });
      }
    } catch {
      toast({ title: "Coming soon!", description: "Subscription system is being set up." });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {TIERS.map((tier, i) => {
        const Icon = tier.icon;
        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative border ${tier.borderColor} bg-gradient-to-b ${tier.bgColor} backdrop-blur-sm overflow-hidden`}>
              {tier.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-orange-500 text-white border-0 text-[9px]">
                    POPULAR
                  </Badge>
                </div>
              )}
              <CardContent className="p-5 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${tier.color}`} />
                <h3 className={`font-display text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{tier.price}</p>
                <div className="mt-4 space-y-2 text-left">
                  {tier.perks.map((perk, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-foreground/70">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${tier.color}`} />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  className="w-full mt-4 text-xs h-9"
                  variant={tier.popular ? "default" : "outline"}
                >
                  {tier.badge} Subscribe
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
