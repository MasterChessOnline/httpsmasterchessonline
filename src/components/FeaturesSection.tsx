import { Swords, Brain, GraduationCap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Swords,
    title: "Play Online",
    description: "Match with opponents of your skill level in real-time games from bullet to classical.",
  },
  {
    icon: Brain,
    title: "Tactical Puzzles",
    description: "Sharpen your mind with thousands of curated puzzles that adapt to your level.",
  },
  {
    icon: GraduationCap,
    title: "Lessons & Courses",
    description: "Learn from grandmaster-level content covering openings, middlegame, and endgame.",
  },
  {
    icon: BarChart3,
    title: "Game Analysis",
    description: "Review your games with powerful engine analysis and identify areas to improve.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="border-t border-border/50 bg-card py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need to <span className="text-gradient-gold">Master Chess</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete platform designed for players at every level.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-border/50 bg-muted/30 p-6 transition-all hover:border-primary/30 hover:shadow-glow"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
