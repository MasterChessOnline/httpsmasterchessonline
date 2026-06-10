import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Season {
  id: string;
  season_number: number;
  name: string;
  starts_at: string;
  ends_at: string;
  status: string;
}

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return useMemo(() => {
    if (!target) return null;
    const diff = Math.max(0, new Date(target).getTime() - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, done: diff === 0 };
  }, [target, now]);
}

/**
 * Homepage Season Banner — large cinematic gold/black card showing the active
 * season name, theme tagline, and a live countdown to the season end. Links to
 * the Season Hub (/season).
 */
export default function SeasonBanner() {
  const [season, setSeason] = useState<Season | null>(null);
  const countdown = useCountdown(season?.ends_at);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("seasons" as any)
        .select("id,season_number,name,starts_at,ends_at,status")
        .eq("status", "active")
        .order("season_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (alive && data) setSeason(data as any);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!season) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-amber-300/30 bg-gradient-to-br from-amber-950/60 via-black to-black p-5 sm:p-7 shadow-[0_20px_60px_-20px_rgba(251,191,36,0.45)]"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(70% 60% at 20% 20%, rgba(251,191,36,0.25), transparent 60%), radial-gradient(50% 40% at 80% 80%, rgba(251,191,36,0.12), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(135deg, rgba(251,191,36,0.06) 0px, rgba(251,191,36,0.06) 1px, transparent 1px, transparent 12px)",
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-amber-300 text-xs uppercase tracking-[0.3em] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Season {season.season_number}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {season.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Climb 100 tiers · Earn exclusive rewards · Limited time.
          </p>

          {countdown && (
            <div className="mt-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-300" />
              <div className="flex gap-1.5 text-amber-100">
                <TimePill v={countdown.d} l="d" />
                <TimePill v={countdown.h} l="h" />
                <TimePill v={countdown.m} l="m" />
                <TimePill v={countdown.s} l="s" />
              </div>
            </div>
          )}
        </div>

        <Link
          to="/season"
          className="group relative shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black px-5 py-3 font-semibold shadow-lg shadow-amber-500/30 hover:scale-[1.03] active:scale-95 transition-transform"
        >
          <Trophy className="w-5 h-5" />
          Open Season Hub
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.section>
  );
}

function TimePill({ v, l }: { v: number; l: string }) {
  return (
    <div className="rounded-md bg-black/50 border border-amber-300/30 px-2 py-1 min-w-[44px] text-center">
      <span className="font-display text-base font-bold tabular-nums">
        {String(v).padStart(2, "0")}
      </span>
      <span className="text-[10px] text-amber-300/80 ml-0.5">{l}</span>
    </div>
  );
}
