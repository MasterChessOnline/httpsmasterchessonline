import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, Download, ExternalLink, Sparkles, Shield, Radio, Users } from "lucide-react";
import { motion } from "framer-motion";

const facts: { label: string; value: string }[] = [
  { label: "Launched", value: "2024" },
  { label: "Headquarters", value: "Online · Global" },
  { label: "Category", value: "Online Chess Platform" },
  { label: "Featured Creator", value: "DailyChess_12" },
  { label: "Core Tech", value: "Stockfish · React · Supabase" },
  { label: "Pricing", value: "100% Free Forever" },
];

const pillars = [
  { icon: Shield, title: "Authentic human play", body: "Zero AI in live games, zero fake data, zero ghost players." },
  { icon: Radio, title: "Streamer-first design", body: "Distraction-free Streamer Mode, overlay-ready embeds, live YouTube integration." },
  { icon: Users, title: "Tournament-grade", body: "Swiss & arena formats, ELO matchmaking, live leaderboards, automated pairings." },
  { icon: Sparkles, title: "Premium without paywalls", body: "Stockfish analysis, opening trainer, bots — every feature, every user, no tiers." },
];

export default function Press() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Press Kit — MasterChess"
        description="Press kit, brand assets, fact sheet and media contact for MasterChess — the streamer-first online chess platform."
        canonical="https://masterchess.live/press"
      />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3 font-display">For Press & Creators</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            MasterChess <span className="text-primary">Press Kit</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            Brand assets, factsheet and contact details for media outlets, podcasts, YouTubers and streamers covering MasterChess.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button asChild>
              <a href="mailto:press@masterchess.live" className="gap-2">
                <Mail className="h-4 w-4" /> press@masterchess.live
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/og-image.jpg" download className="gap-2">
                <Download className="h-4 w-4" /> Logo / hero image
              </a>
            </Button>
          </div>
        </motion.section>

        {/* Story */}
        <section className="grid md:grid-cols-2 gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-primary/15 glass-4d p-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-3">Our story</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              MasterChess started with one frustration — the biggest chess sites had become noisy, slow and bloated with paywalls.
              We rebuilt the experience around three principles: <span className="text-foreground">authentic human play</span>,
              <span className="text-foreground"> streamer-friendly UX</span>, and{" "}
              <span className="text-foreground">premium features at zero cost</span>.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-primary/15 glass-4d p-6"
          >
            <h2 className="font-display text-lg font-bold text-foreground mb-3">What makes us different</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We collaborate exclusively with <strong className="text-primary">DailyChess_12</strong>, integrate live YouTube streams into our hub,
              and ship features like Streamer Mode and OBS-ready overlays before they're even requested. Every game stays pure — no AI hints,
              no eval bars, no shortcuts.
            </p>
          </motion.div>
        </section>

        {/* Factsheet */}
        <section className="mb-14">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Factsheet</h2>
          <div className="rounded-2xl border border-primary/15 glass-4d overflow-hidden">
            {facts.map((f, i) => (
              <div
                key={f.label}
                className={`grid grid-cols-[1fr_2fr] px-4 sm:px-6 py-3 text-sm ${i > 0 ? "border-t border-border/30" : ""}`}
              >
                <span className="text-muted-foreground font-medium uppercase tracking-wider text-[11px]">{f.label}</span>
                <span className="text-foreground">{f.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Pillars */}
        <section className="mb-14">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Editorial angles</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border border-primary/15 glass-4d p-4"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <p.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-display text-sm font-bold text-foreground mb-1">{p.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Brand */}
        <section className="mb-14">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Brand colors</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Gold", hex: "#D4AF37", className: "bg-[#D4AF37]" },
              { name: "Black", hex: "#0B0B0D", className: "bg-[#0B0B0D]" },
              { name: "Cream", hex: "#F5F0E0", className: "bg-[#F5F0E0]" },
              { name: "Deep Wine", hex: "#3B0E0E", className: "bg-[#3B0E0E]" },
            ].map((c) => (
              <div key={c.name} className="rounded-xl border border-border/30 overflow-hidden">
                <div className={`h-20 ${c.className}`} />
                <div className="px-3 py-2 bg-card/60">
                  <p className="text-xs font-display font-bold text-foreground">{c.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="mb-12">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Useful links</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { to: "/about", label: "About MasterChess" },
              { to: "/fair-play", label: "Fair Play Policy" },
              { to: "/live", label: "Stream Hub" },
              { to: "/leaderboard", label: "Live Leaderboard" },
            ].map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center justify-between rounded-xl border border-primary/15 glass-4d px-4 py-3 hover:border-primary/40 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{l.label}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="rounded-2xl border border-primary/30 glass-4d p-6 sm:p-8 text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Need an interview or quote?</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            We reply to press requests within 24 hours.
          </p>
          <Button asChild className="mt-5">
            <a href="mailto:press@masterchess.live" className="gap-2">
              <Mail className="h-4 w-4" /> press@masterchess.live
            </a>
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
