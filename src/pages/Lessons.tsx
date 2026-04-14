import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Swords, Target, Clock, User, Check, Star } from "lucide-react";
import { MARKETPLACE_LESSONS, type MarketplaceLesson } from "@/lib/lessons-marketplace-data";

const LEVEL_STYLES: Record<string, string> = {
  beginner: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  intermediate: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  advanced: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const ICON_MAP: Record<string, typeof BookOpen> = {
  "book-open": BookOpen,
  swords: Swords,
  target: Target,
};

const LessonCard = ({ lesson }: { lesson: MarketplaceLesson }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const Icon = ICON_MAP[lesson.icon] || BookOpen;

  const handleClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Coming soon - booking system
    alert("Booking system coming soon! Please contact us directly.");
  };

  return (
    <Card className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden flex flex-col">
      {/* Header accent */}
      <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <Badge variant="outline" className={LEVEL_STYLES[lesson.level]}>
            {lesson.level}
          </Badge>
        </div>

        {/* Title & description */}
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          {lesson.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{lesson.longDescription}</p>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {lesson.topics.map((t) => (
            <span key={t} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {t}
            </span>
          ))}
        </div>

        {/* Coach */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{lesson.coach}</p>
            <p className="text-xs text-muted-foreground">{lesson.coachTitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 text-primary fill-primary" />
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: price + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">${lesson.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              {lesson.duration}
            </div>
          </div>
          <Button onClick={handleClick} className="px-5">
            <Check className="w-4 h-4 mr-2" />
            Book Lesson
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const Lessons = () => {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 text-sm">
            <BookOpen className="w-3.5 h-3.5 mr-1" /> 1-on-1 Coaching
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Private Lessons
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Book a personal session with our coaches and accelerate your chess improvement.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { step: "1", title: "Choose a lesson", desc: "Pick the topic that fits your goals" },
            { step: "2", title: "Contact us", desc: "Reach out to schedule your session" },
            { step: "3", title: "Start learning", desc: "Get personalized coaching and improve" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/30">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                {s.step}
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lesson cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MARKETPLACE_LESSONS.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Lessons;
