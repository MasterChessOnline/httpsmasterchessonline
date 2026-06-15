import { Link } from "react-router-dom";
import { Gift, Trophy, Sparkles, Eye, Crown } from "lucide-react";

const CARDS = [
  {
    to: "/referrals",
    icon: Gift,
    title: "Invite friends",
    desc: "100 coins each",
    color: "from-emerald-500/15 to-emerald-900/10",
    border: "border-emerald-500/25",
    accent: "text-emerald-400",
  },
  {
    to: "/leaderboard",
    icon: Trophy,
    title: "Leaderboard",
    desc: "Top players live",
    color: "from-amber-500/15 to-amber-900/10",
    border: "border-amber-500/30",
    accent: "text-amber-400",
  },
  {
    to: "/quiz",
    icon: Sparkles,
    title: "Chess personality",
    desc: "60-sec quiz",
    color: "from-amber-500/10 to-zinc-900/30",
    border: "border-amber-400/25",
    accent: "text-amber-300",
  },
  {
    to: "/spectate",
    icon: Eye,
    title: "Watch live",
    desc: "Spectate games now",
    color: "from-sky-500/15 to-sky-900/10",
    border: "border-sky-500/25",
    accent: "text-sky-400",
  },
  {
    to: "/daily-king",
    icon: Crown,
    title: "Daily King",
    desc: "Today's champion",
    color: "from-amber-500/15 to-amber-900/10",
    border: "border-amber-500/30",
    accent: "text-amber-400",
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
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className={`group block rounded-2xl border ${c.border} bg-gradient-to-br ${c.color} p-4 backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg animate-fade-in`}
            >
              <Icon
                className={`mb-2 h-6 w-6 ${c.accent} transition-transform group-hover:scale-110`}
              />
              <div className="text-sm font-semibold text-white">{c.title}</div>
              <div className="text-xs text-zinc-400">{c.desc}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
