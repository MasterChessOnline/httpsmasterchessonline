import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Ban, Users, Scale, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const FairPlay = () => {
  const pillars = [
    {
      icon: Ban,
      title: "No engines in human play",
      body: "Engine assistance (Stockfish, GPT, any AI) is strictly forbidden in player-vs-player games. AI is only allowed in Bots and Lessons.",
    },
    {
      icon: Eye,
      title: "Manual review, not eval bars",
      body: "We never show engine evaluation during a live human game. Suspicious matches are reviewed manually by our team, post-game only.",
    },
    {
      icon: Users,
      title: "Authentic community",
      body: "Zero ghost players, zero simulated activity, zero fake numbers. Every game, rating, and stat you see is from a real person.",
    },
    {
      icon: Scale,
      title: "Transparent ELO",
      body: "Standard ELO with public formula. Rating changes are logged in your history — verify any game, any time.",
    },
    {
      icon: Lock,
      title: "Your data, your account",
      body: "Encrypted accounts, no ads, no third-party tracking. We don't sell data. Ever.",
    },
    {
      icon: ShieldCheck,
      title: "Report in one click",
      body: "Spot something off? Report any game or player from their profile. We investigate every report.",
    },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col">
      <Seo
        title="Fair Play & Trust — MasterChess"
        description="How MasterChess keeps human chess authentic: no engines in PvP, manual review, transparent ELO, zero fake data."
        path="/fair-play"
        type="website"
      />
      <Navbar />
      <main className="flex-1">
        <section className="py-20 sm:py-28 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-wider uppercase text-primary">
                Fair Play Policy
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              Built on real chess. Played by real people.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              MasterChess exists because online chess deserves better than bots
              pretending to be humans and engines hiding behind usernames. Here
              is exactly how we keep it honest.
            </p>
          </motion.div>
        </section>

        <section className="pb-24 container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto mt-16 rounded-2xl border border-primary/20 glass-4d p-8 text-center space-y-4"
          >
            <Mail className="h-6 w-6 text-primary mx-auto" />
            <h2 className="font-display text-2xl font-bold text-foreground">
              See something? Tell us.
            </h2>
            <p className="text-muted-foreground">
              Suspected cheating, abuse, or a bug in our fairness system —
              every report is read by a human.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Link
                to="/about"
                className="px-5 py-2.5 rounded-lg border border-border hover:border-primary/40 text-sm font-semibold transition"
              >
                About MasterChess
              </Link>
              <Link
                to="/community"
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
              >
                Report on a profile
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FairPlay;
