import { ArrowRight, Crown, Sword, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import chessKingBg from "@/assets/chess-king-closeup.jpg";

const CallToActionSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative py-28 overflow-hidden grain-texture">
      {/* King piece background image */}
      <img src={chessKingBg} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" style={{ opacity: 0.06, filter: "brightness(0.3) saturate(0.5)" }} />
      {/* Dramatic cinematic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
      <div className="absolute inset-0 vignette pointer-events-none" />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.05), transparent 60%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(30 60% 40% / 0.03), transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], x: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="container mx-auto px-6 relative">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Floating crown with 3D depth */}
          <motion.div
            className="mx-auto mb-8 w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-glow-lg"
            animate={{ y: [0, -10, 0], rotateY: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Crown className="h-10 w-10 text-primary" style={{ filter: "drop-shadow(0 0 12px hsl(43 90% 55% / 0.3))" }} />
          </motion.div>

          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl mb-6" style={{ textShadow: "0 2px 30px hsl(30 8% 2% / 0.5)" }}>
            Ready to Become a <br />
            <span className="text-gradient-gold">Chess Master</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of players already improving their game. 
            It's completely free — no credit card, no hidden fees.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={user ? "/play/online" : "/signup"}>
              <Button size="lg" className="btn-neon bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-lg font-bold shadow-glow-lg group animate-glow-pulse relative overflow-hidden shimmer">
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <span className="relative z-10 flex items-center">
                  <Sword className="mr-2 h-5 w-5" />
                  {user ? "Play Now" : "Create Free Account"}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="outline" className="border-foreground/20 text-foreground hover:bg-foreground/5 px-8 text-base backdrop-blur-md glass-border">
                <Sparkles className="mr-2 h-4 w-4" /> Explore Features
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <motion.div
            className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <span>✓ 100% Free</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>✓ No Ads</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>✓ Stockfish Analysis</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>✓ Daily Tournaments</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;
