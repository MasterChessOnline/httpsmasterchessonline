// Small credibility strip rendered under the homepage hero.
// Surfaces the things visitors care about in the first 3 seconds:
// listed on Chess-Results, Belgrade-based, founder, no ads, no signup.
import { Link } from "react-router-dom";
import { ShieldCheck, MapPin, Crown, Sparkles, Trophy } from "lucide-react";

const items = [
  {
    icon: Trophy,
    label: "Chess-Results Serbia",
    sub: "Official tournament listings",
    href: "/dragan-brakus",
  },
  {
    icon: MapPin,
    label: "Belgrade, Serbia",
    sub: "Local club + global reach",
    href: "/chess/belgrade",
  },
  {
    icon: Crown,
    label: "Built by Nikola, 13",
    sub: "Player-first, ad-free, free forever",
    href: "/nikola",
  },
  {
    icon: ShieldCheck,
    label: "Fair-play monitored",
    sub: "Anti-cheat every rated game",
    href: "/fair-play",
  },
  {
    icon: Sparkles,
    label: "No ads · No signup",
    sub: "Play instantly as a guest",
    href: "/play-guest",
  },
];

export default function HomeTrustStrip() {
  return (
    <section
      aria-label="Why MasterChess"
      className="container mx-auto px-4 py-6"
    >
      <div className="rounded-2xl border border-yellow-500/15 bg-gradient-to-br from-yellow-500/5 via-white/[0.02] to-transparent p-3 sm:p-4">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {items.map((it) => (
            <li key={it.label}>
              <Link
                to={it.href}
                className="group flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-yellow-500/30 transition-all p-2.5 sm:p-3 h-full"
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors"
                >
                  <it.icon className="h-4 w-4 text-yellow-400" />
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] sm:text-[13px] font-semibold leading-tight truncate">
                    {it.label}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug mt-0.5">
                    {it.sub}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
