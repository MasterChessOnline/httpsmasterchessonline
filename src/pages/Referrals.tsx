import { useEffect, useState } from "react";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareBar from "@/components/ShareBar";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Gift, Copy, Check, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

const Referrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState("https://masterchess.live/");

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://masterchess.live";
    setLink(user ? `${base}/?ref=${user.id.slice(0, 8)}` : `${base}/`);
  }, [user]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  const perks = [
    { icon: Crown, title: "Pioneer Badge", body: "Earn a permanent Pioneer badge on your profile when 3 friends sign up." },
    { icon: Sparkles, title: "Bonus XP", body: "Both you and your friend get +250 XP after their first 3 games." },
    { icon: Users, title: "Grow the community", body: "Real players. Real rating fights. The more friends, the better the matchmaking." },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      <Seo
        title="Invite friends — MasterChess Referrals"
        description="Invite friends to MasterChess. Earn the Pioneer badge, XP bonuses, and grow the most authentic chess community online."
        path="/referrals"
        type="website"
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">
              Refer & Earn
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
            Bring your friends. Earn the Pioneer crown.
          </h1>
          <p className="text-muted-foreground text-lg">
            Every friend you invite makes MasterChess better — more games, fairer
            matchmaking, more real chess.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-2xl mx-auto mt-10 rounded-2xl border border-primary/20 glass-4d p-6 space-y-4"
        >
          {user ? (
            <>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Your invite link
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 rounded-lg border border-border bg-background/60 px-4 py-3 font-mono text-sm break-all">
                  {link}
                </div>
                <button
                  onClick={copy}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 transition"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <ShareBar url={link} title="Play real chess with me on MasterChess — free tournaments, bots, openings & analysis." />
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                Sign in to get your personal invite link.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:opacity-90 transition"
              >
                Sign in to unlock
              </Link>
            </div>
          )}
        </motion.div>

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
              <h3 className="font-display text-lg font-bold text-foreground">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Referrals;
