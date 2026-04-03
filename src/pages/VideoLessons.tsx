import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Play, Bell, Sparkles, Star, Crown, BookOpen, Target, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PREVIEW_CARDS = [
  { title: "Sicilian Defense Masterclass", level: "Advanced", duration: "45 min", category: "Openings" },
  { title: "Endgame Essentials", level: "Beginner", duration: "30 min", category: "Endgames" },
  { title: "Tactical Patterns Vol. 1", level: "Intermediate", duration: "35 min", category: "Tactics" },
  { title: "Positional Chess Secrets", level: "Advanced", duration: "50 min", category: "Strategy" },
  { title: "King's Indian Attack", level: "Intermediate", duration: "40 min", category: "Openings" },
  { title: "Pawn Structure Mastery", level: "Beginner", duration: "25 min", category: "Strategy" },
];

const VideoLessons = () => {
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    setNotified(true);
    toast({
      title: "🔔 You're on the list!",
      description: "We'll notify you as soon as Video Lessons launch.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated Lock Icon */}
          <motion.div
            className="relative mx-auto w-24 h-24 mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" />
            <div className="absolute inset-2 rounded-full bg-primary/10 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.15)]">
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Lock className="h-10 w-10 text-primary" />
              </motion.div>
            </div>
          </motion.div>

          <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 text-xs tracking-wider uppercase">
            <Sparkles className="w-3 h-3 mr-1" /> Coming Soon
          </Badge>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Video <span className="text-gradient-gold">Lessons</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            High-quality chess lessons from beginner to advanced levels are on the way.
          </p>
          <p className="text-sm text-muted-foreground/60 max-w-lg mx-auto mb-8">
            Master openings, tactics, endgames, and strategy with curated video content from top-level players.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={handleNotify}
              disabled={notified}
              className={`relative overflow-hidden font-semibold text-sm px-8 h-12 ${
                notified
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
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

        {/* Blurred Preview Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold text-foreground/80" style={{ fontFamily: "var(--font-display)" }}>
              Preview What's Coming
            </h2>
            <p className="text-xs text-muted-foreground mt-1">A taste of the premium content in development</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PREVIEW_CARDS.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.08 }}
                className="relative group"
              >
                <div className="relative rounded-xl overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm">
                  {/* Fake thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-muted/80 via-muted to-muted/60 relative overflow-hidden">
                    {/* Chess pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.06]" style={{
                      backgroundImage: `repeating-conic-gradient(hsl(var(--foreground)) 0% 25%, transparent 0% 50%)`,
                      backgroundSize: '24px 24px',
                    }} />
                    {/* Center play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                        <Play className="h-5 w-5 text-primary/60 fill-primary/30" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 bg-background/70 text-foreground/60 text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                      {card.duration}
                    </span>
                    {/* Blur overlay */}
                    <div className="absolute inset-0 backdrop-blur-[2px] bg-background/10" />
                  </div>

                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        card.level === "Beginner" ? "bg-accent/20 text-accent-foreground" :
                        card.level === "Intermediate" ? "bg-primary/20 text-primary" :
                        "bg-destructive/20 text-destructive"
                      }`}>
                        {card.level}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{card.category}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground/80 line-clamp-1">{card.title}</h3>
                  </div>

                  {/* Lock overlay on hover */}
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-xl">
                    <div className="text-center">
                      <Lock className="h-6 w-6 text-primary mx-auto mb-1" />
                      <p className="text-xs font-medium text-primary">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Teasers */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {[
            { icon: Crown, title: "GM-Level Content", desc: "Lessons crafted by titled players" },
            { icon: Target, title: "Interactive Quizzes", desc: "Test your understanding in real-time" },
            { icon: Star, title: "Progress Tracking", desc: "Track your improvement over time" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm"
            >
              <feature.icon className="h-6 w-6 text-primary mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoLessons;
