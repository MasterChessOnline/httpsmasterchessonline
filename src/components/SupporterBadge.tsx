// Supporter badge — shown next to a player's name when they've donated.
// Tier is derived live from `purchases` via the `supporter_tier` RPC, so
// every real donation immediately unlocks the badge described on /supporter.
import { useEffect, useState } from "react";
import { Coffee, Sparkles, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Tier = "coffee" | "gold" | "legend";

interface Props {
  userId: string;
  size?: "sm" | "md";
  asLink?: boolean;
}

const STYLE: Record<Tier, { label: string; icon: any; cls: string; perk: string }> = {
  coffee: {
    label: "Supporter",
    icon: Coffee,
    cls: "border-amber-700/40 bg-amber-700/10 text-amber-300",
    perk: "Tipped a coffee to keep the servers alive",
  },
  gold: {
    label: "Gold Supporter",
    icon: Sparkles,
    cls: "border-amber-400/60 bg-gradient-to-r from-amber-500/15 to-yellow-400/15 text-amber-200 shadow-[0_0_12px_-2px_hsl(45_90%_55%/0.45)]",
    perk: "Gold supporter — name on the /supporter wall",
  },
  legend: {
    label: "Legend",
    icon: Crown,
    cls: "border-amber-300/80 bg-gradient-to-r from-amber-400/25 via-yellow-300/20 to-amber-500/25 text-amber-100 shadow-[0_0_18px_-2px_hsl(45_95%_60%/0.6)]",
    perk: "Legendary supporter — direct line to Nikola",
  },
};

const CACHE = new Map<string, { tier: Tier | null; total: number; at: number }>();
const TTL = 5 * 60_000;

export default function SupporterBadge({ userId, size = "sm", asLink = true }: Props) {
  const [tier, setTier] = useState<Tier | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const cached = CACHE.get(userId);
    if (cached && Date.now() - cached.at < TTL) {
      setTier(cached.tier);
      setTotal(cached.total);
      return;
    }
    (async () => {
      const { data, error } = await (supabase.rpc as any)("supporter_tier", { p_user_id: userId });
      if (cancelled || error || !data) return;
      const t = (data.tier as Tier | null) ?? null;
      const totalCents = Number(data.total_cents ?? 0);
      CACHE.set(userId, { tier: t, total: totalCents, at: Date.now() });
      setTier(t);
      setTotal(totalCents);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!tier) return null;

  const cfg = STYLE[tier];
  const Icon = cfg.icon;
  const dollars = Math.floor(total / 100);
  const title = `${cfg.perk}${dollars ? ` · $${dollars.toLocaleString("en-US")} donated` : ""}`;

  const padX = size === "md" ? "px-2.5 py-1" : "px-2 py-0.5";
  const text = size === "md" ? "text-xs" : "text-[10px]";
  const iconSize = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  const inner = (
    <span
      title={title}
      aria-label={title}
      className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider ${padX} ${text} ${cfg.cls}`}
    >
      <Icon className={iconSize} />
      {cfg.label}
    </span>
  );

  return asLink ? <Link to="/supporter">{inner}</Link> : inner;
}
