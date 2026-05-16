import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Manifesto() {
  return (
    <section className="relative my-16 -mx-4 sm:mx-0 overflow-hidden rounded-none sm:rounded-3xl border-y sm:border border-primary/20 bg-gradient-to-br from-background via-primary/[0.04] to-background py-16 sm:py-24 px-6">
      {/* Ambient gold orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.08), transparent 65%)" }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6"
        >
          The MasterChess Manifesto
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-foreground"
        >
          Chess deserves better than{" "}
          <span className="text-muted-foreground/60 line-through decoration-primary/40">
            ads, popups
          </span>{" "}
          and{" "}
          <span className="text-muted-foreground/60 line-through decoration-primary/40">
            bot farms
          </span>
          .
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-6 leading-tight"
        >
          <span className="text-gradient-gold">MasterChess is chess</span>
          <br className="hidden sm:block" />
          <span className="text-foreground"> the way it should feel.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground"
        >
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5">Premium.</span>
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5">Honest.</span>
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5">Alive.</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10"
        >
          <Link to="/signup">
            <Button size="lg" className="ripple-btn h-14 px-8 font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg text-base">
              Claim your seat <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
