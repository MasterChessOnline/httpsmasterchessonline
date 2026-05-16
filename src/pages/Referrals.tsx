import { useEffect, useMemo, useState } from "react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareBar from "@/components/ShareBar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Gift, Copy, Check, Crown, Sparkles, MousePointerClick,
  UserPlus, TrendingUp, MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface Stats {
  visits: number;
  signups: number;
  first_games: number;
}

const Referrals = () => {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [stats, setStats] = useState<Stats>({ visits: 0, signups: 0, first_games: 0 });

  const origin = typeof window !== "undefined" ? window.location.origin : "https://masterchess.live";
  const refCode = user ? user.id.slice(0, 8) : null;
  const link = refCode ? `${origin}/?ref=${refCode}` : `${origin}/`;
  const inviter = profile?.display_name || profile?.username || "I";

  const defaultMessage = useMemo(
    () =>
      `♟️ ${inviter} just invited you to MasterChess — a premium home for real human chess.\n\n• Play live games & tournaments\n• Train openings, beat 9 bot personalities\n• Earn ranks Bronze → Grandmaster\n• No ads, no clutter, just chess\n\nJoin free in 10 seconds → ${link}`,
    [inviter, link]
  );

  const [message, setMessage] = useState(defaultMessage);
  useEffect(() => { setMessage(defaultMessage); }, [defaultMessage]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase.rpc as any)("my_referral_stats");
      if (data) setStats(data as Stats);
    })();
  }, [user]);

  const copy = async (text: string, kind: "link" | "msg") => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === "link") { setCopied(true); setTimeout(() => setCopied(false), 1800); }
      else { setCopiedMsg(true); setTimeout(() => setCopiedMsg(false), 1800); }
      toast.success(kind === "link" ? "Invite link copied!" : "Invite message copied!");
    } catch { toast.error("Could not copy"); }
  };

  const conversion =
    stats.visits > 0 ? Math.round((stats.signups / stats.visits) * 100) : 0;

  const statCards = [
    { icon: MousePointerClick, label: "Link visits", value: stats.visits },
    { icon: UserPlus, label: "Signups", value: stats.signups },
    { icon: TrendingUp, label: "Conversion", value: `${conversion}%` },
  ];

  const perks = [
    { icon: Crown, title: "Pioneer Badge", body: "Earn a permanent Pioneer badge on your profile when 3 friends sign up." },
    { icon: Sparkles, title: "Bonus XP", body: "Both you and your friend get +250 XP after their first 3 games." },
    { icon: Users, title: "Grow the community", body: "Real players, real rating fights. The more friends, the better the matchmaking." },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      <Seo
        title="Invite friends — MasterChess Referrals"
        description="Generate your personal invite link, share it anywhere, and track how many friends join MasterChess from your invite."
        path="/referrals"
        type="website"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">Refer & Earn</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground">
            Your invite link. <span className="text-gradient-gold">Tracked in real time.</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Generate your personal link and message, share anywhere, and watch conversions land in your dashboard.
          </p>
        </motion.div>

        {user ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mt-10">
              {statCards.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-primary/20 glass-4d p-3 sm:p-4 text-center"
                >
                  <s.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                  <div className="font-display text-xl sm:text-3xl font-black text-gradient-gold leading-none">
                    {s.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Link + message generator */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="max-w-2xl mx-auto mt-8 rounded-2xl border border-primary/20 glass-4d p-5 sm:p-6 space-y-5"
            >
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Your personal invite link
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-xs sm:text-sm break-all">
                    {link}
                  </div>
                  <button
                    onClick={() => copy(link, "link")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 transition"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" /> Invite message (edit freely)
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[140px] font-mono text-xs sm:text-sm bg-background/60"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => copy(message, "msg")}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 text-primary px-4 py-2 text-xs font-semibold hover:bg-primary/20 transition"
                  >
                    {copiedMsg ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedMsg ? "Copied" : "Copy message"}
                  </button>
                </div>
              </div>

              <ShareBar url={link} title={message.split("\n")[0]} />
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="max-w-2xl mx-auto mt-10 rounded-2xl border border-primary/20 glass-4d p-6 text-center space-y-4"
          >
            <p className="text-muted-foreground">Sign in to generate your personal invite link and track conversions.</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 transition"
            >
              Sign in to unlock
            </Link>
          </motion.div>
        )}

        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-border/40 glass-4d p-6 space-y-3"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Referrals;
