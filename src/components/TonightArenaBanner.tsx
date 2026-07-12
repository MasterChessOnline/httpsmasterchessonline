// TonightArenaBanner — signature weekly tournament (MasterChess Monday /
// Friday Night Fire / Sunday Classic). Reads the next is_signature=true
// tournament from the DB and links directly into its lobby so one click
// from the homepage joins the arena.
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Share2, Check, Swords, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type SignatureTournament = {
  id: string;
  name: string;
  description: string | null;
  time_control_label: string;
  starts_at: string;
  arena_duration_minutes: number | null;
  signature_series: string | null;
  category: string | null;
};

const SERIES_META: Record<string, { label: string; tagline: string; accent: string; icon: typeof Trophy }> = {
  "masterchess-monday": {
    label: "MasterChess Monday",
    tagline: "The signature weekly blitz — everyone plays at the same time.",
    accent: "amber",
    icon: Trophy,
  },
  "friday-night-fire": {
    label: "Friday Night Fire",
    tagline: "Bullet chaos. 60 minutes of 1+0 madness.",
    accent: "rose",
    icon: Flame,
  },
  "sunday-classic": {
    label: "Sunday Classic",
    tagline: "Rapid 10+0 arena. Deep games, big rating swings.",
    accent: "emerald",
    icon: Swords,
  },
};

function formatRemaining(ms: number): { d: string; h: string; m: string; s: string; live: boolean } {
  if (ms <= 0) return { d: "0", h: "00", m: "00", s: "00", live: true };
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return {
    d: d.toString(),
    h: h.toString().padStart(2, "0"),
    m: m.toString().padStart(2, "0"),
    s: s.toString().padStart(2, "0"),
    live: false,
  };
}

export default function TonightArenaBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<SignatureTournament | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("tournaments")
          .select("id, name, description, time_control_label, starts_at, arena_duration_minutes, signature_series, category")
          .eq("is_signature", true)
          .in("status", ["upcoming", "registering", "active"])
          .order("starts_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (!cancelled && data) setTournament(data as SignatureTournament);
      } catch (error) {
        console.info("[MasterChess Startup] Home background data skipped", { step: "SIGNATURE_TOURNAMENT", error });
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const series = tournament?.signature_series && SERIES_META[tournament.signature_series];
  const meta = series || SERIES_META["masterchess-monday"];
  const Icon = meta.icon;

  const startMs = tournament ? new Date(tournament.starts_at).getTime() : 0;
  const remaining = useMemo(() => formatRemaining(startMs - now), [startMs, now]);

  const arenaIsLive = useMemo(() => {
    if (!tournament) return false;
    const duration = (tournament.arena_duration_minutes ?? 90) * 60 * 1000;
    return now >= startMs && now < startMs + duration;
  }, [tournament, startMs, now]);

  const lobbyPath = tournament ? `/tournaments/${tournament.id}` : "/tournaments";

  const share = async () => {
    const url = `${window.location.origin}${lobbyPath}`;
    const text = `${meta.label} on MasterChess — free signature arena. Come play. ${url}`;
    try {
      if (navigator.share) await navigator.share({ title: meta.label, text, url });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Invite copied", description: "Paste it in Instagram, WhatsApp or your school group." });
      }
    } catch {}
  };

  const startsLabel = useMemo(() => {
    if (!tournament) return "";
    const d = new Date(tournament.starts_at);
    return d.toLocaleDateString(undefined, { weekday: "long" }) + " · " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }, [tournament]);

  return (
    <Link to={lobbyPath} aria-label={`Open ${meta.label} lobby`} className="block group">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        aria-label="Signature tournament"
        className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-background backdrop-blur-sm p-5 sm:p-6 group-hover:border-amber-400/60 group-hover:shadow-glow transition-all"
      >
        <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-500/15 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 shrink-0 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Icon className="h-6 w-6 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-400/90 flex items-center gap-1.5">
                {arenaIsLive ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Live now · join mid-arena
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" /> {startsLabel}
                  </>
                )}
              </div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground leading-tight truncate">
                {meta.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tournament?.time_control_label ? `${tournament.time_control_label} · ${tournament.arena_duration_minutes ?? 90}min arena · ` : ""}
                {meta.tagline}
              </p>
            </div>
          </div>

          {!arenaIsLive && tournament && (
            <div className="flex items-center gap-2 sm:ml-auto" role="timer" aria-live="polite">
              {[
                ...(Number(remaining.d) > 0 ? [{ v: remaining.d, l: "d" }] : []),
                { v: remaining.h, l: "h" },
                { v: remaining.m, l: "m" },
                { v: remaining.s, l: "s" },
              ].map(({ v, l }) => (
                <div key={l} className="min-w-[44px] text-center rounded-lg border border-amber-500/25 bg-background/60 px-2.5 py-1.5">
                  <div className="font-mono font-bold text-base sm:text-lg text-foreground tabular-nums">{v}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground -mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 sm:ml-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 group-hover:bg-amber-400 text-black font-display font-bold text-xs uppercase tracking-wider px-3.5 py-2 transition-colors shadow-glow-sm">
              {arenaIsLive ? <Swords className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}
              {arenaIsLive ? "Join now" : "Open lobby"}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); share(); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10 text-foreground font-display font-bold text-xs uppercase tracking-wider px-3 py-2 transition-colors"
              aria-label={`Share ${meta.label}`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Invite"}
            </button>
          </div>
        </div>
      </motion.section>
    </Link>
  );
}
