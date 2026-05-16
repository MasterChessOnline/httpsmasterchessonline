import { motion } from "framer-motion";
import {
  Ban, Users, Award, Radio, Trophy, Sparkles,
  Smartphone, Share2, GitBranch, Calendar, Heart, Download,
} from "lucide-react";

const reasons = [
  { icon: Ban, text: "Zero ads. Forever." },
  { icon: Users, text: "Real humans only." },
  { icon: Award, text: "Your rank, earned." },
  { icon: Radio, text: "Streamer-grade overlays." },
  { icon: Trophy, text: "Tournaments every night." },
  { icon: Sparkles, text: "Built in 2026, not 2007." },
  { icon: Smartphone, text: "Mobile-first board." },
  { icon: Share2, text: "Invite friends, track conversions." },
  { icon: GitBranch, text: "Skill tree that levels you up." },
  { icon: Calendar, text: "Daily missions, daily wins." },
  { icon: Heart, text: "A community that sees you." },
  { icon: Download, text: "Yours to export, always." },
];

export default function WallOfReasons() {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight">
          12 reasons people <span className="text-gradient-gold">switch</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
          One-line truths. No marketing fluff.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {reasons.map((r, i) => (
          <motion.div
            key={r.text}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="rounded-xl border border-primary/15 glass-4d p-3 sm:p-4 flex items-start gap-2.5 group hover:border-primary/35 transition-colors"
          >
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <r.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
              {r.text}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
