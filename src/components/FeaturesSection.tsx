import { Swords, Brain, GraduationCap, BarChart3, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Swords,
    title: "Play Online",
    description: "Instant matchmaking with ELO-based opponents. Real-time games from bullet to classical.",
    href: "/play/online",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: Brain,
    title: "Daily Puzzles",
    description: "A fresh tactical puzzle every day with timed solving and a puzzle leaderboard.",
    href: "/puzzles",
    accent: "from-accent/20 to-accent/5",
  },
  {
    icon: GraduationCap,
    title: "Learn & Improve",
    description: "Structured courses from beginner to advanced covering openings, tactics, and endgames.",
    href: "/learn",
    accent: "from-secondary/20 to-secondary/5",
  },
  {
    icon: BarChart3,
    title: "ELO Ratings",
    description: "Track your progress with a real ELO rating system. See how you stack up on the leaderboard.",
    href: "/leaderboard",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: Users,
    title: "Friends & Chat",
    description: "Add friends, track their games, and chat during matches. Build your chess community.",
    href: "/friends",
    accent: "from-accent/20 to-accent/5",
  },
  {
    icon: Trophy,
    title: "Tournaments",
    description: "Compete in live tournaments — blitz, rapid, and themed events with prizes.",
    href: "/tournaments",
    accent: "from-secondary/20 to-secondary/5",
  },
];

const FeaturesSection = () => {
  return (
    <section className="border-t border-border/50 bg-card/50 py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need to <span className="text-gradient-gold">Master Chess</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete platform for players at every level — play, learn, compete, and grow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {features.map(({ icon: Icon, title, description, href, accent }) => (
            <Link
              key={title}
              to={href}
              className="group relative rounded-xl border border-border/50 bg-gradient-to-br p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-glow hover:-translate-y-0.5"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
