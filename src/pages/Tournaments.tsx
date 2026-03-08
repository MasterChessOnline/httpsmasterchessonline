import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Users, Zap, Swords, BookOpen, Timer, Lock, Crown, Gem, Shield, Star } from "lucide-react";
import { TOURNAMENTS, Tournament } from "@/lib/tournaments-data";
import { hasAccess } from "@/lib/premium-tiers";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All", icon: Trophy },
  { value: "blitz", label: "Blitz", icon: Zap },
  { value: "rapid", label: "Rapid", icon: Timer },
  { value: "classical", label: "Classical", icon: Clock },
  { value: "themed", label: "Themed", icon: BookOpen },
];

const statusStyles: Record<string, { bg: string; label: string }> = {
  live: { bg: "bg-accent text-accent-foreground", label: "🔴 Live" },
  registering: { bg: "bg-primary/10 text-primary", label: "Open" },
  upcoming: { bg: "bg-muted text-muted-foreground", label: "Upcoming" },
  completed: { bg: "bg-muted text-muted-foreground", label: "Completed" },
};

const Tournaments = () => {
  const { user, isPremium, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"open" | "premium" | "vip">("open");

  const isElitePlus = hasAccess(subscriptionTier, "elite");
  const isGrandmaster = hasAccess(subscriptionTier, "grandmaster");

  const filtered = TOURNAMENTS.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
          <span className="text-gradient-gold">Tournaments</span>
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Compete in live tournaments and climb the leaderboard.
        </p>

        {/* View mode tabs */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setViewMode("open")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all border ${
              viewMode === "open" ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" /> Open Tournaments
          </button>
          <button
            onClick={() => setViewMode("premium")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all border ${
              viewMode === "premium" ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
            }`}
          >
            <Crown className="h-3.5 w-3.5" /> Premium Exclusive
          </button>
          <button
            onClick={() => setViewMode("vip")}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all border ${
              viewMode === "vip" ? "border-purple-500 bg-purple-500/10 text-purple-400" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-purple-500/30"
            }`}
          >
            <Gem className="h-3.5 w-3.5" /> VIP & Grandmaster
          </button>
        </div>

        {/* Premium Exclusive tournaments */}
        {viewMode === "premium" && !isPremium ? (
          <div className="max-w-md mx-auto text-center py-16">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Premium Tournaments</h2>
            <p className="text-muted-foreground mb-2">
              Exclusive tournaments for Premium members with special prizes and ELO tracking.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Required tier: <span className="text-primary font-semibold">Premium ($4.99/mo)</span> or higher
            </p>
            <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">
              <Crown className="w-4 h-4 mr-2" /> View Plans
            </Button>
          </div>
        ) : viewMode === "premium" ? (
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-6">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Crown className="w-3 h-3 mr-1" /> Premium Tournament Arena
              </Badge>
            </div>
            <div className="space-y-3">
              <article className="rounded-xl border border-primary/20 bg-card p-5 transition-all hover:border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex rounded-lg bg-primary/10 p-3 shrink-0">
                    <Swords className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-base font-semibold text-foreground">Premium Rapid Cup</h2>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">Open</span>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]"><Crown className="w-2.5 h-2.5 mr-0.5" /> Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Exclusive 10+5 rapid tournament for all premium members with ELO tracking.</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />10+5</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />0/32</span>
                      <span className="text-primary font-medium">🏆 Premium Badge</span>
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0">Register</Button>
                </div>
              </article>
              <article className="rounded-xl border border-blue-500/20 bg-card p-5 transition-all hover:border-blue-500/30">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex rounded-lg bg-blue-500/10 p-3 shrink-0">
                    <Star className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-base font-semibold text-foreground">Pro Blitz Arena</h2>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">Open</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]"><Star className="w-2.5 h-2.5 mr-0.5" /> Pro+</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Pro-level 3+2 blitz arena with advanced analytics after each game.</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />3+2</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />0/16</span>
                      <span className="text-blue-400 font-medium">🏆 Pro Trophy</span>
                    </div>
                  </div>
                  <Button size="sm" variant={hasAccess(subscriptionTier, "pro") ? "default" : "outline"} disabled={!hasAccess(subscriptionTier, "pro")} className="shrink-0">
                    {hasAccess(subscriptionTier, "pro") ? "Register" : "Pro Only"}
                  </Button>
                </div>
              </article>
            </div>
          </div>
        ) : viewMode === "vip" && !isElitePlus ? (
          <div className="max-w-md mx-auto text-center py-16">
            <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>VIP & Grandmaster Tournaments</h2>
            <p className="text-muted-foreground mb-2">
              Compete in exclusive VIP tournaments with premium prizes and elite competition.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Required tier: <span className="text-purple-400 font-semibold">Elite ($15/mo)</span> or higher
            </p>
            <Button onClick={() => navigate("/premium")} className="bg-primary text-primary-foreground">
              <Gem className="w-4 h-4 mr-2" /> View Plans
            </Button>
          </div>
        ) : viewMode === "vip" ? (
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-6">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Gem className="w-3 h-3 mr-1" /> VIP Tournament Arena
              </Badge>
              {isGrandmaster && (
                <div className="mt-3">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Shield className="w-3 h-3 mr-1" /> Grandmaster: You can create private tournaments
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <article className="rounded-xl border border-purple-500/20 bg-card p-5 transition-all hover:border-purple-500/30">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex rounded-lg bg-purple-500/10 p-3 shrink-0">
                    <Swords className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-base font-semibold text-foreground">VIP Blitz Championship</h2>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">Open</span>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">VIP</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Elite-only 5+3 blitz tournament with premium rewards and collectibles.</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />5+3</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />0/16</span>
                      <span className="text-purple-400 font-medium">🏆 Exclusive Collectibles</span>
                    </div>
                  </div>
                  <Button size="sm" className="shrink-0">Register</Button>
                </div>
              </article>
              <article className="rounded-xl border border-amber-500/20 bg-card p-5 transition-all hover:border-amber-500/30">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex rounded-lg bg-amber-500/10 p-3 shrink-0">
                    <Shield className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-display text-base font-semibold text-foreground">Grandmaster Invitational</h2>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">Upcoming</span>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">GM Only</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Private rapid tournament for Grandmaster tier members with legendary trophies.</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />10+5</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />0/8</span>
                      <span className="text-amber-400 font-medium">🏆 Legendary Trophies</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled={!isGrandmaster} className="shrink-0">
                    {isGrandmaster ? "Register" : "GM Only"}
                  </Button>
                </div>
              </article>
            </div>
          </div>
        ) : (
          <>
            {/* Category filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {CATEGORY_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setCategory(opt.value)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${
                    category === opt.value ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <opt.icon className="h-3.5 w-3.5" /> {opt.label}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex justify-center gap-2 mb-8">
              {["all", "live", "registering", "upcoming"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                    statusFilter === s ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Free tier note */}
            {!isPremium && (
              <div className="max-w-2xl mx-auto mb-6 rounded-lg border border-border/50 bg-muted/20 p-3 flex items-center gap-3">
                <Crown className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Free players can join open tournaments. <span className="text-primary font-medium cursor-pointer" onClick={() => navigate("/premium")}>Upgrade</span> for exclusive premium, VIP, and private tournaments.
                </p>
              </div>
            )}

            <div className="mx-auto max-w-2xl space-y-3">
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No tournaments match your filters.</p>
              )}
              {filtered.map((t) => {
                const style = statusStyles[t.status];
                return (
                  <article key={t.id} className="rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-glow">
                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex rounded-lg bg-primary/10 p-3 shrink-0">
                        <Swords className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-display text-base font-semibold text-foreground">{t.name}</h2>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg}`}>{style.label}</span>
                          <Badge className="bg-muted text-muted-foreground border-border text-[10px]">Free</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.topic}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.timeControl}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{t.currentPlayers}/{t.maxPlayers}</span>
                          <span>{t.startDate}</span>
                          <span className="text-primary font-medium">🏆 {t.prize}</span>
                        </div>
                      </div>
                      <Button size="sm" variant={t.status === "live" ? "default" : "outline"} className="shrink-0"
                        disabled={t.status === "upcoming" || t.status === "completed"}
                      >
                        {t.status === "live" ? "Join Now" : t.status === "registering" ? "Register" : t.status === "upcoming" ? "Coming Soon" : "View"}
                      </Button>
                    </div>
                    {t.currentPlayers > 0 && (
                      <div className="mt-3">
                        <div className="w-full h-1 bg-muted rounded-full">
                          <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${(t.currentPlayers / t.maxPlayers) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Tournaments;
