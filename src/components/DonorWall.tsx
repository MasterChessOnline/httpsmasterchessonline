// Live donor wall — last 20 supporters. Polls every 30s, sparkles on new donor.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Donor {
  display_name: string;
  amount_cents: number;
  currency: string;
  created_at: string;
}

function fmt(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function DonorWall() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestKey, setLatestKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await (supabase.rpc as any)("recent_donors", { p_limit: 20 });
      if (cancelled) return;
      const list: Donor[] = Array.isArray(data) ? data : [];
      setDonors(list);
      setLoading(false);
      if (list.length > 0) setLatestKey(list[0].created_at);
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
        Loading supporters…
      </div>
    );
  }

  if (donors.length === 0) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <Heart className="h-6 w-6 mx-auto text-primary mb-2" />
        <p className="text-sm text-muted-foreground">
          Be the <span className="text-primary font-semibold">first name</span> on this wall.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
          Recent supporters
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground">live</span>
      </div>
      <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {donors.map((d) => {
            const isLatest = d.created_at === latestKey;
            return (
              <motion.li
                key={`${d.created_at}-${d.display_name}-${d.amount_cents}`}
                initial={isLatest ? { opacity: 0, x: -10, backgroundColor: "hsla(45,90%,55%,0.25)" } : false}
                animate={{ opacity: 1, x: 0, backgroundColor: "hsla(45,90%,55%,0)" }}
                transition={{ duration: 1.2 }}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm border border-transparent hover:border-primary/20 hover:bg-primary/5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Heart className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium">{d.display_name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-primary">
                    {fmt(d.amount_cents, d.currency)}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-14 text-right">
                    {timeAgo(d.created_at)}
                  </span>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
