import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GraduationCap, BookOpen, Video, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const courses = [
  { icon: BookOpen, title: "Opening Fundamentals", desc: "Master the key opening principles and popular systems.", level: "Beginner", lessons: 12 },
  { icon: Target, title: "Tactical Patterns", desc: "Learn forks, pins, skewers, discovered attacks, and more.", level: "Intermediate", lessons: 20 },
  { icon: Video, title: "Endgame Mastery", desc: "King and pawn endings, rook endings, and theoretical draws.", level: "Advanced", lessons: 15 },
  { icon: GraduationCap, title: "Positional Play", desc: "Understand pawn structures, outposts, and piece activity.", level: "Intermediate", lessons: 18 },
];

const Learn = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="container mx-auto px-6 pt-24 pb-16">
      <h1 className="font-display text-4xl font-bold text-foreground text-center mb-2">
        Learn <span className="text-gradient-gold">Chess</span>
      </h1>
      <p className="text-center text-muted-foreground mb-12">
        Structured courses from beginner to advanced, crafted by grandmasters.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
        {courses.map(({ icon: Icon, title, desc, level, lessons }) => (
          <article
            key={title}
            className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/30 hover:shadow-glow focus-within:ring-2 focus-within:ring-ring"
            role="listitem"
          >
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary font-medium">{level}</span>
              <span>{lessons} lessons</span>
            </div>
            <Button className="mt-4 w-full" size="sm" aria-label={`Start ${title} course`}>
              Start Course
            </Button>
          </article>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Learn;
