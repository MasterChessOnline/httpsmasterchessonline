import { motion } from "framer-motion";
import { TrendingUp, Target, Shield, Globe2, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const blocks = [
  {
    icon: Target,
    tag: "The Gap",
    title: "Legacy chess sites are stuck",
    body: "Incumbents are either cluttered with ads and paywalls, or purely utilitarian with no brand and no creator layer. There is no premium, creator-native chess home.",
  },
  {
    icon: Rocket,
    tag: "The Wedge",
    title: "Streamer-first chess platform",
    body: "DailyChess_12 baked in, Streamer Mode, overlay embeds, live Stream Hub. We own the chess + creators lane no one is building for.",
  },
  {
    icon: Shield,
    tag: "The Moat",
    title: "Premium brand + authentic play",
    body: "Gold & black identity, ranks, titles, badges, referrals with conversion tracking, gamified skill tree, and 100% human-vs-human play. No bot farms, no engine help.",
  },
  {
    icon: Globe2,
    tag: "The Market",
    title: "600M+ players, still compounding",
    body: "Post-Queen's-Gambit chess boom is structural, not a spike. Twitch chess stays top-20 by hours watched. We monetize the audience the incumbents under-serve.",
  },
];

export default function WhyInvest() {
  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-3">
          <TrendingUp className="h-3 w-3" /> Why Invest
        </span>
        <h2 className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight">
          A premium chess brand for{" "}
          <span className="text-gradient-gold">the streaming era</span>
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
          Chess has 600M+ players and a creator economy nobody is building for.
          MasterChess is the premium, creator-native home the incumbents won't ship.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {blocks.map((b, i) => (
          <motion.div
            key={b.tag}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6 }}
            className="relative rounded-2xl border border-primary/15 glass-4d p-5 sm:p-6 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">{b.tag}</span>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-1.5">{b.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{b.body}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <Link to="/pitch">
          <Button size="lg" className="ripple-btn h-12 px-6 font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg">
            See the Pitch <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link to="/play/online">
          <Button size="lg" variant="outline" className="h-12 px-6 rounded-xl border-border/40 hover:border-primary/40">
            Try the product
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
