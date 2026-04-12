import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Rocket, Sparkles, Bell, Zap, Crown, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const ComingSoon = () => {
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    setNotified(true);
    toast({ title: "🔔 You're on the list!", description: "We'll notify you when new features launch." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-20 max-w-3xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated icon */}
          <motion.div
            className="relative mx-auto w-24 h-24 mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 rounded-full bg-primary/15 animate-ping opacity-20" />
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-[0_0_40px_hsl(43_90%_55%/0.15)]">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                <Rocket className="h-10 w-10 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Coming Soon
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
            New <span className="text-gradient-gold">Features</span> Are Coming
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-3">
            We're building exciting new features to make MasterChess even better.
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-md mx-auto mb-10">
            Stay tuned — big things are on the way.
          </p>

          {/* Notify button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Button
              size="lg"
              onClick={handleNotify}
              disabled={notified}
              className={`relative overflow-hidden font-semibold px-8 h-12 ${
                notified
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_hsl(43_90%_55%/0.25)]"
              }`}
            >
              {!notified && (
                <span className="absolute inset-0 -translate-x-full animate-[sweepHeader_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              )}
              <Bell className="h-4 w-4 mr-2" />
              {notified ? "You'll Be Notified" : "Notify Me When It Launches"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature teasers */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: Crown, title: "Premium Content", desc: "Exclusive training from top players" },
            { icon: Target, title: "New Game Modes", desc: "Fresh ways to play and compete" },
            { icon: Zap, title: "Advanced Tools", desc: "Powerful analysis and learning tools" },
          ].map((f) => (
            <div key={f.title} className="text-center p-6 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm">
              <f.icon className="h-6 w-6 text-primary mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ComingSoon;
