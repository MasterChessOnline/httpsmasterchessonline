import { Star, Quote, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Alex M.",
    rating: 5,
    text: "The lessons took me from 800 to 1400 ELO in just 3 months. The structured approach is exactly what I needed. Best chess platform I've ever used.",
    level: "Intermediate",
    elo: "+600 ELO",
    country: "🇺🇸",
  },
  {
    name: "Sarah K.",
    rating: 5,
    text: "Being able to analyze my games with Stockfish for free changed everything. On other platforms I'd need premium for that.",
    level: "Beginner",
    elo: "+400 ELO",
    country: "🇬🇧",
  },
  {
    name: "James W.",
    rating: 5,
    text: "The tournaments and daily training keep me coming back every day. My 60-day streak is proof this platform works.",
    level: "Advanced",
    elo: "+200 ELO",
    country: "🇨🇦",
  },
  {
    name: "Maria L.",
    rating: 5,
    text: "I love the Story Mode! It makes learning chess feel like an adventure. My kids are hooked too.",
    level: "Intermediate",
    elo: "+350 ELO",
    country: "🇪🇸",
  },
  {
    name: "Viktor S.",
    rating: 5,
    text: "Finally a chess platform that looks and feels modern. The dark theme with gold accents is gorgeous. Clean, no ads, just chess.",
    level: "Advanced",
    elo: "+150 ELO",
    country: "🇷🇸",
  },
  {
    name: "Chen W.",
    rating: 4,
    text: "The opening trainer helped me build a solid repertoire. I went from losing in the first 10 moves to winning them.",
    level: "Beginner",
    elo: "+500 ELO",
    country: "🇨🇳",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const TestimonialsSection = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

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
              Players <span className="text-gradient-gold">Love Us</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Join thousands of players improving their game every day
            </p>
            
            {/* Average rating */}
            <motion.div
              className="mt-6 inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                ))}
              </div>
              <span className="text-sm font-bold text-primary">4.9/5</span>
              <span className="text-xs text-muted-foreground">from 2,000+ players</span>
            </motion.div>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 h-full overflow-hidden relative group hover:border-primary/20 transition-all duration-500"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              whileHover={{ y: -4 }}
            >
              <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/5 group-hover:text-primary/10 transition-colors duration-500" />

              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-3.5 w-3.5 ${j < t.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>

              {/* ELO gain badge */}
              <motion.div
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 border border-emerald/20 px-3 py-1 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <TrendingUp className="h-3 w-3 text-emerald" />
                <span className="text-xs font-bold text-emerald">{t.elo}</span>
              </motion.div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                  {t.country}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-[11px] text-muted-foreground">{t.level} Player</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
