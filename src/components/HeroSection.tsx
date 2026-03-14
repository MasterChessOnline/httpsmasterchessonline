import { ArrowRight, Youtube, Crown, BookOpen, Users } from "lucide-react";
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
          className="h-full w-full object-cover scale-105"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
      </div>

      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 backdrop-blur-md opacity-0 animate-fade-up">
          <Youtube className="h-4 w-4 text-red-500" />
          <span className="text-xs font-semibold tracking-wide text-red-400 uppercase">DailyChess_12 · YouTube Instructor</span>
        </div>

        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl opacity-0 animate-fade-up stagger-1">
          Learn Chess with
          <br />
          <span className="text-gradient-gold">DailyChess_12</span>
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground/90 leading-relaxed opacity-0 animate-fade-up stagger-2">
          Online chess lessons, live classes, and training. Improve your game with structured courses from beginner to advanced.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center opacity-0 animate-fade-up stagger-3">
          <Link to={user ? "/play" : "/signup"}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base font-semibold shadow-glow-lg group animate-glow-pulse">
              {user ? "Start Playing" : "Sign Up"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md">
              <BookOpen className="mr-2 h-4 w-4" /> Book a Lesson
            </Button>
          </Link>
          <Link to="/premium">
            <Button size="lg" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10 px-8 text-base backdrop-blur-md group">
              <Crown className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" /> Join Membership
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 sm:gap-16 opacity-0 animate-fade-up stagger-4">
          {[
            { icon: Youtube, label: "YouTube Channel", value: "DailyChess_12" },
            { icon: Users, label: "Students", value: "Growing" },
            { icon: Crown, label: "Membership", value: "Premium" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center group">
              <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="font-display text-xl font-bold text-foreground sm:text-2xl">{value}</div>
              <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-0 animate-fade-in stagger-5">
        <div className="w-5 h-8 rounded-full border-2 border-foreground/20 flex items-start justify-center p-1">
          <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
