import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Copy, Check, Swords, Share2, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Challenge = () => {
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [selectedTime, setSelectedTime] = useState("5+0");
  const [xpWager, setXpWager] = useState(50);

  const challengeId = user ? btoa(`${user.id}-${Date.now()}`).slice(0, 12) : "demo";
  const challengeUrl = `${window.location.origin}/play/online?challenge=${challengeId}&time=${selectedTime}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(challengeUrl);
    setCopied(true);
    toast({ title: "Link copied!", description: "Send the link to a friend to challenge them!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile?.display_name || "Player"} challenges you to chess!`,
        text: `Can you beat me? Let's play a ${selectedTime} game for ${xpWager} XP!`,
        url: challengeUrl,
      });
    } else {
      handleCopy();
    }
  };

  const timeOptions = ["1+0", "3+0", "5+0", "10+0", "15+10"];
  const xpOptions = [25, 50, 100, 200];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
            <span className="text-gradient-gold">1v1 Challenge</span>
          </h1>
          <p className="text-muted-foreground">Challenge anyone to a chess match. Share the link and prove you're the best!</p>
        </motion.div>

        <div className="max-w-lg mx-auto space-y-6">
          {/* Challenge Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 space-y-6"
          >
            {/* Your info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center shadow-glow">
                <Swords className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-foreground">
                  {profile?.display_name || "Player"}
                </p>
                <p className="text-sm text-muted-foreground">
                  ELO {profile?.rating || 1200} · {profile?.games_won || 0} wins
                </p>
              </div>
            </div>

            {/* Time control */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Time Control</p>
              <div className="flex gap-2 flex-wrap">
                {timeOptions.map(tc => (
                  <button
                    key={tc}
                    onClick={() => setSelectedTime(tc)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium border transition-all ${
                      selectedTime === tc
                        ? "border-primary bg-primary/15 text-primary shadow-glow"
                        : "border-border/40 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {tc}
                  </button>
                ))}
              </div>
            </div>

            {/* XP Wager */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                <Zap className="h-3 w-3 inline mr-1" />XP Wager
              </p>
              <div className="flex gap-2 flex-wrap">
                {xpOptions.map(xp => (
                  <button
                    key={xp}
                    onClick={() => setXpWager(xp)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold border transition-all ${
                      xpWager === xp
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/40 text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {xp} XP
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Winner gets {xpWager} XP bonus!</p>
            </div>

            {/* Challenge message preview */}
            <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
              <p className="text-sm text-foreground font-medium mb-1">
                ⚔️ {profile?.display_name || "Player"} te izaziva!
              </p>
              <p className="text-xs text-muted-foreground">
                Format: {selectedTime} · Nagrada: {xpWager} XP · ELO: {profile?.rating || 1200}
              </p>
            </div>

            {/* Challenge link */}
            <div className="rounded-xl border border-primary/20 bg-card/80 p-3 flex items-center gap-2">
              <input
                readOnly
                value={challengeUrl}
                className="flex-1 bg-transparent text-xs text-muted-foreground font-mono truncate outline-none"
              />
              <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button onClick={handleCopy} className="flex-1" size="lg">
                <Copy className="mr-2 h-4 w-4" /> Copy Link
              </Button>
              <Button onClick={handleShare} variant="outline" size="lg" className="flex-1">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </motion.div>

          {/* How it works */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">How it works</h3>
            <div className="space-y-2.5">
              {[
                { step: "1", text: "Choose time control and XP wager" },
                { step: "2", text: "Copy or share the challenge link" },
                { step: "3", text: "Your opponent opens the link and joins" },
                { step: "4", text: "Winner takes the XP bonus! 🏆" },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{s.step}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent challenges placeholder */}
          <div className="rounded-xl border border-border/40 bg-card/60 p-5">
            <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Recent Challenges
            </h3>
            <p className="text-sm text-muted-foreground text-center py-4">
              No challenges yet. Create your first one above! 🎯
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Challenge;
