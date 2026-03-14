import { Swords, GraduationCap, Trophy, Gamepad2, Brain, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Swords,
    title: "Free Online Games",
    description: "Play instantly against other users or AI. ELO-based matchmaking from bullet to classical.",
    href: "/play/online",
    accent: "group-hover:border-primary/40",
    iconBg: "bg-primary/10 group-hover:bg-primary/20",
  },
  {
    icon: Trophy,
    title: "Free Tournaments",
    description: "Compete in daily and weekly tournaments with live leaderboards. No entry fee required.",
    href: "/tournaments",
    accent: "group-hover:border-accent/40",
    iconBg: "bg-accent/10 group-hover:bg-accent/20",
  },
  {
    icon: Gamepad2,
    title: "Premium Tournaments",
    description: "Unlock exclusive tournaments with bigger prizes and elite competition for Premium members.",
    href: "/premium",
    badge: "Premium",
    accent: "group-hover:border-primary/40",
    iconBg: "bg-primary/10 group-hover:bg-primary/20",
  },
  {
    icon: Brain,
    title: "Personalized Daily Training",
    description: "AI-driven exercises based on your activity. Track your streak and earn rewards every day.",
    href: "/learn",
    accent: "group-hover:border-secondary/40",
    iconBg: "bg-secondary/10 group-hover:bg-secondary/20",
  },
  {
    icon: BookOpen,
    title: "Story Mode Challenges",
    description: "Complete lessons and tournaments as part of a progressive story. Unlock rewards as you advance.",
    href: "/learn",
    badge: "Coming Soon",
    accent: "group-hover:border-accent/40",
    iconBg: "bg-accent/10 group-hover:bg-accent/20",
  },
  {
    icon: GraduationCap,
    title: "Learn & Improve",
    description: "Structured courses from DailyChess_12 covering openings, tactics, and endgames for every level.",
    href: "/learn",
    accent: "group-hover:border-secondary/40",
    iconBg: "bg-secondary/10 group-hover:bg-secondary/20",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative border-t border-border/50 py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-background to-background" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent/3 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">Features</span>
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Everything to <span className="text-gradient-gold">Master Chess</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Play for free, compete in tournaments, and unlock premium content.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map(({ icon: Icon, title, description, href, accent, iconBg, badge }, i) => (
            <Link
              key={title}
              to={href}
              className={`group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-500 hover:shadow-card hover:-translate-y-1 ${accent}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className={`inline-flex rounded-xl p-3 transition-colors duration-300 ${iconBg}`}>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/20">
                      {badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {!badge && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-xs">→</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
