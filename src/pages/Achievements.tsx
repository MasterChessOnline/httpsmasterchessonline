import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COLLECTIBLES, RARITY_COLORS, Collectible } from "@/lib/collectibles-data";
import { Crown, Trophy, Star, Zap, Brain, Flame, Medal, TrendingUp, Swords, Lock, Gem, Shield } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { hasAccess, type TierKey } from "@/lib/premium-tiers";

const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy, medal: Medal, crown: Crown, swords: Swords,
  "trending-up": TrendingUp, star: Star, zap: Zap, brain: Brain, flame: Flame,
  gem: Gem, shield: Shield,
};

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  reward_type: string | null;
  reward_value: string | null;
}

const Achievements = () => {
  const { user, profile, isPremium, subscriptionTier, loading } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [collectibles, setCollectibles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const { data: achData } = await supabase.from("achievements").select("*");
      if (achData) setAchievements(achData);

      if (user) {
        const { data: earnedData } = await supabase
          .from("user_achievements")
          .select("achievement_id, earned_at")
          .eq("user_id", user.id);
        if (earnedData) setEarned(new Set(earnedData.map((e) => e.achievement_id)));

        const { data: collData } = await supabase
          .from("user_collectibles")
          .select("collectible_key")
          .eq("user_id", user.id);
        if (collData) setCollectibles(new Set(collData.map((c) => c.collectible_key)));
      }
    };
    fetchData();
  }, [user]);

  // Check and auto-grant achievements based on profile stats and tier
  useEffect(() => {
    if (!user || !profile || achievements.length === 0) return;

    const checkAndGrant = async () => {
      for (const ach of achievements) {
        if (earned.has(ach.id)) continue;
        let qualifies = false;
        switch (ach.requirement_type) {
          case "games_won": qualifies = profile.games_won >= ach.requirement_value; break;
          case "games_played": qualifies = profile.games_played >= ach.requirement_value; break;
          case "rating": qualifies = profile.rating >= ach.requirement_value; break;
          case "premium": qualifies = isPremium; break;
          case "tier_pro": qualifies = hasAccess(subscriptionTier, "pro"); break;
          case "tier_elite": qualifies = hasAccess(subscriptionTier, "elite"); break;
          case "tier_grandmaster": qualifies = hasAccess(subscriptionTier, "grandmaster"); break;
          default: break;
        }
        if (qualifies) {
          const { error } = await supabase.from("user_achievements").insert({ user_id: user.id, achievement_id: ach.id });
          if (!error) {
            setEarned((prev) => new Set([...prev, ach.id]));
            if (ach.reward_type === "collectible" && ach.reward_value) {
              const collectible = COLLECTIBLES.find((c) => c.key === ach.reward_value);
              if (collectible && !collectibles.has(ach.reward_value)) {
                await supabase.from("user_collectibles").insert({
                  user_id: user.id,
                  collectible_type: collectible.type,
                  collectible_key: ach.reward_value,
                });
                setCollectibles((prev) => new Set([...prev, ach.reward_value!]));
              }
            }
          }
        }
      }
    };
    checkAndGrant();
  }, [user, profile, achievements, isPremium, subscriptionTier]);

  const earnedCount = earned.size;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="text-center mb-8">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-3">
            <Trophy className="w-3 h-3 mr-1" /> Achievements
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Achievements & <span className="text-gradient-gold">Collectibles</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {user ? `${earnedCount}/${totalCount} achievements earned` : "Sign in to track your achievements"}
          </p>
        </div>

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 mb-6">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="collectibles">Collectibles</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((ach) => {
                const isEarned = earned.has(ach.id);
                const Icon = ICON_MAP[ach.icon] || Trophy;
                const reward = ach.reward_value ? COLLECTIBLES.find((c) => c.key === ach.reward_value) : null;
                const isTierReq = ach.requirement_type.startsWith("tier_");
                return (
                  <div
                    key={ach.id}
                    className={`bg-card border rounded-xl p-4 transition-all ${
                      isEarned ? "border-primary/40 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]" : "border-border opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isEarned ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold flex items-center gap-1.5">
                          {ach.name}
                          {isEarned && <span className="text-primary text-xs">✓</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                        {isTierReq && !isEarned && (
                          <p className="text-[10px] text-amber-400 mt-1">🔒 Requires {ach.requirement_type.replace("tier_", "").charAt(0).toUpperCase() + ach.requirement_type.replace("tier_", "").slice(1)} tier</p>
                        )}
                        {reward && (
                          <p className="text-[10px] text-primary mt-1">Reward: {reward.preview} {reward.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="collectibles">
            {!user ? (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Sign in to view your collectibles.</p>
                <Button onClick={() => navigate("/login")} className="mt-4">Sign In</Button>
              </div>
            ) : (
              <div className="space-y-8">
                {(["board", "pieces", "avatar"] as const).map((type) => {
                  const items = COLLECTIBLES.filter((c) => c.type === type);
                  return (
                    <div key={type}>
                      <h2 className="text-lg font-bold mb-3 capitalize" style={{ fontFamily: "var(--font-display)" }}>
                        {type === "board" ? "Board Themes" : type === "pieces" ? "Piece Sets" : "Avatars"}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {items.map((item) => {
                          const owned = collectibles.has(item.key);
                          return (
                            <div
                              key={item.key}
                              className={`bg-card border rounded-xl p-4 text-center transition-all ${
                                owned ? `${RARITY_COLORS[item.rarity]}` : "border-border opacity-40"
                              }`}
                            >
                              <div className="text-3xl mb-2">{item.preview}</div>
                              <h3 className="text-sm font-semibold">{item.name}</h3>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
                              <Badge variant="outline" className={`mt-2 text-[10px] ${RARITY_COLORS[item.rarity]}`}>
                                {item.rarity}
                              </Badge>
                              {!owned && (
                                <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> Locked
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
