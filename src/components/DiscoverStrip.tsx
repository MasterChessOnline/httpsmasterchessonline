import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Gift, Trophy, Sparkles, Eye, Crown } from "lucide-react";

const CARDS = [
  {
    to: "/referrals",
    icon: Gift,
    title: "Invite friends",
    desc: "100 coins each",
    color: "from-emerald-500/20 to-emerald-700/10",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
  },
  {
    to: "/leaderboard",
    icon: Trophy,
    title: "Leaderboard",
    desc: "Top players live",
    color: "from-yellow-500/20 to-yellow-700/10",
    border: "border-yellow-500/30",
    accent: "text-yellow-400",
  },
  {
    to: "/quiz",
    icon: Sparkles,
    title: "Chess personality",
    desc: "60-sec quiz",
    color: "from-fuchsia-500/20 to-fuchsia-700/10",
    border: "border-fuchsia-500/30",
    accent: "text-fuchsia-400",
  },
  {
    to: "/spectate",
    icon: Eye,
    title: "Watch live",
    desc: "Spectate games now",
    color: "from-sky-500/20 to-sky-700/10",
    border: "border-sky-500/30",
    accent: "text-sky-400",
  },
  {
    to: "/daily-king",
    icon: Crown,
    title: "Daily King",
    desc: "Today's champion",
    color: "from-rose-500/20 to-rose-700/10",
    border: "border-rose-500/30",
    accent: "text-rose-400",
  },
];

export default function DiscoverStrip() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Discover MasterChess
        </h2>
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          5 ways to grow
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                to={c.to}
                className={`group block rounded-2xl border ${c.border} bg-gradient-to-br ${c.color} p-4 backdrop-blur-sm transition hover:scale-[1.02] hover:shadow-lg`}
              >
                <Icon
                  className={`mb-2 h-6 w-6 ${c.accent} transition group-hover:scale-110`}
                />
                <div className="text-sm font-semibold text-white">
                  {c.title}
                </div>
                <div className="text-xs text-zinc-400">{c.desc}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
