import { motion } from "framer-motion";
import { ShieldCheck, Users, Radio, Crown, Zap, Trophy } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "No Noise",
    body: "A clean board-first experience where players can focus, improve, and enjoy real games without clutter.",
  },
  {
    icon: Users,
    title: "Real Players",
    body: "Built around authentic human games, fair competition, profiles, ratings, and a community that feels personal.",
  },
  {
    icon: Radio,
    title: "Streamer-First",
    body: "Distraction-free Streamer Mode, overlay-ready embeds, and live integration with DailyChess_12.",
  },
  {
    icon: Crown,
    title: "Premium Identity",
    body: "Gold & black design, cinematic boards, and a luxury chess feel that makes every invite look serious.",
  },
  {
    icon: Zap,
    title: "Fast to Start",
    body: "One clear path: enter, play, train, compete. New players understand the site in seconds.",
  },
  {
    icon: Trophy,
    title: "Built to Grow",
    body: "Tournaments, streaks, ranks, missions, and share tools give people a reason to come back and bring friends.",
  },
];

export default function WhyMasterChess() {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Why Players Choose <span className="text-primary">MasterChess</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
          Invite people into a premium chess club, not another crowded game page: clean play, human competition, streamer tools, ranks, and a brand that feels worth joining.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className="relative rounded-2xl border border-primary/15 glass-4d p-4 sm:p-5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold text-foreground mb-1">{p.title}</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{p.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
