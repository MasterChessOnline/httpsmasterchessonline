import { Star } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

const testimonials = [
  {
    name: "Alex M.",
    rating: 5,
    text: "DailyChess_12's lessons took me from 800 to 1400 ELO in just 3 months. The structured approach is exactly what I needed.",
    level: "Intermediate",
  },
  {
    name: "Sarah K.",
    rating: 5,
    text: "The live classes are incredible. Being able to ask questions in real-time and get feedback from DailyChess_12 made all the difference.",
    level: "Beginner",
  },
  {
    name: "James W.",
    rating: 5,
    text: "Premium membership is worth every penny. The exclusive tournaments and daily training keep me coming back every day.",
    level: "Advanced",
  },
  {
    name: "Maria L.",
    rating: 4,
    text: "I love the daily training system. My streak is at 45 days and I've never been more consistent with chess practice.",
    level: "Intermediate",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative border-t border-border/50 py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />

      <div className="container mx-auto px-6 relative">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="inline-block text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              Testimonials
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              What Our <span className="text-gradient-gold">Students Say</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Join thousands of players improving with MasterChessOnline.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-glow hover:border-primary/20 h-full"
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={`h-4 w-4 ${j < t.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.level} Player</div>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
