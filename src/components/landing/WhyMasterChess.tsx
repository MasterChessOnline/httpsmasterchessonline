import { motion } from "framer-motion";
import { ShieldCheck, Users, Radio, Crown, Zap, Trophy, Sparkles, Heart, Globe2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Crown,
    title: "A Premium Club, Not a Crowd",
    body: "Gold & black cinematic design. Every game, profile and invite feels like it belongs in a real chess club — not a noisy game portal.",
  },
  {
    icon: Users,
    title: "Real Humans, Real Games",
    body: "Authentic player-vs-player chess with ELO, ranks and profiles. No engine help in human games — just honest skill.",
  },
  {
    icon: ShieldCheck,
    title: "No Clutter, No Ads",
    body: "Board-first interface. No popups, no upsells, no dark patterns. You open the site and you play.",
  },
  {
    icon: Radio,
    title: "Made for Streamers",
    body: "Distraction-free Streamer Mode, overlay embeds and a live hub with DailyChess_12 built into the site.",
  },
  {
    icon: Zap,
    title: "Fast to Start",
    body: "Pick a time control, hit Play. No tutorials, no walls. New players are in a real game in under 10 seconds.",
  },
  {
    icon: Trophy,
    title: "Reasons to Come Back",
    body: "Daily challenges, missions, win streaks, ranks Bronze→Grandmaster, tournaments and a skill tree that levels you up.",
  },
  {
    icon: Sparkles,
    title: "Train Without Tedium",
    body: "Opening Trainer, bot personalities, Guess the Move and Play Like a GM modes — practice that feels like play.",
  },
  {
    icon: Heart,
    title: "A Community That Notices You",
    body: "Followers, Chess Moments, badges, quick chat. People actually see your wins and your style.",
  },
  {
    icon: Globe2,
    title: "Yours, Forever",
    body: "Your account, your rating, your games — clean export, full history, multi-language. You own your chess life here.",
  },
];

const bigStats = [
  { value: "10s", label: "to your first game" },
  { value: "0", label: "ads, popups, upsells" },
  { value: "100%", label: "human-vs-human play" },
  { value: "24/7", label: "tournaments & lobbies" },
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
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-3">
          <Crown className="h-3 w-3" /> Why MasterChess
        </span>
        <h2 className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight">
          Built for players who want{" "}
          <span className="text-gradient-gold">chess to feel serious again</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
          MasterChess is a premium home for real human play. Clean board, honest competition,
          streamer-grade tools, and a brand that makes every invite worth accepting.
        </p>
      </motion.div>

      {/* Big stats acquisition strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
        {bigStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-3 sm:p-4 text-center glass-4d"
          >
            <div className="font-display text-xl sm:text-3xl font-black text-gradient-gold leading-none">
              {s.value}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1.5">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
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

      {/* Acquisition CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-10 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent p-5 sm:p-7 text-center"
      >
        <h3 className="font-display text-lg sm:text-2xl font-bold text-foreground mb-2">
          Stop playing on noisy sites. Start playing where chess feels like chess.
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mb-4">
          Create your free account, get your rank, join a tournament tonight.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="ripple-btn h-12 px-7 font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg">
              Join MasterChess
            </Button>
          </Link>
          <Link to="/play/online">
            <Button size="lg" variant="outline" className="h-12 px-7 rounded-xl border-border/40 hover:border-primary/40">
              Play a game now
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
