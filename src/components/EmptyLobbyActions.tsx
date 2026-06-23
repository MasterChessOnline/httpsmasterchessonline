// Replaces dead "no live games" states with 3 actionable CTAs.
// Goal: convert wait-time / empty-room frustration into useful next steps.
// No fake players, no ghost activity — just real actions the user can take.
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Share2, Target, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EmptyLobbyActions({
  title = "No live games right now",
  subtitle = "Be the first — start one, invite a friend, or train while you wait.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const createChallengeLink = async () => {
    if (!user) {
      const link = `${window.location.origin}/play`;
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Link copied", description: "Sign up to create personal challenge links." });
      } catch {}
      return;
    }
    setCreating(true);
    try {
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error } = await (supabase as any).from("challenge_links").insert({
        code,
        creator_id: user.id,
        time_control_label: "5+0",
        initial_time: 300,
        increment: 0,
        status: "pending",
        expires_at: expires,
      });
      if (error) throw error;
      const link = `${window.location.origin}/vs/${code}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Challenge link copied", description: "Share it — first friend to open it plays you." });
    } catch (e: any) {
      toast({ title: "Couldn't create link", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const actions = [
    {
      icon: Swords,
      label: "Start instant game",
      desc: "Open a Quick Match — first player to join plays you.",
      to: "/play/online",
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    },
    {
      icon: Share2,
      label: creating ? "Creating…" : copied ? "Link copied!" : "Challenge a friend",
      desc: "Get a personal link. They join with one click — no signup needed.",
      onClick: createChallengeLink,
      accent: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
      ActiveIcon: copied ? Check : Share2,
    },
    {
      icon: Target,
      label: "Train while you wait",
      desc: "Solve the daily puzzle or play a bot — keep your rating sharp.",
      to: "/puzzles",
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8 px-2"
    >
      <div className="text-center mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {actions.map((a, i) => {
          const Icon = (a as any).ActiveIcon ?? a.icon;
          const inner = (
            <motion.div
              whileHover={{ y: -2 }}
              className={`h-full rounded-xl border bg-gradient-to-b ${a.accent} backdrop-blur-sm p-4 text-left transition-all hover:shadow-glow-sm cursor-pointer`}
            >
              <Icon className="w-5 h-5 text-foreground mb-2" />
              <div className="font-display font-bold text-sm text-foreground mb-1">{a.label}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{a.desc}</div>
            </motion.div>
          );
          return a.to ? (
            <Link to={a.to} key={i} className="block">{inner}</Link>
          ) : (
            <button key={i} onClick={a.onClick} disabled={creating} className="block w-full text-left">
              {inner}
            </button>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-muted-foreground/70 mt-5">
        MasterChess shows only <span className="text-foreground/80">real</span> live games — no bots, no fake players.
      </p>
    </motion.div>
  );
}
