// Homepage / landing page supporter CTA. No paywall framing — just a soft
// "tip the project" card. Routes to /supporter for the full checkout flow.
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Coffee, Sparkles, Crown } from "lucide-react";
import DonationProgressBar from "@/components/DonationProgressBar";

const QUICK_TIPS = [
  { amount: 3, label: "Coffee", icon: Coffee },
  { amount: 10, label: "Gold", icon: Sparkles },
  { amount: 25, label: "Legend", icon: Crown },
];

export default function SupporterCTA() {
  return (
    <section className="py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-amber-500/5 via-background/60 to-background/40 backdrop-blur-sm p-7 sm:p-9 text-center relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, hsl(43 90% 55% / 0.15), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-widest text-primary mb-4">
            <Heart className="h-3 w-3" /> No paywall, ever
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Keep MasterChess alive
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Built by Nikola, 13, after school. No ads, no premium walls. If the
            site helped you, tip whatever feels right — every dollar goes to
            servers and new features.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {QUICK_TIPS.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.label}
                  to={`/supporter?tier=${t.label.toLowerCase()}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm font-medium hover:border-primary/60 hover:bg-primary/10 transition-colors"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{t.label}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-semibold">${t.amount}</span>
                </Link>
              );
            })}
            <Link
              to="/supporter"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Custom amount →
            </Link>
          </div>

          <p className="mt-5 text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Secure checkout · Stripe · One-time tip, no subscription
          </p>
        </div>
      </motion.div>
    </section>
  );
}
