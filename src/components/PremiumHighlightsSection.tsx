import { Crown, BookOpen, Trophy, Flame, Gift, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: BookOpen, text: "Full lesson library with exclusive content" },
  { icon: Trophy, text: "Premium-only tournaments with prizes" },
  { icon: Gift, text: "Discounts on private lessons with DailyChess_12" },
  { icon: Flame, text: "Daily streak tracking, badges & rewards" },
  { icon: Sparkles, text: "Story Mode challenges & seasonal events" },
  { icon: Crown, text: "Priority access to live classes" },
];

const PremiumHighlightsSection = () => {
  return (
    <section className="relative border-t border-border/50 py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-primary/20 bg-card/60 backdrop-blur-sm p-10 sm:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-widest text-primary uppercase">Premium Membership</span>
                  <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                    Unlock Your <span className="text-gradient-gold">Full Potential</span>
                  </h2>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
                Go beyond the basics. Premium members get exclusive access to DailyChess_12's complete lesson library, elite tournaments, personalized training, and much more.
              </p>

              <div className="grid gap-3 sm:grid-cols-2 mb-10">
                {benefits.map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground/90">{text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/premium">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base font-semibold shadow-glow-lg animate-glow-pulse">
                    <Sparkles className="mr-2 h-4 w-4" /> Join Premium
                  </Button>
                </Link>
                <Link to="/premium">
                  <Button size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 px-8 text-base">
                    View All Plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumHighlightsSection;
