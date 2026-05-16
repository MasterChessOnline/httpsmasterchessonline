import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Crown, Rocket, Shield, Users, Radio, Trophy, Sparkles, Target,
  TrendingUp, Globe2, Zap, CheckCircle2, XCircle, Mail, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const pillars = [
  { icon: Crown, title: "Premium Brand", body: "Gold & black cinematic identity. Every screen feels like a real chess club, not a game portal. The brand itself is the moat — incumbents can't rebrand without breaking their userbase." },
  { icon: Radio, title: "Creator Native", body: "Built around streamers from day one: Streamer Mode, overlay embeds, in-site live hub (DailyChess_12), referral attribution. Creator distribution is our paid-acquisition." },
  { icon: Shield, title: "Authentic Play", body: "100% human-vs-human chess. No engine assistance, no bot farms, no fake activity, no dark patterns. Trust is the product." },
];

const diff = [
  { feature: "Premium brand identity", us: true, incumbents: false },
  { feature: "Built for streamers & overlays", us: true, incumbents: false },
  { feature: "Ad-free, no popups, no upsell walls", us: true, incumbents: false },
  { feature: "Ranks, titles, badges, skill tree", us: true, incumbents: "partial" },
  { feature: "Creator integration (DailyChess_12 baked in)", us: true, incumbents: false },
  { feature: "Referral engine with conversion tracking", us: true, incumbents: false },
  { feature: "100% authentic human play, no engine help", us: true, incumbents: "partial" },
  { feature: "Full PGN history, export, multi-language", us: true, incumbents: true },
  { feature: "Live tournaments 24/7", us: true, incumbents: true },
];

const productProof = [
  { label: "Real-time multiplayer", to: "/play/online", note: "ELO matchmaking, premove, all time controls" },
  { label: "Live tournaments", to: "/tournaments", note: "Swiss pairing, auto-start, real leaderboards" },
  { label: "Stream Hub", to: "/live", note: "DailyChess_12 viewer queue, polls, reactions" },
  { label: "Skill Tree & Missions", to: "/skill-tree", note: "XP, levels 1-100, daily missions" },
  { label: "Opening Trainer", to: "/openings", note: "Explore + Train modes on real variation trees" },
  { label: "Referral engine", to: "/referrals", note: "Personal invite + conversion tracking live" },
];

const business = [
  { title: "Premium memberships", body: "Cosmetic tiers, exclusive boards/pieces, profile flair, advanced stats. Status-driven, not feature-gating." },
  { title: "Creator revenue share", body: "Streamers earn from referred sign-ups + premium conversions. Built-in attribution already shipped." },
  { title: "Tournament sponsorships", body: "Branded arenas, sponsor-named cups, in-stream placements. Native to the platform." },
  { title: "White-label streamer overlays", body: "Embeddable rating + board widgets. SaaS pricing for creators & chess clubs." },
];

const roadmap = [
  "Paid acquisition test loops with chess creators",
  "Public ratings API + LinkedIn-shareable cards",
  "Mobile-first PWA polish for retention",
  "Premium tier launch + creator payout pilot",
  "Localization push (RU, ES, IT, FR)",
];

export default function Pitch() {
  return (
    <>
      <Helmet>
        <title>MasterChess — Investor Pitch</title>
        <meta name="description" content="A premium, creator-native chess platform for the streaming era. Why MasterChess wins where the incumbents can't." />
        <link rel="canonical" href="https://masterchess.live/pitch" />
        <meta property="og:title" content="MasterChess — Investor Pitch" />
        <meta property="og:description" content="A premium, creator-native chess platform for the streaming era." />
        <meta property="og:url" content="https://masterchess.live/pitch" />
        <meta property="og:type" content="website" />
      </Helmet>

      <main className="min-h-screen bg-background grain-texture">
        {/* HERO */}
        <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20">
          <div className="absolute inset-0 vignette pointer-events-none" />
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(43 90% 55% / 0.07), transparent 60%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="container mx-auto px-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-5">
                <Crown className="h-3 w-3" /> Investor Pitch
              </span>
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-tight">
                A premium chess brand <br />
                <span className="text-gradient-gold">for the streaming era</span>
              </h1>
              <p className="mt-5 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Chess has 600M+ players globally and a creator economy nobody is building for.
                MasterChess is the premium, creator-native home the incumbents can't ship without
                breaking their model.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/play/online">
                  <Button size="lg" className="ripple-btn h-12 px-7 font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg">
                    Play the product
                  </Button>
                </Link>
                <a href="mailto:hello@masterchess.live?subject=MasterChess%20–%20Investor%20intro">
                  <Button size="lg" variant="outline" className="h-12 px-7 rounded-xl border-border/40 hover:border-primary/40">
                    <Mail className="mr-2 h-4 w-4" /> Contact founder
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROBLEM */}
        <Section eyebrow="The Problem" icon={Target} title="The chess market is huge — and underserved at the top">
          <div className="grid sm:grid-cols-2 gap-4">
            <Card title="Cluttered incumbent" body="Ads, popups, paywalls layered over a 20-year-old UX. The brand says game portal, not chess club." />
            <Card title="Utilitarian alternative" body="Free and clean — but no brand, no creator layer, no premium identity, no reason for a sponsor or streamer to invest." />
            <Card title="No creator home" body="Twitch chess is top-20 by hours watched. Streamers have no native platform that treats them as core, not as marketing." />
            <Card title="No premium identity" body="Players who want chess to feel serious — rated, ranked, branded — have nowhere to go." />
          </div>
        </Section>

        {/* SOLUTION */}
        <Section eyebrow="The Solution" icon={Rocket} title="Three pillars, one wedge">
          <div className="grid sm:grid-cols-3 gap-4">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border border-primary/15 glass-4d p-5 sm:p-6">
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold text-foreground mb-1.5">{p.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* PRODUCT PROOF */}
        <Section eyebrow="Product" icon={Sparkles} title="Already shipped, already live">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {productProof.map((f) => (
              <Link
                key={f.label}
                to={f.to}
                className="group rounded-2xl border border-primary/15 glass-4d p-4 sm:p-5 hover:border-primary/40 transition-colors block"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold text-foreground">{f.label}</span>
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{f.note}</p>
              </Link>
            ))}
          </div>
        </Section>

        {/* DIFFERENTIATORS */}
        <Section eyebrow="Differentiators" icon={Shield} title="MasterChess vs the incumbents">
          <div className="rounded-2xl border border-primary/15 glass-4d overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] text-[11px] sm:text-sm">
              <div className="bg-primary/10 px-3 sm:px-4 py-3 font-display uppercase tracking-widest text-[10px] sm:text-xs font-bold text-foreground">Feature</div>
              <div className="bg-primary/10 px-3 sm:px-4 py-3 font-display uppercase tracking-widest text-[10px] sm:text-xs font-bold text-primary text-center">MasterChess</div>
              <div className="bg-primary/10 px-3 sm:px-4 py-3 font-display uppercase tracking-widest text-[10px] sm:text-xs font-bold text-muted-foreground text-center">Incumbents</div>
              {diff.map((row, i) => (
                <div key={row.feature} className="contents">
                  <div className={`px-3 sm:px-4 py-3 text-foreground/90 ${i % 2 ? "bg-foreground/[0.02]" : ""}`}>{row.feature}</div>
                  <div className={`px-3 sm:px-4 py-3 text-center ${i % 2 ? "bg-foreground/[0.02]" : ""}`}>
                    {row.us === true ? <CheckCircle2 className="h-4 w-4 text-primary inline" /> : <XCircle className="h-4 w-4 text-muted-foreground/50 inline" />}
                  </div>
                  <div className={`px-3 sm:px-4 py-3 text-center ${i % 2 ? "bg-foreground/[0.02]" : ""}`}>
                    {row.incumbents === true ? (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground inline" />
                    ) : row.incumbents === "partial" ? (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">partial</span>
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/40 inline" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* MARKET */}
        <Section eyebrow="Market" icon={Globe2} title="Tailwinds we ride, not fight">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { v: "600M+", l: "Global chess players" },
              { v: "Top 20", l: "Twitch category by hours" },
              { v: "+125%", l: "Post-Gambit interest, sustained" },
              { v: "0", l: "Premium creator-native rivals" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-4 text-center glass-4d">
                <div className="font-display text-xl sm:text-3xl font-black text-gradient-gold leading-none">{s.v}</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-1.5">{s.l}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* BUSINESS MODEL */}
        <Section eyebrow="Business Model" icon={TrendingUp} title="Multiple revenue surfaces, none of them ads">
          <div className="grid sm:grid-cols-2 gap-3">
            {business.map((b) => (
              <div key={b.title} className="rounded-2xl border border-primary/15 glass-4d p-5">
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground mb-1.5">{b.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* TRACTION-READY */}
        <Section eyebrow="Traction-ready" icon={Zap} title="Instrumented from day one">
          <div className="rounded-2xl border border-primary/15 glass-4d p-5 sm:p-6">
            <ul className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-foreground/90">
              {[
                "Referral attribution: personal link → visit → signup → first game",
                "Daily challenges & missions driving day-1 / day-7 retention",
                "ELO + rank progression as built-in reason to come back",
                "Streamer overlays = native creator distribution loop",
                "Tournament cadence: 24/7 lobbies, low cost to scale",
                "Full PGN + analytics base for product decisions",
              ].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> <span>{t}</span></li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ROADMAP */}
        <Section eyebrow="Next 90 Days" icon={Trophy} title="Where the money goes">
          <div className="rounded-2xl border border-primary/15 glass-4d p-5 sm:p-6">
            <ol className="space-y-3">
              {roadmap.map((r, i) => (
                <li key={r} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center font-display text-xs font-bold text-primary">{i + 1}</span>
                  <span className="text-sm text-foreground/90 leading-relaxed pt-0.5">{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* VISION */}
        <Section eyebrow="Vision" icon={Users} title="What MasterChess becomes">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 text-center">
            <p className="font-display text-base sm:text-xl text-foreground/95 leading-relaxed max-w-2xl mx-auto italic">
              "Chess deserves a home that feels as serious as the game itself —
              premium, honest, and built for the people who actually broadcast it."
            </p>
            <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">— MasterChess</p>
          </div>
        </Section>

        {/* CTA */}
        <section className="px-5 pb-20">
          <div className="max-w-3xl mx-auto rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent p-7 sm:p-10 text-center">
            <h3 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-3">
              Let's build the premium chess brand together.
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mb-5">
              Try the live product, then let's talk distribution, creators, and scaling.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/play/online">
                <Button size="lg" className="ripple-btn h-12 px-7 font-display uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-glow-lg">
                  Play the product
                </Button>
              </Link>
              <a href="mailto:hello@masterchess.live?subject=MasterChess%20–%20Investor%20intro">
                <Button size="lg" variant="outline" className="h-12 px-7 rounded-xl border-border/40 hover:border-primary/40">
                  <Mail className="mr-2 h-4 w-4" /> Contact founder
                </Button>
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

function Section({
  eyebrow, title, icon: Icon, children,
}: { eyebrow: string; title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="px-5 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-3">
            <Icon className="h-3 w-3" /> {eyebrow}
          </span>
          <h2 className="font-display text-xl sm:text-3xl font-black text-foreground tracking-tight">{title}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-primary/15 glass-4d p-5">
      <h3 className="font-display text-sm sm:text-base font-bold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
