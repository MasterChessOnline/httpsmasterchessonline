import { ArrowRight, Users, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-chess.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Chess board with golden pieces"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">50,000+ games played daily</span>
        </div>

        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-8xl">
          Your Next
          <br />
          <span className="text-gradient-gold">Grandmaster</span>
          <br />
          Move Awaits
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Challenge players worldwide, solve tactical puzzles, and master the art of chess on the most elegant platform online.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base font-semibold shadow-glow">
            Start Playing Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted px-8 text-base">
            Watch a Game
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 sm:gap-16">
          {[
            { icon: Users, label: "Active Players", value: "2.4M+" },
            { icon: Trophy, label: "Tournaments", value: "500+" },
            { icon: Zap, label: "Games Today", value: "52K" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
