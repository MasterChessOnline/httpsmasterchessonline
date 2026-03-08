import { ArrowRight, Users, Trophy, Zap, Swords, Crown, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-chess.jpg";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Chess board with golden pieces"
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">Free to play · No ads</span>
        </div>

        <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-8xl">
          Your Next
          <br />
          <span className="text-gradient-gold">Grandmaster</span>
          <br />
          Move Awaits
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground/90 leading-relaxed">
          Play real opponents, join tournaments, track your rating, and improve — all on one beautiful platform.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link to={user ? "/play/online" : "/signup"}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base font-semibold shadow-glow group">
              {user ? "Play Online" : "Start Playing Free"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/play">
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-sm">
              <Swords className="mr-2 h-4 w-4" /> Play vs Computer
            </Button>
          </Link>
          <Link to="/donate">
            <Button size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 px-8 text-base backdrop-blur-sm group">
              <Heart className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" /> Support the Site
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 sm:gap-16">
          {[
            { icon: Users, label: "Active Players", value: "2.4M+" },
            { icon: Trophy, label: "Tournaments", value: "Live" },
            { icon: Crown, label: "ELO Tracking", value: "Live" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
              <div className="font-display text-xl font-bold text-foreground sm:text-2xl">{value}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-5 h-8 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
